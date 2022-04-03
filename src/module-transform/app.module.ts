import { ZamGlobalsService } from '@app/config/zam-globals.service';
import { ClientWizardModule } from '@client/client-wizard.module';
// noinspection JSDeprecatedSymbols
import {
  LocationServices,
  StateProvider,
  StateRegistry,
  UrlRouterProvider
} from '@uirouter/angularjs';
import { auto, IHttpProvider, jwt } from 'angular';
import ngAnimate from 'angular-animate';
import ngAria from 'angular-aria';
import enLocale from 'angular-i18n/en';
import plLocale from 'angular-i18n/pl';
import 'angular-moment';
import ngTranslate from 'angular-translate';
import 'chosen-js';
import { Run } from 'src/app/config/run';
import { NavHeaderComponent } from 'src/app/rentcar/navigation/nav-header/nav-header.component';
import { NavigationComponent } from 'src/app/rentcar/navigation/navigation.component';
import apiModule from 'src/zamowienia-openapi/api.module';
import enTranslations from '../translations/en.json';
import plTranslations from '../translations/pl.json';
import appViewHtml from './app.html';
import { CarLockModule } from './car-lock/car-lock.module';
import { ClientSearchModule } from './client-search/client-search.module';
import { DocumentModule } from './document/document.module';
import { GridModule } from './grid/grid.module';
import { InitModule } from './initialization/init.module';
import { MyHttpInterceptor } from './initialization/my-http-interceptor.factory';
import { LoginModule } from './login/login.module';
import { PickdropModule } from './pickdrop/pickdrop.module';
import { RentChartModule } from './rent-chart/rent-chart.module';
import { RentcarModule } from './rentcar/rentcar.module';
import { RoadCardModule } from './road-card/road-card.module';
import { SuperUserModule } from './superuser/superuser.module';

const MyHttpInterceptorFactoryName = 'MyHttpInterceptorFactory';

const modules = [
  ngAria,
  ngAnimate,
  ngTranslate,
  enLocale,
  plLocale,
  ClientWizardModule,
  RentcarModule,
  SuperUserModule,
  GridModule,
  RentChartModule,
  PickdropModule,
  LoginModule,
  InitModule,
  CarLockModule,
  ClientSearchModule,
  DocumentModule,
  apiModule.name
];

modules.push(RoadCardModule);

// noinspection JSUnusedGlobalSymbols,JSDeprecatedSymbols
export const AppModule = angular
  .module('app', modules)
  .component('sideNavigation', NavigationComponent)
  .component('navHeader', NavHeaderComponent)
  .service('zamGlobals', ZamGlobalsService)
  .factory(MyHttpInterceptorFactoryName, MyHttpInterceptor)
  // Nie wiem dokładnie jak to działa, ale robi tak, że większość elementów jest animowanych,
  // brak tego animuje elementu "<form>", które psują animacje kreatora
  .config(
    /*@ngIneject*/ $animateProvider => {
      return $animateProvider.classNameFilter(/ng-scope/);
    }
  )
  .config([
    'uiMask.ConfigProvider',
    function (uiMaskConfigProvider) {
      uiMaskConfigProvider.clearOnBlur(false);
    }
  ])
  .config(
    /*@ngInject*/ (
      $httpProvider: IHttpProvider,
      $stateProvider: StateProvider,
      $urlRouterProvider: UrlRouterProvider
    ) => {
      // noinspection JSUnusedLocalSymbols
      $urlRouterProvider.otherwise(
        // To musi być funkcja
        // eslint-disable-next-line prefer-arrow-callback,@typescript-eslint/no-unused-vars
        function ($injector: auto.IInjectorService, $location: LocationServices) {
          const authManager: jwt.IAuthManagerServiceProvider = $injector.get('authManager');
          if (authManager.isAuthenticated()) {
            const zamGlobals: ZamGlobalsService = $injector.get('zamGlobals') as any;
            const $stateRegistry: StateRegistry = $injector.get('$stateRegistry') as any;
            return $stateRegistry.get(zamGlobals.startState()).url;
          }
          return '/login';
        }
      );

      $stateProvider.state('main', {
        url: '/main',
        resolve: {
          config: /*@ngInject*/ userService => {
            return userService.initialized || userService.promise;
          }
        },
        template: appViewHtml
      });
      $httpProvider.defaults.headers.common.Accept = 'application/json';
      $httpProvider.interceptors.push(MyHttpInterceptorFactoryName);
    }
  )
  .config(
    /*@ngInject*/ $translateProvider => {
      return (
        $translateProvider
          // Skutkuje błędem w konsoli przeglądarki, ale usunięcie tego wywala translator na
          // polskich znakach
          // .useSanitizeValueStrategy('sanitize')
          .translations('en', enTranslations as any)
          .translations('pl', plTranslations as any)
          .preferredLanguage('pl')
      );
    }
    // TODO tłumaczenia, sprawdź czy działa na różnych przeglądarkach
    // .determinePreferredLanguage(() => {
    //   return $translateProvider.resolveClientLocale().split("_")[0];
    // })
  )
  .run(Run)
  .name;
