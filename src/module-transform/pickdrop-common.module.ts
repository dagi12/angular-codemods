import { GridModule } from '@app/grid/grid.module';
import { FuelCounterComponent } from '@app/pickdrop/common/fuel-counter/fuel-counter.component';
import { InformationComponent } from '@app/pickdrop/common/information/information.component';
import dropoffSteps from '@app/pickdrop/dropoff/dropoff-steps';
import pickupSteps from '@app/pickdrop/pickup/pickup-steps';
import { loadRent } from '@app/rentcar/common/action.controller';
import { RentcarCommonModule } from '@app/rentcar/common/rentcar-common.module';
import { StateProvider } from '@uirouter/angularjs/lib/stateProvider';
import { DropoffCommentComponent } from '../dropoff/dropoff-comment/dropoff-comment.component';
import { DropoffGridComponent } from '../grid/dropoff-grid/dropoff-grid.component';
import { PickDropGridComponent } from '../grid/pick-drop-grid/pick-drop-grid.component';
import { PickupGridComponent } from '../grid/pickup-grid/pickup-grid.component';
import { PickdropComponent } from '../pickdrop.directive';

const PICKUP_STATE_NAME = 'main.pickdrop.pickup';
const DROPOFF_STATE_NAME = 'main.pickdrop.dropoff';

export const DROPOFF_STEPS = dropoffSteps(DROPOFF_STATE_NAME);
export const PICKUP_STEPS = pickupSteps(PICKUP_STATE_NAME);

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider
    .state('main.rent.dropoffGrid', {
      url: '/gridwydania',
      component: 'dropoffGrid',
      data: { pageTitle: 'Wydanie' }
    })
    .state('main.rent.pickupGrid', {
      url: '/gridzdania',
      component: 'pickupGrid',
      data: { pageTitle: 'Zdanie' }
    })
    // uważaj state main.pickdrop.dropoff nie zarejestruje się bez tego
    .state('main.pickdrop', {
      resolve: {
        rentcar: /*@ngInject*/ loadRent
      },
      url: '/pickdrop',
      template: '<div pickdrop-directive></div>'
    })
    .state(DROPOFF_STATE_NAME, {
      url: '/dropoff/:id',
      template: '<div dropoff-wizard-directive></div>',
      data: { pageTitle: 'Wydanie' }
    })
    .state(PICKUP_STATE_NAME, {
      url: '/pickup/:id',
      template: '<div pickup-wizard-directive></div>',
      data: { pageTitle: 'Zdanie' }
    });

  for (const dropoffstep of DROPOFF_STEPS) {
    $stateProvider.state(dropoffstep);
  }
  for (const pickupstep of PICKUP_STEPS) {
    $stateProvider.state(pickupstep);
  }
}

export const PickdropCommonModule = angular
  .module('app.pickdrop.common', [RentcarCommonModule, GridModule])
  .component('pickDropGrid', PickDropGridComponent)
  .component('pickupGrid', PickupGridComponent)
  .component('dropoffGrid', DropoffGridComponent)
  .component('dropoffComment', DropoffCommentComponent)
  .component('pickdropDirective', PickdropComponent)
  .component('fuelCounter', FuelCounterComponent)
  .component('information', InformationComponent)
  .config(routeConfig).name;
