import { ClientSearchComponent } from './client-search.component';
import { ClientSearchFilterComponent } from './filter/client-search-filter.component';
import { StateProvider } from '@uirouter/angularjs';

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider.state('main.rent.clientSearch', {
    url: '/client-search',
    component: 'clientSearch'
  });
}

/**
 *  Stworzone przez Eryk Mariankowski dnia 28.03.18.
 */
export const ClientSearchModule = angular
  .module('app.clientSearch', [])
  .component('clientSearch', ClientSearchComponent)
  .component('clientSearchFilter', ClientSearchFilterComponent)
  .config(routeConfig).name;
