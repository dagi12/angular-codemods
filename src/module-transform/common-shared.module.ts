import uiRouter from '@uirouter/angularjs';
import ngCookies from 'angular-cookies';
import 'angular-jwt';
import 'angular-toastr';
import uiBootstrapModal from 'ui-bootstrap4/src/modal';
import 'ui-bootstrap4/dist/ui-bootstrap-csp.css';
import 'angular-loading-bar/build/loading-bar.min.css';
import dropzone from '@app/rentcar/common/attachment/ng-dropzone/ng-dropzone.module';
import { ClientFieldService } from '@app/rentcar/common/util/client-field.service';
import { ApplicationConfigService } from './application-config.service';
import { ModalService } from '@common/common-services/modal/modal.service';
import { SessionService } from './session.service';
import { UserService } from './user.service';
import { VerificationService } from './verification.service';
import { BASE_URL } from '@app/initialization/env.helper';
import angularLoadingBar from 'angular-loading-bar';
import ngAnimate from 'angular-animate';
import { DomainService } from '@common/common-services/domain.service';
import { PasswordResetService } from '@common/common-services/password-reset.service';
import { ui } from 'angular';
import uiBootstrapTypeahead from 'ui-bootstrap4/src/typeahead';
import uiBootstrapPopover from 'ui-bootstrap4/src/popover';
import uiBootstrapPagination from 'ui-bootstrap4/src/pagination';
import uiBootstrapDropdown from 'ui-bootstrap4/src/dropdown';

export const CommonSharedModule = angular
  .module('app.commonServices', [
    ngAnimate,
    angularLoadingBar,
    uiRouter,
    ngCookies,
    uiBootstrapModal,
    uiBootstrapTypeahead,
    uiBootstrapPopover,
    uiBootstrapPagination,
    uiBootstrapDropdown,
    'angular-jwt',
    'toastr',
    dropzone
  ])
  .config(
    /*@ngInject*/ ($uibModalProvider: ui.bootstrap.IModalProvider) =>
      {return Object.assign($uibModalProvider.options, {
        size: 'lg'
      })}
  )
  .config(
    /*@ngInject*/ dropzoneOpsProvider => {
      dropzoneOpsProvider.setOptions({
        autoProcessQueue: false,
        uploadMultiple: false,
        url: '/upload_url',
        dictDefaultMessage: 'Przeciągnij i upuść plik, aby dodać',
        maxFiles: 1
      });
    }
  )
  .service('modalService', ModalService)
  .service('clientFieldService', ClientFieldService)
  .service('userService', UserService)
  .service('domainService', DomainService)
  .service('passwordResetService', PasswordResetService)
  .service('sessionService', SessionService)
  .service('applicationConfigService', ApplicationConfigService)
  .service('verificationService', VerificationService)
  .constant('basePath', BASE_URL.slice(0, -1)).name;
