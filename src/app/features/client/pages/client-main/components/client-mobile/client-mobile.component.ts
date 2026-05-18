import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline, callOutline } from 'ionicons/icons';
import type { Client } from '../../../../models/client.models';

/**
 * Mobile presentation component for the clients page.
 * Renders the client list and action buttons adapted for small screens.
 */
@Component({
  selector: 'app-client-mobile',
  imports: [IonContent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonIcon],
  templateUrl: './client-mobile.component.html',
  styleUrls: ['./client-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMobileComponent {
  /** The list of clients to display. Defaults to an empty array. */
  readonly clients = input<Client[]>([]);

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
