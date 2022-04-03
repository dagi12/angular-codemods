import { CarBodySelectComponent } from '@app/rentcar/car/car-body-select/car-body-select.component';
import { IdCardComponent } from '@app/rentcar/common/ui/identity-card/identity-card.component';
import { PeselInputComponent } from '@app/rentcar/common/ui/pesel-input/pesel-input.component';
import { PhoneInputComponent } from '@app/rentcar/common/ui/phone-input/phone-input.component';
import { RentAcceptanceComponent } from '@app/rentcar/common/ui/rent-acceptance-select/rent-acceptance.select.component';
import { RentItemActionsComponent } from '@app/rentcar/common/ui/rent-item-actions/rent-item-actions.component';
import { OrderPanelAddComponent } from '@app/rentcar/order/order-panel/order-panel-add.component';
import { OrderPanelCommonComponent } from '@app/rentcar/order/order-panel/order-panel-common.component';
import { CommentComponent } from '@app/rentcar/rental-period/comment/comment.component';
import { ClientAutocompleteComponent } from '@common/my-autocomplete/client-autocomplete.component';
import { EmployeeAutocompleteComponent } from '@common/my-autocomplete/employee-autocomplete.component';
import { EmployeeClientAutocompleteComponent } from '@common/my-autocomplete/employee-client-autocomplete.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IboxFilterComponent } from '@common/ui/ibox-filter/ibox-filter.component';
import uiMask from 'angular-ui-mask';
import { TransmissionSelectComponent } from 'src/app/rentcar/common/ui/transmission-select/transmission-select.component';
import { RentalPlaceWrapperComponent } from 'src/app/rentcar/location/rental-place/rental-place-wrapper.component';
import { OrderPanelPreviewComponent } from '../order/order-panel/order-panel-preview.component';
import { ProLongModule } from '../prolongation/rent-prolong.module';
import { InOutTypeComponent } from '../rental-period/rent-type/in-out-type.directive';
import { LeaseTypeComponent } from '../rental-period/rental-type/lease-type.component';
import { ExternalTenantComponent } from '../tenant/external-tenant/external-tenant.component';
import { InternalTenantComponent } from '../tenant/internal-tenant/internal-tenant.component';
import { TenantComponent } from '../tenant/tenant.component';
import { AttachmentWrapperComponent } from './attachment-wrapper/attachment-wrapper.component';
import { AttachmentModule } from './attachment/attachment.module';
import { BrandSelectComponent } from './ui/brand-select/brand-select.component';
import { CategorySelectComponent } from './ui/category-input/category-select.component';
import { EmailInputComponent } from './ui/email-input/email-input.component';
import { NipInputComponent } from './ui/nip-input/nip-input.component';
import { RentItemActionsService } from './ui/rent-item-actions/rent-item-actions.service';
import { RentalPlaceComponent } from './ui/rental-place/rental-place.component';

export const RentcarCommonModule = angular
  .module('app.rentcar.common', [CommonUiModule, uiMask, AttachmentModule, ProLongModule])
  .component('rentalPlace', RentalPlaceComponent)
  .component('tenant', TenantComponent)
  .component('internalTenant', InternalTenantComponent)
  .component('externalTenant', ExternalTenantComponent)
  .component('rentItemActions', RentItemActionsComponent)
  .component('emailInput', EmailInputComponent)
  .component('brandSelect', BrandSelectComponent)
  .component('categorySelect', CategorySelectComponent)
  .component('iboxFilter', IboxFilterComponent)
  .component('leaseType', LeaseTypeComponent)
  .component('nipInput', NipInputComponent)
  .component('attachmentWrapper', AttachmentWrapperComponent)
  .service('rentItemActionsService', RentItemActionsService)
  .service('rentItemActionsService', RentItemActionsService)
  .component('carBodySelect', CarBodySelectComponent)
  .component('inOutTypeDirective', InOutTypeComponent)
  .component('employeeClientAutocomplete', EmployeeClientAutocompleteComponent)
  .component('rentalPlaceWrapper', RentalPlaceWrapperComponent)
  .component('rentAcceptanceSelect', RentAcceptanceComponent)
  .component('transmissionSelect', TransmissionSelectComponent)
  .component('clientAutocomplete', ClientAutocompleteComponent)
  .component('employeeAutocomplete', EmployeeAutocompleteComponent)
  .component('comment', CommentComponent)
  .component('idCard', IdCardComponent)
  .component('peselInput', PeselInputComponent)
  .component('phoneInput', PhoneInputComponent)
  .component('orderPanelCommon', OrderPanelCommonComponent)
  .component('orderPanelAdd', OrderPanelAddComponent)
  .component('orderPanelPreview', OrderPanelPreviewComponent).name;
