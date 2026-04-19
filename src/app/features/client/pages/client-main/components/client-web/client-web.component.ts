import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Client } from '../../../../models/client.models';

@Component({
  selector: 'app-client-web',
  imports: [],
  templateUrl: './client-web.component.html',
  styleUrls: ['./client-web.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientWebComponent {
  readonly clients = input<Client[]>([]);
  readonly isLoading = input(false);

  readonly addClient = output<void>();
  readonly deleteClient = output<string>();
  readonly viewDetails = output<string>();

  protected onAdd(): void {
    this.addClient.emit();
  }

  protected onDelete(id: string): void {
    this.deleteClient.emit(id);
  }

  protected onView(id: string): void {
    this.viewDetails.emit(id);
  }
}
