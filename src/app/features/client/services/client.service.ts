import { Injectable, signal } from '@angular/core';
import type { Client } from '../models/client.models';

/**
 * Service that manages the in-memory list of clients.
 * Exposes reactive signals for the client list and loading state.
 */
@Injectable({ providedIn: 'root' })
export class ClientService {
  /** Signal holding the current list of clients. Pre-populated with sample data. */
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

  /** Signal that reflects whether an asynchronous operation is in progress. */
  readonly isLoading = signal(false);

  /**
   * Adds a new client to the list, auto-generating a unique id from the current timestamp.
   * @param {Omit<Client, 'id'>} client - The client data without an id.
   * @returns {void}
   */
  addClient(client: Omit<Client, 'id'>): void {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
    };
    this.clients.update((list) => [...list, newClient]);
  }

  /**
   * Removes the client with the given id from the list.
   * @param {string} id - The unique identifier of the client to remove.
   * @returns {void}
   */
  deleteClient(id: string): void {
    this.clients.update((list) => list.filter((c) => c.id !== id));
  }
}
