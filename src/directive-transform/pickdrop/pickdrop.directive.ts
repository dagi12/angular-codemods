import { IToastrService } from 'angular-toastr';
import { prepareDate, verifyPeselBirthDate } from 'flota-web-client-common/src/Service/DateService';
import { addToObjectWithPrefix } from 'flota-web-client-common/src/Service/Util';
import { ModalService } from '@common/common-services/modal/modal.service';
import StaticConfig from 'src/app/initialization/static-config';
import { PickdropHintControllerApi, RentcarBufferDTO, RentExt } from 'src/zamowienia-openapi';
import { ClientFieldService } from '../rentcar/common/util/client-field.service';
import { RENT_STATUS } from '@app/rentcar/common/ui/rent-status/rent-status.component';

const basicVerify = ($scope, model) => {
  if (($scope.parent.dropoffMode && !model.wyImie) || ($scope.parent.pickupMode && !model.zdImie)) {
    return 'Podaj imię kierowcy.';
  }
  if (
    ($scope.parent.dropoffMode && !model.wyNazwisko) ||
    ($scope.parent.pickupMode && !model.zdNazwisko)
  ) {
    return 'Podaj nazwisko kierowcy.';
  }

  if (
    StaticConfig.configuration.logicConfig.requiredPhonePesel &&
    (($scope.parent.dropoffMode && !model.wyNrTelef) ||
      ($scope.parent.pickupMode && !model.zdNrTelef))
  ) {
    return 'Podaj nr telefonu kierowcy.';
  }
  if (
    ($scope.parent.dropoffMode && !model.wyEmail) ||
    ($scope.parent.pickupMode && !model.zdEmail)
  ) {
    return 'Podaj adres email.';
  }
};

function advancedVerify($scope, model, idAndPesel) {
  if (idAndPesel) {
    if (
      ($scope.parent.dropoffMode && !model.wyPesel) ||
      ($scope.parent.pickupMode && !model.zdPesel)
    ) {
      return 'Podaj nr PESEL kierowcy.';
    }
    if (
      ($scope.parent.dropoffMode &&
        model.wyDataUr &&
        model.wyDataUr instanceof Date &&
        !verifyPeselBirthDate(model.wyDataUr, model.wyPesel)) ||
      ($scope.parent.pickupMode &&
        model.zdDataUr &&
        model.zdDataUr instanceof Date &&
        !verifyPeselBirthDate(model.zdDataUr, model.zdPesel))
    ) {
      return 'Data urodzenia nie odpowiada podanemu nr PESEL';
    }
  }
  if (
    ($scope.parent.dropoffMode && !model.wyPrawoJazdNr) ||
    ($scope.parent.pickupMode && !model.zdPrawoJazdNr)
  ) {
    return 'Podaj nr prawa jazdy kierowcy.';
  }
}

export /*@ngInject*/ function PickdropDirective() {
  return {
    scope: false,
    controller: /*@ngInject*/ function (
      $scope,
      $state,
      clientFieldService: ClientFieldService,
      modalService: ModalService,
      pickdropHintControllerApi: PickdropHintControllerApi,
      toastr: IToastrService
    ) {
      $scope.wizardCallback = ({ wizard }) => {return ($scope.parent.wizardManager = wizard)};

      $scope.parent = {};
      $scope.parent.rentcar = rentToBuffer($scope.$resolve.rentcar.data);
      const idAndPesel = StaticConfig.configuration.fieldConfig.idAndPesel;

      $scope.driverVerification = () =>
        {return basicVerify($scope, $scope.parent.rentcar) ||
        advancedVerify($scope, $scope.parent.rentcar, idAndPesel)};

      $scope.clearUnused = function () {
        if (!$scope.parent.wyPlanUKl) {
          delete $scope.parent.rentcar.wyjazdData;
          delete $scope.parent.rentcar.wyjazdLicznik;
          delete $scope.parent.rentcar.wyjazdPaliwo;
          delete $scope.parent.rentcar.wyPlanUKlMiejsce;
        }
        if (!$scope.parent.zdPlanUKl) {
          delete $scope.parent.rentcar.powrotData;
          delete $scope.parent.rentcar.powrotLicznik;
          delete $scope.parent.rentcar.powrotPaliwo;
          delete $scope.parent.rentcar.zdPlanUKlMiejsce;
        }
      };

      const model = $scope.parent.rentcar;
      pickdropHintControllerApi
        .getHintsUsingPOST({
          carId: model.pojazdId,
          rentId: model.rentId
        })
        .then(response => {
          function processDatecounterHints() {
            const hintModel = response.data.carHint;
            const counter = hintModel.counter;
            const fuel = hintModel.fuelPercentage;
            model.wyjazdLicznik = counter;
            model.wyStanLicz = counter;

            model.wyjazdPaliwo = fuel;
            model.wyStanPal = fuel;
            $scope.parent.fuelType = hintModel.fuelType;
            $scope.parent.fuelLimit = hintModel.fuelLimit;
          }

          function processDriverHints() {
            const driver = response.data.driverHint;
            $scope.parent.klientNazwa = driver.klientNazwa;
            $scope.parent.nrTelef = driver.nrTelef;
            addToObjectWithPrefix(
              $scope.parent.dropoffMode ? 'wy' : 'zd',
              response.data.driverHint,
              model
            );
          }

          processDatecounterHints();
          processDriverHints();
        });

      $scope.clearAndRedirect = function () {
        $scope.parent.wizardManager.goFirstStepResolve();
      };

      $scope.pickdropSuccess = function (rentcarItem) {
        $state.go('main.preview.reservation', { id: rentcarItem.rentId, attachment: true });
        toastr.info($scope.parent.doneStatement);
        $scope.$destroy();
      };

      $scope.wyEmailChange = ({ email }) => {return ($scope.parent.rentcar.wyEmail = email)};

      $scope.zdEmailChange = ({ email }) => {return ($scope.parent.rentcar.zdEmail = email)};
    },
    template: '<div id="pickdrop-form-views" ui-view></div>'
  };
}

export function rentToBuffer(rent: RentExt): Partial<RentcarBufferDTO> {
  const buffer: Partial<RentcarBufferDTO> = { ...rent };

  buffer.wyPlanUKl = rent.wydPlanUKl;
  buffer.wyPlanData = prepareDate(rent.wydPlanData);
  buffer.wyjazdData = prepareDate(buffer.wyPlanData);

  buffer.wyPlanMiejsce = rent.wydPlanMiejsce;
  buffer.wyPlanUKlMiejsce = rent.wydPlanUKlMiejsce;

  buffer.zdPlanData = prepareDate(rent.dataPlan);

  buffer.wyFaktMiejsce = buffer.wyPlanMiejsce;
  buffer.wyFaktUKlMiejsce = buffer.wyPlanUKlMiejsce;

  buffer.zdFaktMiejsce = buffer.zdPlanMiejsce;
  buffer.zdFaktUKlMiejsce = buffer.zdPlanUKlMiejsce;

  buffer.wyFaktData = prepareDate(buffer.wyPlanData);

  if (rent.status === RENT_STATUS.WYDANY) {
    buffer.zdFaktData = prepareDate(buffer.zdPlanData);
    buffer.zdUwagi = rent.uwagiWy;
    buffer.wyFaktData = prepareDate(rent.dataWy);
    buffer.powrotData = prepareDate(buffer.zdFaktData);
  }

  buffer.wyUwagi = rent.wydPlanUwagi;
  buffer.wydPlanUwagi = rent.wydPlanUwagi;

  return buffer;
}
