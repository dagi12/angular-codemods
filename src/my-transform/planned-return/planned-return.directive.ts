import template from './planned-return.directive.html';

export /*@ngInject*/ function PlannedReturnDirective() {
  return {
    scope: false,
    controller: /*@ngInject*/ function ($scope) {
      $scope.rentalPlaceChange = function ({ rentalPlace }) {
        $scope.parent.rentcar.zdPlanMiejsce = rentalPlace;
      };
    },
    link: function (scope) {
      scope.parent.wizardManager.setVerification(
        '/planned-return',
        () => {
          const model = scope.parent.rentcar;
          if (!model.zdPlanData) {
            return 'Podaj date planowanego zdania.';
          }
          if (!model.zdPlanMiejsce) {
            return 'Podaj miejsce planowanego zdania.';
          }
          if (!model.zdPlanMiejsce) {
            return 'Podaj miejsce planowanego zdania.';
          }
          if (scope.parent.zdPlanUKl && !model.zdPlanUKlMiejsce) {
            return 'Podaj miejsce planowanego odbioru od klienta';
          }
        },
        true
      );
    },
    template
  };
}
