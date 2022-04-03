import { StateProvider } from '@uirouter/angularjs';
import { NgModule } from 'angular-ts-decorators';
import { RentcarCommonModule } from '../rentcar/common/rentcar-common.module';
import { LegendModalComponent } from './legend-modal/legend-modal.component';
import { RentChartItemDirective } from './rent-chart-item/rent-chart-item.directive';
import { RentChartDirective } from './rent-chart.directive';

@NgModule({
  id: 'app.rentChart',
  imports: [RentcarCommonModule],
  providers: [],
  declarations: [LegendModalComponent, RentChartItemDirective, RentChartDirective]
})
export class RentChartModule {
  /*@ngInject*/
  static config($stateProvider: StateProvider) {
    $stateProvider.state('main.rentChart', {
      url: '/grafik',
      template: '<div rent-chart-directive></div>',
      data: { pageTitle: 'Grafik wynajmu' }
    });
  }
}
