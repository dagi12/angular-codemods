import { CommonSharedModule } from '@common/common-services/common-shared.module';
import { LoginComponent } from 'src/app/login/login.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { ChangePasswordModalComponent } from './change-password/change-password-modal.component';
import { EmailPasswordComponent } from './email-password/email-password.component';
import { LoginRoutes } from './login.routes';
import { JwtConfig, JwtInit } from './jwt/jwt.helper';
import { EulaModalComponent } from './eula-modal/eula-modal.component';

export const LoginModule = angular
  .module('app.login', [CommonUiModule, CommonSharedModule])
  .component('changePasswordModal', ChangePasswordModalComponent)
  .component('eulaModal', EulaModalComponent)
  .component('login', LoginComponent)
  .component('emailPassword', EmailPasswordComponent)
  .config(LoginRoutes)
  .config(JwtConfig)
  .run(JwtInit).name;
