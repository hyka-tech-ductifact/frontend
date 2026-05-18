import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DeviceService } from '../../../../core/services/device.service';
import { ClientService } from '../../services/client.service';
import { ClientMobileComponent } from './components/client-mobile/client-mobile.component';
import { ClientWebComponent } from './components/client-web/client-web.component';

@Component({
  selector: 'app-client-main',
  imports: [ClientMobileComponent, ClientWebComponent],
  templateUrl: './client-main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMainComponent {
  protected readonly deviceService = inject(DeviceService);
  protected readonly clientService = inject(ClientService);

  onDeleteClient(id: string): void {
    this.clientService.deleteClient(id);
  }

  onAddClient(): void {
    // TODO: Open add-client modal/form
  }
}
