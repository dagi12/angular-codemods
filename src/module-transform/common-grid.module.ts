import angular from 'angular';
import datatables from 'angular-datatables';
import datatablesSelect from 'angular-datatables/dist/plugins/select/angular-datatables.select';
import 'datatables.net/js/jquery.dataTables';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-select-dt/js/select.dataTables';
import { CommonSharedModule } from '@common/common-services/common-shared.module';
import { ModalGridComponent } from '@common/ui/modal-grid/modal-grid.component';
import { GridComponent } from '@common/grid/simple-grid/simple-grid.directive';
import { SelectGridDirective } from '@common/grid/select-grid/select-grid.directive';

export const CommonGridModule = angular
  .module('app.common.grid', [datatables, datatablesSelect, CommonSharedModule])
  .component('grid', GridComponent)
  .directive('selectGridDirective', SelectGridDirective)
  .component('modalGrid', ModalGridComponent).name;
