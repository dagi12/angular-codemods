/**
 * Created by Eryk Mariankowski on 09.08.2017.
 */
import { AttachmentService } from './attachment.service';
import { AttachmentModalComponent } from './attachment-modal.component';
import { AttachmentListComponent } from '@app/rentcar/common/attachment/attachment-list/attachment-list.component';
import { AttachmentTileComponent } from '@app/rentcar/common/attachment/attachment-list/attachment-tile.component';
import { FileReadDirective } from '@app/rentcar/common/attachment/file-read/file-read.directive';

export const AttachmentModule = angular
  .module('app.attachment', [])
  .component('attachmentList', AttachmentListComponent)
  .component('attachmentTile', AttachmentTileComponent)
  .service('attachmentService', AttachmentService)
  .directive('fileRead', FileReadDirective)
  .component('attachmentModal', AttachmentModalComponent).name;
