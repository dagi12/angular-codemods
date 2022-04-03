import { RentcarAddModule } from './add/rentcar-add.module';
import { RentcarPreviewModule } from './preview/rentcar-preview.module';

export const RentcarModule = angular.module('app.rentcar', [
  RentcarPreviewModule,
  RentcarAddModule
]).name;
