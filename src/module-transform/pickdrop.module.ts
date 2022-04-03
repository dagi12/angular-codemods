import { PickdropDropoffModule } from './dropoff/pickdrop-dropoff.module';
import { PickdropPickupModule } from './pickup/pickdrop-pickup.module';

export const PickdropModule = angular.module('app.pickdrop', [
  PickdropPickupModule,
  PickdropDropoffModule
]).name;
