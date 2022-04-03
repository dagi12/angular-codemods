import { NgModule } from "angular-ts-decorators";
import { RentcarCommonModule } from "../rentcar/common/rentcar-common.module";
import { LegendModalComponent } from "./legend-modal/legend-modal.component";
import { RentChartItemDirective } from "./rent-chart-item/rent-chart-item.directive";
import { RentChartDirective } from "./rent-chart.directive";

@NgModule({
  imports: [RentcarCommonModule],
  exports: [],
  declarations: [
    RentChartDirective,
    RentChartItemDirective,
    LegendModalComponent,
  ],
  providers: [],
})
export class RentChartModule {}
