import { Injectable, signal } from '@angular/core';
import type { Client } from '../models/client.models';

@Injectable({ providedIn: 'root' })
export class ClientService {
  readonly clients = signal<Client[]>([
    {
      id: '1',
      name: 'Hotel Mediterráneo',
      phone: '+34 963 123 456',
      email: 'info@hotelmediterraneo.es',
    },
    {
      id: '2',
      name: 'Centro Comercial Plaza Norte',
      phone: '+34 912 345 678',
      email: 'contacto@plazanorte.com',
    },
    {
      id: '3',
      name: 'Oficinas TechPark',
      phone: '+34 934 567 890',
      email: 'admin@techpark.es',
    },
  ]);

  readonly isLoading = signal(false);

  addClient(client: Omit<Client, 'id'>): void {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
    };
    this.clients.update((list) => [...list, newClient]);
  }

  deleteClient(id: string): void {
    this.clients.update((list) => list.filter((c) => c.id !== id));
  }
}
