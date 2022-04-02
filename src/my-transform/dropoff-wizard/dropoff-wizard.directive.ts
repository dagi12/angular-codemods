import { ApplicationConfigService } from '@common/common-services/application-config.service';
import { ModalService } from '@common/common-services/modal/modal.service';
import { VerificationService } from '@common/common-services/verification.service';
import { DropoffControllerApi } from 'src/zamowienia-openapi';
import template from './dropoff-wizard.html';
import { DROPOFF_STEPS } from '@app/pickdrop/common/pickdrop-common.module';

export const DropoffWizardDirective = () => {return {
  scope: true,
  controller: /*@ngInject*/ function (
    $scope,
    applicationConfigService: ApplicationConfigService,
    modalService: ModalService,
    verificationService: VerificationService,
    dropoffControllerApi: DropoffControllerApi
  ) {
    $scope.parent.dropoffMode = true;
    $scope.parent.doneStatement = 'Samochód wydano';
    $scope.parent.doneState = 'main.rent.pickupGrid';
    $scope.parent.prefix = 'wy';
    $scope.parent.handleErrorMessage = 'Wydanie samochodu nie powiodło się';
    $scope.steps = DROPOFF_STEPS;

    $scope.add = function () {
      if (verificationService.verify($scope.driverVerification)) {
        $scope.clearUnused();
        dropoffControllerApi
          .dropoffReservationUsingPOST({
            reservation: $scope.parent.rentcar
          })
          .then(response => {
            $scope.pickdropSuccess(response.data);
          }, $scope.handleError);
      }
    };
  },
  template
}};
