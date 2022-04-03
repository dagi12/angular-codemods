import { PickdropCommonModule } from '../common/pickdrop-common.module';
import { CarRentalReturnComponent } from './car-rental-return/car-rental-return.directive';
import { PickupWizardComponent } from './pickup-wizard.directive';

export const PickdropPickupModule = angular
  .module('app.pickdrop.pickup', [PickdropCommonModule])
  .component('carRentalReturnDirective', CarRentalReturnComponent)
  .component('pickupWizardDirective', PickupWizardComponent).name;
