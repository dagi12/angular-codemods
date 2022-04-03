import { RoadCardService } from './road-card.service';
import { RoadCardListComponent } from './list/road-card-list.component';
import { RoadCardCourseTableComponent } from 'src/app/road-card/course/road-card-course-table.component';
import { CourseModalAddComponent } from './course-modal-add/course-modal-add.component';
import { RoadCardNavComponent } from 'src/app/road-card/road-card-nav/road-card-nav.component';
import { CourseInfoComponent } from './course-info/course-info.component';
import { CourseModalEditComponent } from './course-modal-edit/course-modal-edit.component';
import { CourseModalComponent } from './course-modal/course-modal.component';
import { RoadCardSettingsComponent } from '../superuser/settings/road-card-settings/road-card-settings.component';
import { StateProvider } from '@uirouter/angularjs/lib/stateProvider';

/*@ngInject*/
function routeConfig($stateProvider: StateProvider) {
  $stateProvider
    .state('main.card', {
      abstract: true,
      url: '/card',
      template: '<div ui-view></div>'
    })
    .state('main.card.course', {
      url: '/course',
      component: 'roadCardCourseTable',
      params: {
        roadCard: null
      },
      data: { pageTitle: 'Karty drogowe' }
    })
    .state('main.card.list', {
      url: '/list',
      component: 'roadCardList',
      data: { pageTitle: 'Karty drogowe' }
    });
}

/**
 *  Stworzone przez Eryk Mariankowski dnia 18.01.18.
 */
export const RoadCardModule = angular
  .module('app.roadCard', [])
  .component('roadCardNav', RoadCardNavComponent)
  .component('roadCardCourseTable', RoadCardCourseTableComponent)
  .component('roadCardList', RoadCardListComponent)
  .component('courseModal', CourseModalComponent)
  .component('courseModalAdd', CourseModalAddComponent)
  .component('courseModalEdit', CourseModalEditComponent)
  .component('courseInfo', CourseInfoComponent)
  .component('roadCardSettings', RoadCardSettingsComponent)
  .service('roadCardService', RoadCardService)
  .config(routeConfig).name;
