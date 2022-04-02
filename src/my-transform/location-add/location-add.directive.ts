import template from './location-add.html';
import { ZamGlobalsService } from '@app/config/zam-globals.service';
import { SessionService } from '@common/common-services/session.service';
import { ZamowieniaRole } from 'src/zamowienia-openapi';
import StaticConfig from '@app/initialization/static-config';

export const locationAddZdPlanMiejsce = 'location-add/zdPlanMiejsce';

export /*@ngInject*/ function LocationAdd(
  zamGlobals: ZamGlobalsService,
  sessionService: SessionService
) {
  return {
    scope: false,
    controller: /*@ngInject*/ function ($scope) {
      $scope.differentReturnPlace = false;
      $scope.returnLock = true;
      if (sessionService.isEmployee()) {
        const branch = sessionService.netUser.branch;
        if (!$scope.rentcarItem.wydPlanMiejsce) {
          $scope.rentcarItem.wydPlanMiejsce = branch;
        }
        if (!$scope.rentcarItem.zdPlanMiejsce) {
          $scope.rentcarItem.zdPlanMiejsce = branch;
        }
      }

      $scope.rentalSelectCallback = function (ngModel?) {
        if ($scope.returnLock) {
          $scope.rentcarItem.zdPlanMiejsce = ngModel || $scope.rentcarItem.wydPlanMiejsce;
          zamGlobals.$emit(locationAddZdPlanMiejsce, $scope.rentcarItem.zdPlanMiejsce);
        }
      };

      $scope.pickupPlaceChange = function ({ rentalPlace }) {
        $scope.rentcarItem.zdPlanMiejsce = rentalPlace;
        $scope.returnLock = false;
      };

      const permissions = sessionService.permissions;
      const orderDisableLocation = $scope.rentcarWizard.orderMode
        ? permissions.orderVisibility === ZamowieniaRole.OrderVisibilityEnum.OWN
        : !permissions.allRent;
      $scope.disableLocation =
        StaticConfig.configuration.smallRent &&
        orderDisableLocation &&
        sessionService.netUser.branch !== '15000003' &&
        !sessionService.isClient();

      $scope.rentcarWizard.wizardManager.setVerification('/location', () => {
        if (!$scope.rentcarItem.wydPlanMiejsce || !$scope.rentcarItem.zdPlanMiejsce) {
          return 'Podaj miejsce';
        }
      });

      $scope.checkboxChange = function () {
        if ($scope.rentcarWizard.differentReturnPlace) {
          $scope.returnLock = true;
          $scope.rentalSelectCallback();
        }
      };
    },
    template
  };
}
