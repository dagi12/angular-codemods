import { flotaBool } from 'flota-web-client-common/src/Util/FlotaUtil2';
import { ApplicationConfigService } from '@common/common-services/application-config.service';
import { ModalService } from '@common/common-services/modal/modal.service';
import { VerificationService } from '@common/common-services/verification.service';
import { PickupControllerApi } from 'src/zamowienia-openapi';
import template from './pickup-wizard.html';
import { ITimeoutService } from 'angular';
import { PICKUP_STEPS } from '@app/pickdrop/common/pickdrop-common.module';

export const verifyPickup = $scope => {
  const model = $scope.parent.rentcar;
  if (!model.zdFaktMiejsce) {
    return 'Podaj miejsce powrotu do wypożyczalni.';
  }

  if (!model.powrotData) {
    return 'Podaj datę powrotu do wypożyczalni.';
  }
  if (model.powrotData.getTime() < model.zdFaktData.getTime()) {
    return 'Data powrotu do wypożyczalni musi być większa niż data odbioru od klienta';
  }

  if (!model.powrotLicznik) {
    return 'Podaj stan licznika przy powrocie do wypożyczalni.';
  }
  if (model.powrotLicznik < model.zdStanLicz) {
    return 'Stan licznika powrotu do wypożyczalni musi być większy niż licznik odbioru od klienta.';
  }

  if (!model.powrotPaliwo) {
    return 'Podaj stan paliwa przy powrocie do wypożyczalni.';
  }
  if (model.powrotPaliwo > 100) {
    return 'Stan paliwa przy powrocie do wypożyczalni nie może być większy niż 100%';
  }
};

export /*@ngInject*/ function PickupWizard() {
  return {
    scope: false,
    controller: /*@ngInject*/ function (
      $scope,
      applicationConfigService: ApplicationConfigService,
      modalService: ModalService,
      verificationService: VerificationService,
      $timeout: ITimeoutService,
      pickupControllerApi: PickupControllerApi
    ) {
      $scope.parent.pickupMode = true;
      $scope.parent.doneStatement = 'Samochód zdano';
      $scope.parent.doneState = 'main.historicReservations';
      $scope.parent.prefix = 'zd';

      if (flotaBool($scope.parent.rentcar.zdPlanUKl)) {
        $timeout(() => {
          $scope.parent.wizardManager.setStep('/car-rental', true);
          $scope.parent.wizardManager.setVerification('/driver', $scope.driverVerification);
        });
      }

      $scope.steps = PICKUP_STEPS;

      $scope.parent.handleErrorMessage = 'Zdanie samochodu nie powiodło się';
      $scope.add = function () {
        const verifyFn =
          $scope.parent.wizardManager.lastStep().name === '/driver'
            ? $scope.driverVerification
            : () => {return verifyPickup($scope)};

        if (verificationService.verify(verifyFn)) {
          $scope.clearUnused();
          pickupControllerApi
            .pickupReservationUsingPOST({
              reservation: $scope.parent.rentcar
            })
            .then(response => {
              $scope.pickdropSuccess(response.data);
            });
        }
      };
    },
    template
  };
}
