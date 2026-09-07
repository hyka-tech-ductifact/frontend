import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { Client } from '../../../../../../core/models/client.model';

/**
 * Web/desktop presentation component for the clients page.
 * Renders the client list in a layout adapted for larger screens.
 */
@Component({
  selector: 'app-client-web',
  imports: [TranslatePipe],
  templateUrl: './client-web.component.html',
  styleUrls: ['./client-web.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientWebComponent {
  /** The list of clients to display. Defaults to an empty array. */
  readonly clients = input<Client[]>([]);

  /** The total number of clients reported by the API. */
  readonly totalClients = input(0);

  /** Whether a loading operation is in progress. */
  readonly isLoading = input(false);

  /** Emitted when the user requests to add a new client. */
  readonly addClient = output<void>();

  /** Emitted with the client id when the user requests deletion of a client. */
  readonly deleteClient = output<string>();

  /** Emitted with the client id when the user requests to view client details. */
  readonly viewDetails = output<string>();

  /**
   * Forwards the add-client action to the parent component.
   * @returns {void}
   */
  protected onAdd(): void {
    this.addClient.emit();
  }

  /**
   * Forwards the delete action to the parent component by emitting the client id.
   * @param {string} id - The unique identifier of the client to delete.
   * @returns {void}
   */
  protected onDelete(id: string): void {
    this.deleteClient.emit(id);
  }

  /**
   * Forwards the view-details action to the parent component by emitting the client id.
   * @param {string} id - The unique identifier of the client whose details to view.
   * @returns {void}
   */
  protected onView(id: string): void {
    this.viewDetails.emit(id);
  }
}
