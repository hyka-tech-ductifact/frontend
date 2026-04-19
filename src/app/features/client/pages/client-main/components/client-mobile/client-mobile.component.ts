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

@Component({
  selector: 'app-client-mobile',
  imports: [IonContent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonIcon],
  templateUrl: './client-mobile.component.html',
  styleUrls: ['./client-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMobileComponent {
  readonly clients = input<Client[]>([]);
  readonly isLoading = input(false);

  readonly addClient = output<void>();
  readonly deleteClient = output<string>();

  /**
   *
   */
  constructor() {
    addIcons({ trashOutline, addOutline, callOutline });
  }

  /**
   *
   * @param id
   */
  onDelete(id: string): void {
    this.deleteClient.emit(id);
  }

  /**
   *
   */
  onAdd(): void {
    this.addClient.emit();
  }
}
