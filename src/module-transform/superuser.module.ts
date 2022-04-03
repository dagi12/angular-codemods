import { AdVisibilityComponent } from '@app/superuser/settings/ad-visibility/ad-visibility.component';
import { RentChartSettingsComponent } from '@app/superuser/settings/rent-chart-settings/rent-chart-settings.component';
import { SubSettingsComponent } from '@app/superuser/settings/sub-settings/sub-settings.component';
import { OperatorAutocompleteDirective } from '@common/my-autocomplete/operator-autocomplete-directive';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { StateProvider } from '@uirouter/angularjs/lib/stateProvider';
import { OrderVisibilityComponent } from 'src/app/superuser/administration/directive/order-visibility/order-visibility.component';
import { ApplicationSettingsComponent } from 'src/app/superuser/settings/application-settings.component';
import { MainSettingsComponent } from 'src/app/superuser/settings/main-settings/main-settings.component';
import { OtherSettingsComponent } from 'src/app/superuser/settings/other-settings/other-settings.component';
import localyticsDirectives from 'src/local_modules/_angular-chosen-localytics';
import { LoginModule } from '../login/login.module';
import { RentcarCommonModule } from '../rentcar/common/rentcar-common.module';
import { RoadCardModule } from '../road-card/road-card.module';
import { AdministrationPanelDirective } from './administration/administration-panel.directive';
import { AccountTypeComponent } from './administration/directive/account-type/account-type.component';
import { RentVisibilityComponent } from './administration/directive/rent-visibility/rent-visibility.component';
import { UserRightsCheckboxesComponent } from './administration/directive/user-rights-checkboxes/user-rights-checkboxes.directive';
import { AddClientDefaultComponent } from './settings/add-client-default/add-client-default.component';
import { EmailConfigComponent } from './settings/email-config/email-config.component';
import template from './superuser.html';

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider.state('main.administrationPanel', {
    url: '/panel-administracyjny',
    template
  });
  $stateProvider.state('main.applicationSettings.addClientDefault', {
    url: '/add-client-default',
    component: 'addClientDefault',
    data: { pageTitle: 'Domyślne wartości klienta' }
  });
  $stateProvider.state('main.applicationSettings', {
    url: '/ustawienia',
    component: 'applicationSettings',
    data: { pageTitle: 'Ustawienia' }
  });
  $stateProvider.state('main.applicationSettings.adVisibility', {
    url: '/ad-visibility',
    component: 'adVisibility',
    data: { pageTitle: 'Widoczność AD' }
  });
  $stateProvider.state('main.applicationSettings.emailConfig', {
    url: '/email-config',
    component: 'emailConfig',
    data: { pageTitle: 'Konfiguracja email' }
  });
  $stateProvider.state('main.applicationSettings.chartSettings', {
    url: '/chart-settings',
    component: 'rentChartSettings',
    data: { pageTitle: 'Ustawienia grafiku' }
  });
  $stateProvider.state('main.applicationSettings.otherSettings', {
    url: '/other-settings',
    component: 'otherSettings',
    data: { pageTitle: 'Inne ustawienia' }
  });
  $stateProvider.state('main.applicationSettings.roadCardSettings', {
    url: '/road-card-settings',
    component: 'roadCardSettings',
    data: { pageTitle: 'Ustawienia kart drogowych' }
  });
  $stateProvider.state('main.applicationSettings.mainSettings', {
    url: '/main-settings',
    component: 'mainSettings',
    data: { pageTitle: 'Główne' }
  });
}

export const SuperUserModule = angular
  .module('app.superuser', [
    CommonUiModule,
    LoginModule,
    RentcarCommonModule,
    localyticsDirectives,
    RoadCardModule
  ])
  .component('addClientDefault', AddClientDefaultComponent)
  .component('emailConfig', EmailConfigComponent)
  .component('rentVisibility', RentVisibilityComponent)
  .component('accountType', AccountTypeComponent)
  .component('mainSettings', MainSettingsComponent)
  .component('applicationSettings', ApplicationSettingsComponent)
  .component('otherSettings', OtherSettingsComponent)
  .component('userRigthsCheckboxesDirective', UserRightsCheckboxesComponent)
  .component('orderVisibility', OrderVisibilityComponent)
  .directive('administrationPanelDirective', AdministrationPanelDirective)
  .component('adVisibility', AdVisibilityComponent)
  .directive('operatorAutocompleteDirective', OperatorAutocompleteDirective)
  .component('subSettings', SubSettingsComponent)
  .component('rentChartSettings', RentChartSettingsComponent)
  .config(routeConfig).name;
