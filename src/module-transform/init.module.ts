import { CommonSharedModule } from '@common/common-services/common-shared.module';
import { PreInitializationService } from './pre/pre-initialization.service';
import { PostInitializationService } from './post/post-initialization.service';
import { ApplicationInitialization } from './application-initialiation.helper';

export const InitModule = angular
  .module('app.init', [CommonSharedModule])
  .service('preInitializationService', PreInitializationService)
  .service('postInitializationService', PostInitializationService)
  .service('applicationInitialization', ApplicationInitialization).name;
