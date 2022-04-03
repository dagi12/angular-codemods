import { CommonUiModule } from '@common/ui/common-ui.module';
import { RentcarCommonModule } from '../rentcar/common/rentcar-common.module';
import { CarLockComponent } from './car-lock.component';
import { CarAutCompleteComponent } from './car-auto-complete/car-auto-complete.component';
import { StateProvider } from '@uirouter/angularjs';

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider.state('main.rent.carLock', {
    url: '/car-lock',
    component: 'carLock',
    data: { pageTitle: 'Zablokuj pojazd' }
  });
}

export const CarLockModule = angular
  .module('app.carLock', [CommonUiModule, RentcarCommonModule])
  .component('carLock', CarLockComponent)
  .component('carAutoComplete', CarAutCompleteComponent)
  .config(routeConfig).name;
