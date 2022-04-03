import { StateProvider } from '@uirouter/angularjs/lib/stateProvider';
import { DocumentComponent } from './document.component';

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider.state('main.document', {
    url: '/document',
    component: 'document',
    data: { pageTitle: 'Dokumenty' }
  });
}

/**
 *  Stworzone przez Eryk Mariankowski dnia 08.05.18.
 */
export const DocumentModule = angular
  .module('app.document', [])
  .component('document', DocumentComponent)
  .config(routeConfig).name;
