import template from 'src/app/pickdrop/pickup/car-rental-return/car-rental-return.directive.html';
import { verifyPickup } from '@app/pickdrop/pickup/pickup-wizard.directive';

export /*@ngInject*/ function CarRentalReturn() {
  return {
    scope: false,
    controller: /*@ngInject*/ function ($scope) {
      $scope.rentalPlaceChange = function ({ rentalPlace }) {
        $scope.parent.rentcar.zdFaktMiejsce = rentalPlace;
      };
    },
    link: function (scope) {
      const model = scope.parent.rentcar;

      model.powrotLicznik = model.powrotLicznik || model.zdStanLicz;
      model.powrotPaliwo = model.powrotPaliwo || model.zdStanPal;

      scope.parent.wizardManager.setVerification('/car-rental', () => {return verifyPickup(scope)}, true);
    },
    template
  };
}
