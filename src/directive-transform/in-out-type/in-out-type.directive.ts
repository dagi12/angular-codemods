import { ZamGlobalsService } from "@app/config/zam-globals.service";
import { RENTCAR_TYPE } from "@app/grid/reservation-columns";
import { ModalService } from "@common/common-services/modal/modal.service";
import { SessionService } from "@common/common-services/session.service";
import { RawParams } from "@uirouter/angularjs";
import { IToastrService } from "angular-toastr";
import StaticConfig from "src/app/initialization/static-config";
import template from "./in-out-type.html";

const MSG =
  "Tylko pracownik może dodać wydanie wewnętrzne. Zmień rodzaj wydania w konfiguracji systemu FLOTA";

function initInOut(
  scope: any,
  sessionService: SessionService,
  $stateParams: RawParams,
  zamGlobals: ZamGlobalsService
) {
  const auth = sessionService.netUser.auth;

  const rentalTypeActionStore = {
    IN: () => {
      if (auth !== "PRAC") {
        scope.globalError(MSG);
      }
      if (!zamGlobals.rentcarItem.zamRodzaj) {
        zamGlobals.rentcarItem.zamRodzaj = RENTCAR_TYPE.IN;
      }
      scope.hideSelect = true;
    },
    OUT: () => {
      if (!zamGlobals.rentcarItem.zamRodzaj) {
        zamGlobals.rentcarItem.zamRodzaj = RENTCAR_TYPE.OUT;
      }
      scope.hideSelect = true;
    },
    INOUT: () => {
      if (!zamGlobals.rentcarItem.zamRodzaj) {
        zamGlobals.rentcarItem.zamRodzaj =
          sessionService.isClient() || !scope.rentcarWizard.orderMode
            ? RENTCAR_TYPE.OUT
            : RENTCAR_TYPE.IN;
      }
      if (sessionService.isClient()) {
        scope.hideSelect = true;
      }
    },
  };
  const type = StaticConfig.configuration.rentInOut;
  if (rentalTypeActionStore[type] && !$stateParams.previewMode) {
    rentalTypeActionStore[type]();
  }
  if (scope.callback) {
    scope.callback({ rentType: zamGlobals.rentcarItem.zamRodzaj });
  }
}

const typeDepNameMap = {
  $state: "StateService",
  $timeout: "ITimeoutService",
};

export /*@ngInject*/ function InOutType(
  sessionService: SessionService,
  modalService: ModalService,
  $state,
  $stateParams: RawParams,
  zamGlobals: ZamGlobalsService,
  toastr: IToastrService
) {
  return {
    scope: {
      hideSelect: "<?",
      ngModel: "=",
      rentcarItem: "<",
      rentcarWizard: "<",
      callback: "&?",
    },
    controller: /*@ngInject*/ function ($scope) {
      initInOut($scope, sessionService, $stateParams, zamGlobals);
      $scope.types = [
        {
          value: RENTCAR_TYPE.IN,
          title: RENTCAR_TYPE.IN,
        },
        {
          value: RENTCAR_TYPE.OUT,
          title: RENTCAR_TYPE.OUT,
        },
      ];
    },
    link: function (scope) {
      scope.rentTypeSelectChange = function (ngModel) {
        delete scope.rentcarItem.klientId;
        delete scope.rentcarItem.zamPracId;
        delete scope.rentcarItem.platnikId;
        delete scope.rentcarItem.zlecajacyId;
        delete scope.rentcarItem.pracKierowcaId;
        if (scope.callback) {
          scope.callback({ rentType: ngModel });
        }
      };

      scope.globalError = function (message) {
        toastr.error(message);
        $state.go(zamGlobals.startState());
      };
    },
    template,
  };
}
