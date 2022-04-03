import { ReservationInformationComponent } from '@app/pickdrop/dropoff/reservation-information/reservation-information.component';
import { DropoffInformationComponent } from '@app/pickdrop/pickup/dropoff-information/dropoff-information.component';
import { PlannedReturnComponent } from 'src/app/pickdrop/dropoff/planned-return/planned-return.directive';
import { PickupDatecounter } from 'src/app/pickdrop/pickup/datecounter/pickup-datecounter.diretive';
import { PickdropCommonModule } from '../common/pickdrop-common.module';
import { DatecounterComponent } from './datecounter/datecounter-directive';
import { DropoffWizardDirective } from './dropoff-wizard.directive';

export const PickdropDropoffModule = angular
  .module('app.pickdrop.dropoff', [PickdropCommonModule])
  .directive('pickupDatecounterDirective', PickupDatecounter)
  .component('plannedReturnDirective', PlannedReturnComponent)
  .component('datecounterDirective', DatecounterComponent)
  .directive('dropoffWizardDirective', DropoffWizardDirective)
  .component('dropoffInformation', DropoffInformationComponent)
  .component('reservationInformation', ReservationInformationComponent).name;
