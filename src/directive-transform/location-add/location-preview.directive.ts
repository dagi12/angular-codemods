import html from './location-add.html';
import { flotaBool } from 'flota-web-client-common/src/Util/FlotaUtil2';

export /*@ngInject*/ function LocationPreviewDirective() {
  return {
    controller: /*@ngInject*/ function LocationPreviewController($scope) {
      $scope.rentcarWizard.selectedRentalPlace = {};
      $scope.rentcarWizard.selectedReturnPlace = {};
      $scope.rentcarWizard.selectedRentalPlace.nazwaKod = $scope.rentcarItem.wydPlanMiejsce;
      $scope.rentcarWizard.selectedReturnPlace.nazwaKod = $scope.rentcarItem.zdPlanMiejsce;
      $scope.rentcarWizard.czyPodst = flotaBool($scope.rentcarItem.czyPodst);
      $scope.rentcarWizard.czyOdbior = flotaBool($scope.rentcarItem.czyOdbior);
      $scope.rentcarWizard.differentReturnPlace =
        $scope.rentcarItem.wydPlanMiejsce !== $scope.rentcarItem.zdPlanMiejsce ||
        $scope.rentcarWizard.czyOdbior;
    },
    template: html
  };
}
