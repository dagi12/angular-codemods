import { CommonUiModule } from '@common/ui/common-ui.module';
import { RentcarCommonModule } from '../rentcar/common/rentcar-common.module';
import { BaseRentGridComponent } from './base-rent-grid/base-rent-grid.component';
import { CancelBookingModalComponent } from './cancel-booking/cancel-booking-modal.component';
import { CancelOrderModalComponent } from './cancel/cancel-order-modal.component';
import { RentSelectorButtonsComponent } from '@app/grid/common/rent-selector-buttons/rent-selector-buttons.component';
import { FilterRentComponent } from './filter/filter-rent/filter-rent.component';
import { RentGridComponent } from './rent-grid/rent-grid.component';
import { RentalStatusComponent } from './rental/rental-status.component';
import { OrderGridComponent } from './order-grid/order-grid.component';
import { FilterOrderGridComponent } from './filter/filter-order/filter-order-grid.component';
import { StateProvider } from '@uirouter/angularjs';

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider
    .state('main.rent.reservationGrid', {
      url: '/current-reservation',
      data: { pageTitle: 'Lista wynajmów' },
      component: 'rentGrid'
    })
    .state('main.rent.rentalStatus', {
      url: '/rental-status',
      component: 'rentalStatus',
      data: { pageTitle: 'NAV_HEADER.RENTAL_STATUS' }
    })
    .state('main.orderGrid', {
      url: '/order-list',
      component: 'orderGrid',
      data: { pageTitle: 'Lista zamówień' }
    });
}

export const GridModule = angular
  .module('app.grid', [CommonUiModule, RentcarCommonModule])
  .component('cancelOrderModal', CancelOrderModalComponent)
  .component('cancelBookingModal', CancelBookingModalComponent)
  .component('rentalStatus', RentalStatusComponent)
  .component('rentGrid', RentGridComponent)
  .component('baseRentGrid', BaseRentGridComponent)
  .component('filterRent', FilterRentComponent)
  .component('orderGrid', OrderGridComponent)
  .component('filterOrderGrid', FilterOrderGridComponent)
  .component('rentSelectorButtons', RentSelectorButtonsComponent)
  .config(routeConfig).name;
