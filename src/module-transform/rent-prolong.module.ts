import { RentProlongModalComponent } from './rent-prolong.component';

export const ProLongModule = angular
  .module('app.prolong', [])
  .component('rentProlongModal', RentProlongModalComponent).name;
