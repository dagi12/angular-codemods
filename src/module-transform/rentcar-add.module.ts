import { RentcarAddOuterComponent } from '@app/rentcar/add/rentcar-add-outer.component';
import { loadOrder } from '@app/rentcar/common/action.controller';
import rentcarStepsFrom from '@app/rentcar/common/store/rentcar-action-steps';
import { OrderPanelAddComponent } from '@app/rentcar/order/order-panel/order-panel-add.component';
import { RentcarAddOrderComponent } from '@app/rentcar/order/rentcar-add-order.component';
import { RentalPeriodAddComponent } from '@app/rentcar/rental-period/rental-period-add.component';
import { RentcarAddReservationComponent } from '@app/rentcar/reservation/rentcar-add-reservation.component';
import { clientSteps } from '@client/steps/client-steps';
import { IMyStep } from '@common/directives/my-wizard/my-wizard.component';
import { StateProvider } from '@uirouter/angularjs/lib/stateProvider';
import 'angular-drag-and-drop-lists';
import { arrayToMap2 } from 'flota-web-client-common/src/Service/ArrayHelper';
import { CarAddOrderComponent } from '../car/car-add-order/car-add-order.component';
import { CarAddReservationComponent } from '../car/car-add-reservation/car-add-reservation.component';
import { CarGridComponent } from '../car/car-grid/car-grid.component';
import { CarOrderComponent } from '../car/car-order/car-order.component';
import { EquipmentComponent } from '../car/equipment/equipment.component';
import { OtherTermsComponent } from '../car/other-terms/other-terms.component';
import { LocationAddComponent } from '../location/location-add.directive';
import { RentcarAddReservationModule } from './rentcar-add-reservation.module';
import { SummaryComponent } from './summary/summary.component';

const DndListsModule = 'dndLists';

export function rentcarAddSteps(steps: Array<IMyStep>): { [key: string]: IMyStep } {
  const stepMap = arrayToMap2(steps, 'url');
  stepMap['/rental-period'].component = 'rentalPeriodAdd';
  stepMap['/location'].template = '<div location-add-directive></div>';
  return stepMap;
}

const ADD_ORDER_STEP_NAME = 'main.add.order';

export const ADD_ORDER_STEPS = rentcarStepsFrom(ADD_ORDER_STEP_NAME, true);

export const ADD_ORDER_CLIENT_STEPS = clientSteps('main.add.order.tenant.external');

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider
    .state('main.add', {
      abstract: true,
      url: '/add',
      component: 'rentcarAdd'
    })
    .state('main.add.orderPanel', {
      url: '/order-panel',
      data: { pageTitle: 'Dodaj zamówienie' },
      component: 'addOrderPanel'
    })
    .state(ADD_ORDER_STEP_NAME, {
      url: '/order/:id',
      data: { pageTitle: 'Dodaj zamówienie' },
      component: 'rentcarAddOrder',
      params: {
        id: null
      },
      resolve: {
        order: /*@ngInject*/ loadOrder
      }
    });

  const stepMap = rentcarAddSteps(ADD_ORDER_STEPS);
  stepMap['/car'].component = 'carAddOrder';
  stepMap['/pricing'].data.enabled = false;
  for (const addOrderStep of ADD_ORDER_STEPS) {
    $stateProvider.state(addOrderStep);
  }
  for (const clientStep of ADD_ORDER_CLIENT_STEPS) {
    $stateProvider.state(clientStep);
  }
}

export const RentcarAddModule = angular
  .module('app.rentcar.add', [RentcarAddReservationModule, DndListsModule])
  .component('rentcarAdd', RentcarAddOuterComponent)
  .component('carOrder', CarOrderComponent)
  .component('carGrid', CarGridComponent)
  .component('equipment', EquipmentComponent)
  .component('carAddOrder', CarAddOrderComponent)
  .component('carAddReservation', CarAddReservationComponent)
  .component('summary', SummaryComponent)
  .component('otherTerms', OtherTermsComponent)
  .component('rentcarAddOrder', RentcarAddOrderComponent)
  .component('rentcarAddReservation', RentcarAddReservationComponent)
  .component('locationAddDirective', LocationAddComponent)
  .component('rentalPeriodAdd', RentalPeriodAddComponent)
  .component('addOrderPanel', OrderPanelAddComponent)
  .config(routeConfig).name;
