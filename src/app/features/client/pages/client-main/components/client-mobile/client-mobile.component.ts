import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { addOutline, callOutline, trashOutline } from 'ionicons/icons';
import type { Client } from '../../../../models/client.models';

/**
 * Mobile presentation component for the clients page.
 * Renders the client list and action buttons adapted for small screens.
 */
@Component({
  selector: 'app-client-mobile',
  imports: [IonContent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonIcon, TranslatePipe],
  templateUrl: './client-mobile.component.html',
  styleUrls: ['./client-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMobileComponent {
  /** The list of clients to display. Defaults to an empty array. */
  readonly clients = input<Client[]>([]);

  /** The signed-in user's display name for the mobile header. */
  readonly userName = input('Usuario');

  /** Whether a loading operation is in progress. */
  readonly isLoading = input(false);

  /** Emitted when the user requests to add a new client. */
  readonly addClient = output<void>();

  /** Emitted with the client id when the user requests deletion of a client. */
  readonly deleteClient = output<string>();

  /**
   * Registers the Ionicons used in this component's template.
   */
  constructor() {
    addIcons({ trashOutline, addOutline, callOutline });
  }

  /**
   * Forwards the delete action to the parent component by emitting the client id.
   * @param {string} id - The unique identifier of the client to delete.
   * @returns {void}
   */
  onDelete(id: string): void {
    this.deleteClient.emit(id);
  }

  /**
   * Forwards the add-client action to the parent component.
   * @returns {void}
   */
  onAdd(): void {
    this.addClient.emit();
  }
}
