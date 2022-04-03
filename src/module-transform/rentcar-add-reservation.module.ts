import { rentcarAddSteps } from '@app/rentcar/add/rentcar-add.module';
import { loadRent } from '@app/rentcar/common/action.controller';
import rentcarStepsFrom from '@app/rentcar/common/store/rentcar-action-steps';
import { clientSteps } from '@client/steps/client-steps';
import { StateProvider } from '@uirouter/angularjs';
import { RentcarCommonModule } from '../common/rentcar-common.module';
import { DEFAULT_RENT_STATE_PARAMS } from '../common/ui/rent-item-actions/rent-item-actions.service';
import { AccessorySelectComponent } from '../pricing/form-modal/accessory-select.component';
import { PricingFormModalComponent } from '../pricing/form-modal/pricing-form-modal.component';
import { PriceListModalComponent } from '../pricing/modal/price-list-modal.component';
import { PriceListChoiceComponent } from '../pricing/price-list-choice/price-list-choice.component';
import { PriceListDetailsComponent } from '../pricing/price-list-details/price-list-details.component';
import { PricingGrid } from '../pricing/pricing-grid/pricing-grid.directive';
import { PricingComponent } from '../pricing/pricing.component';

export const ADD_RENT_STEPS = rentcarStepsFrom('main.add.rent');

export const ADD_RENT_CLIENT_STEPS = clientSteps(`main.add.rent.tenant.external`);

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider
    .state('main.add.rent', {
      url: '/rezerwacja?dateFrom?&pojazdId&kategoria&rejestr&id&transform?',
      data: { pageTitle: 'Dodaj rezerwacje' },
      component: 'rentcarAddReservation',
      params: DEFAULT_RENT_STATE_PARAMS,
      resolve: {
        reservation: /*@ngInject*/ loadRent
      }
    })
    .state('main.rent', {
      abstract: true,
      url: '/rent',
      template: '<div ui-view></div>'
    });

  const stepMap = rentcarAddSteps(ADD_RENT_STEPS);

  stepMap['/car'].component = 'carAddReservation';
  stepMap['/pricing'].component = 'pricing';

  for (const addOrderStep of ADD_RENT_STEPS) {
    $stateProvider.state(addOrderStep);
  }
  for (const step of ADD_RENT_CLIENT_STEPS) {
    $stateProvider.state(step);
  }
}

export const RentcarAddReservationModule = angular
  .module('app.rentcar.add.reservation', [RentcarCommonModule])
  .component('pricing', PricingComponent)
  .component('priceListChoice', PriceListChoiceComponent)
  .component('priceListDetails', PriceListDetailsComponent)
  .component('pricingFormModal', PricingFormModalComponent)
  .component('accessorySelect', AccessorySelectComponent)
  .component('priceListModal', PriceListModalComponent)
  .directive('ciPricingGrid', PricingGrid)
  .config(routeConfig).name;
