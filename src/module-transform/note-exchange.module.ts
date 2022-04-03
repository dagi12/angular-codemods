/**
 *  Stworzone przez Eryk Mariankowski dnia 11.09.2017.
 */
import { NoteExchangeModalComponent } from './note-exchange-modal/note-exchange-modal.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { OrderNoteExchangeComponent } from './order-note-exchange.component';
import { RentNoteExchangeComponent } from './rent-note-exchange.component';

export const NoteExchangeModule = angular
  .module('app.rentcar.note', [CommonUiModule])
  .component('orderNoteExchange', OrderNoteExchangeComponent)
  .component('rentNoteExchange', RentNoteExchangeComponent)
  .component('noteExchangeModal', NoteExchangeModalComponent).name;
