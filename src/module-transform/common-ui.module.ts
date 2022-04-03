import { RentStatusComponent } from '@app/rentcar/common/ui/rent-status/rent-status.component';
import { PasswordConfirmComponent } from '@app/superuser/administration/directive/password-confirm/password-confirm.component';
import { PasswordMeterDirective } from '@app/superuser/administration/directive/password-meter/password-meter.directive';
import { YesNoModalComponent } from '@common/common-services/modal/yes-no-modal.component';
import { TopNavbarComponent } from '@common/directives/topnavbar/top-navbar.component';
import { DateRangeComboComponent } from '@common/grid/date-range-combo/date-range-combo.component';
import { CheckboxDirective } from '@common/ui/checkbox/checkbox.directive';
import { ClientFieldFactory } from '@common/ui/client-field-factory/client-field-factory.directive';
import { CustomStyleDirective } from '@common/ui/custom-style/custom-style.directive';
import { DatePickerDirective } from '@common/ui/date-picker/date-picker.directive';
import { FormModalExtDirective } from '@common/ui/form-modal-ext/form-modal-ext.directive';
import { IboxPanelComponent } from '@common/ui/ibox-panel/ibox-panel.component';
import { LabelledButtonComponent } from '@common/ui/labelled-button/labelled-button.component';
import { ModalActionGridComponent } from '@common/ui/modal-action-grid/modal-action-grid.component';
import { ModalHeaderComponent } from '@common/ui/modal-header/modal-header.component';
import { ModalComponent } from '@common/ui/modal/modal.component';
import { MyDataMaskDirective } from '@common/ui/my-data-mask/my-data-mask.directive';
import { MyModalComponent } from '@common/ui/my-modal/my-modal.component';
import { PreviewDateComponent } from '@common/ui/preview-date/preview-date.component';
import { RadioGroupComponent } from '@common/ui/radio-group/radio-group.component';
import { SelectInputDirective } from '@common/ui/select-input/select-input.directive';
import { ShakingErrorComponent } from '@common/ui/shaking-error/shaking-error.component';
import 'angular-datepicker';
import 'pwstrength-bootstrap/dist/pwstrength-bootstrap.min';
import 'zxcvbn';
import { FooterComponent } from '../directives/footer/footer.component';
import { IcheckDirective } from '../directives/i-check/i-check.directive';
import { PageTitleDirective } from '../directives/page-title/page-title.directive';
import { CommonGridModule } from '../grid/common-grid.module';
import { MyAutoCompleteComponent } from '../my-autocomplete/my-auto-complete.directive';
import { ButtonOkComponent } from './button-ok/button-ok.component';
import { CheckboxGroupComponent } from './checkbox-group/checkbox-group.component';
import { FormModalDirective } from './form-modal/form-modal.directive';
import { FormSimpleComponent } from './form-simple/form-simple.component';
import { IboxFormSimpleComponent } from './ibox-form-simple/ibox-form-simple.component';
import { IboxSimpleComponent } from './ibox-simple/ibox-simple.component';
import { IboxToolsComponent } from './ibox-tools/ibox-tools.directive';
import { ModalButtonDirective } from './modal-button-directive/modal-button.directive';
import { ModalFormComponent } from './modal-form/modal-form.component';
import { OkModalComponent } from './ok-modal/ok-modal.component';
import { PreviewInputComponent } from './preview-input/preview-input.component';
import { RowClass } from './row-class/row-class.directive';
import { SummaryButtonsComponent } from './summary-buttons/summary-buttons.component';
import { ModalTableComponent } from './tables/modal-table/modal-table.component';
import { OfflineModalTableComponent } from './tables/offline-modal-table/offline-modal-table.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { TextInput } from './text-input/text-input.directive';

const eventEmitter = <T>(payload: T) => {
  return {
    $event: payload
  };
};

export type EventEmitter = typeof eventEmitter;

export const CommonUiModule = angular
  .module('app.common.ui', [CommonGridModule, 'datePicker'])
  .component('textArea', TextAreaComponent)
  .component('modalForm', ModalFormComponent)
  .component('modalTable', ModalTableComponent)
  .component('offlineModalTable', OfflineModalTableComponent)
  .component('previewInput', PreviewInputComponent)
  .component('previewDate', PreviewDateComponent)
  .component('checkboxGroup', CheckboxGroupComponent)
  .component('okModal', OkModalComponent)
  .component('summaryButtons', SummaryButtonsComponent)
  .component('formSimple', FormSimpleComponent)
  .component('iboxFormSimple', IboxFormSimpleComponent)
  .component('buttonOk', ButtonOkComponent)
  .component('rentStatus', RentStatusComponent)
  .component('iboxSimple', IboxSimpleComponent)
  .component('footerComponent', FooterComponent)
  .directive('icheck', IcheckDirective)
  .component('dateRangeCombo', DateRangeComboComponent)
  .component('topNavbar', TopNavbarComponent)
  .directive('pageTitle', PageTitleDirective)
  .component('passwordConfirm', PasswordConfirmComponent)
  .directive('passwordMeter', PasswordMeterDirective)
  .directive('modalButtonDirective', ModalButtonDirective)
  .directive('formModalDirective', FormModalDirective)
  .directive('clientFieldFactoryDirective', ClientFieldFactory)
  .directive('datePickerDirective', DatePickerDirective)
  .component('modalActionGrid', ModalActionGridComponent)
  .directive('customStyle', CustomStyleDirective)
  .component('iboxPanel', IboxPanelComponent)
  .component('iboxTools', IboxToolsComponent)
  .directive('ciRowClass', RowClass)
  .directive('textInputDirective', TextInput)
  .component('myAutoComplete', MyAutoCompleteComponent)
  .directive('checkboxDirective', CheckboxDirective)
  .directive('formModalExtDirective', FormModalExtDirective)
  .component('modal', ModalComponent)
  .component('myModal', MyModalComponent)
  .component('modalHeader', ModalHeaderComponent)
  .component('shakingError', ShakingErrorComponent)
  .directive('selectInputDirective', SelectInputDirective)
  .directive('myDataMaskDirective', MyDataMaskDirective)
  .component('radioGroup', RadioGroupComponent)
  .component('yesNoModal', YesNoModalComponent)
  .component('labelledButton', LabelledButtonComponent)
  .value('eventEmitter', eventEmitter).name;
