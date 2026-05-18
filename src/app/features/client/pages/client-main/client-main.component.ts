import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DeviceService } from '../../../../core/services/device.service';
import { ClientService } from '../../services/client.service';
import { ClientMobileComponent } from './components/client-mobile/client-mobile.component';
import { ClientWebComponent } from './components/client-web/client-web.component';

/**
 * Smart (container) component for the clients main page.
 * Delegates presentation to platform-specific sub-components and coordinates
 * client management operations through `ClientService`.
 */
@Component({
  selector: 'app-client-main',
  imports: [ClientMobileComponent, ClientWebComponent],
  templateUrl: './client-main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMainComponent {
  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);

  /** Service that provides and manages the list of clients. */
  protected readonly clientService = inject(ClientService);

  /**
   * Handles the delete-client event emitted by a child component.
   * Delegates removal to `ClientService`.
   * @param {string} id - The unique identifier of the client to delete.
   * @returns {void}
   */
  onDeleteClient(id: string): void {
    this.clientService.deleteClient(id);
  }

  /**
   * Handles the add-client event emitted by a child component.
   * Intended to open an add-client modal or navigation form.
   * @returns {void}
   */
  onAddClient(): void {
    // TODO: Open add-client modal/form
  }
}
