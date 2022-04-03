import { ClientCompanyDataComponent } from '@client/steps/client-company-data.component';
import { ClientContactDetailsComponent } from '@client/steps/client-contact-details.component';
import { DisableSpaceDirective } from '@app/client-wizard/disable-space/disable-space.directive';
import { ClientDifferentAddressComponent } from '@client/address-directive/client-different-address.component';
import { ClientWizardComponent } from '@client/client-wizard.component';
import { ClientAddressComponent } from '@client/address-directive/client-address.component';
import { ClientAddressDataComponent } from '@client/steps/client-address-data.component';
import { ClientNaturalPersonComponent } from '@client/steps/client-natural-person.component';
import { CommonSharedModule } from '@common/common-services/common-shared.module';
import { MyWizardComponent } from '@common/directives/my-wizard/my-wizard.component';
import { ClientNameComponent } from 'src/app/client-wizard/client-name/client-name.component';
import { ClientCommentComponent } from 'src/app/client-wizard/steps/client-comment.component';
import { ClientContactPersonComponent } from 'src/app/client-wizard/steps/client-contact-person.component';
import datePicker from 'src/local_modules/_angular-datepicker';

export const ClientWizardModule = angular
  .module('app.clientWizard', [datePicker, CommonSharedModule])
  .component('myWizard', MyWizardComponent)
  .directive('disableSpaceDirective', DisableSpaceDirective)
  .component('clientContactDetails', ClientContactDetailsComponent)
  .component('clientCompanyData', ClientCompanyDataComponent)
  .component('clientName', ClientNameComponent)
  .component('clientWizard', ClientWizardComponent)
  .component('clientAddress', ClientAddressComponent)
  .component('clientAddressData', ClientAddressDataComponent)
  .component('clientContactPerson', ClientContactPersonComponent)
  .component('clientNaturalPerson', ClientNaturalPersonComponent)
  .component('clientComment', ClientCommentComponent)
  .component('clientDifferentAddress', ClientDifferentAddressComponent).name;
