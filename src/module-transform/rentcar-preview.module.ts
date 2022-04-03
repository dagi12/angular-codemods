import { loadOrder, loadRent } from '@app/rentcar/common/action.controller';
import { RentalPeriodPreviewComponent } from '@app/rentcar/rental-period/rental-period-preview.component';
import { RentcarPreviewReservationComponent } from '@app/rentcar/reservation/rentcar-preview-reservation.component';
import { StateProvider } from '@uirouter/angularjs';
import orderNoteExchange from 'src/app/rentcar/order/order-note-exchange.html';
import {
  PREVIEW_ORDER_STEPS,
  RentcarPreviewOrderComponent
} from 'src/app/rentcar/order/rentcar-preview-order.component';
import {
  PREVIEW_RENT_STEPS,
  RentcarPreviewComponent,
  rentcarPreviewMapFrom
} from 'src/app/rentcar/preview/rentcar-preview-outer.component';
import rentNoteExchange from 'src/app/rentcar/reservation/rent-note-exchange.html';
import { CarPreviewComponent } from '../car/car-preview/car-preview.component';
import { RentcarCommonModule } from '../common/rentcar-common.module';
import { LocationPreviewComponent } from '../location/location-preview.directive';
import { NoteExchangeModule } from '../note-exchange/note-exchange.module';
import { PricingPreviewComponent } from '../pricing/preview/pricing-preview.component';
import { OrderStatusComponent } from './status/order-status.component';

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider
    .state('main.preview.reservation', {
      url: '/rent/:id',
      component: 'rentcarPreviewReservation',
      data: { pageTitle: 'Zamówienie' },
      params: {
        id: null
      },
      resolve: {
        reservation: /*@ngInject*/ loadRent
      }
    })
    .state('main.preview', {
      abstract: true,
      url: '/preview',
      component: 'rentcarPreview',
      params: {
        preview: true
      }
    })
    .state('main.preview.order', {
      url: '/order/:id',
      data: { pageTitle: 'Zamówienie' },
      component: 'rentcarPreviewOrder',
      params: {
        id: null
      },
      resolve: {
        order: /*@ngInject*/ loadOrder
      }
    })
    .state('main.preview.orderPanel', {
      url: '/order-panel/:id',
      data: { pageTitle: 'Zamówienie' },
      component: 'orderPanelPreview',
      params: {
        id: null
      },
      resolve: {
        order: /*@ngInject*/ loadOrder
      }
    });

  const orderStepMap = rentcarPreviewMapFrom(PREVIEW_ORDER_STEPS);

  orderStepMap['/note-exchange'].template = orderNoteExchange;

  orderStepMap['/pricing'].data.enabled = false;
  orderStepMap['/note-exchange'].data.enabled = true;
  orderStepMap['/note-exchange'].template = orderNoteExchange;

  const rentStepMap = rentcarPreviewMapFrom(PREVIEW_RENT_STEPS);

  rentStepMap['/pricing'].component = 'pricingPreview';
  rentStepMap['/status'].data.enabled = false;
  rentStepMap['/note-exchange'].data.enabled = true;
  rentStepMap['/note-exchange'].template = rentNoteExchange;

  for (const rentStep of PREVIEW_RENT_STEPS) {
    $stateProvider.state(rentStep);
  }
  for (const orderStep of PREVIEW_ORDER_STEPS) {
    $stateProvider.state(orderStep);
  }
}

export const RentcarPreviewModule = angular
  .module('app.rentcar.preview', [RentcarCommonModule, NoteExchangeModule])
  .component('pricingPreview', PricingPreviewComponent)
  .component('carPreview', CarPreviewComponent)
  .component('rentalPeriodPreview', RentalPeriodPreviewComponent)
  .component('rentcarPreviewOrder', RentcarPreviewOrderComponent)
  .component('locationPreviewDirective', LocationPreviewComponent)
  .component('orderStatus', OrderStatusComponent)
  .component('rentcarPreview', RentcarPreviewComponent)
  .component('rentcarPreviewReservation', RentcarPreviewReservationComponent)
  .config(routeConfig).name;
