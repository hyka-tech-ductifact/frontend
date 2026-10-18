import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Client,
  CreateClientDto,
  PaginatedClientsResponse,
  UpdateClientDto,
} from '../models/client.model';

/** Mock client used as a fallback so the UI renders during development when the API is unreachable. */
const MOCK_CLIENTS: Client[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Hotel Mediterráneo',
    phone: '+34 963 123 456',
    email: 'contact@hotelmediterraneo.es',
    description: 'Main construction partner',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
  },
];

/**
 * Ensures the mock demo client is present in a resolved client list, appending
 * it when the API response doesn't already include it (e.g. a fresh/staging
 * database with no matching record) so the client-projects demo is reachable.
 * @param {Client[]} clients - Clients resolved from the API.
 * @returns {Client[]} Clients guaranteed to include the mock demo client.
 */
function ensureMockClientPresent(clients: Client[]): Client[] {
  const hasMockClient = clients.some((client) => client.id === MOCK_CLIENTS[0].id);
  return hasMockClient ? clients : [...clients, ...MOCK_CLIENTS];
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);

  readonly clients = signal<Client[]>([]);
  readonly totalClients = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Loads a page of clients and syncs the service state signals.
   * @param {number} page - Page number to request.
   * @param {number} pageSize - Number of clients per page.
   * @returns {Observable<PaginatedClientsResponse>} Stream of the API response.
   */
  getClients(page = 1, pageSize = 20): Observable<PaginatedClientsResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http
      .get<PaginatedClientsResponse>(`${environment.apiUrl}/clients`, {
        params,
      })
      .pipe(
        tap((response) => {
          const clientsWithMock = ensureMockClientPresent(response.data);
          this.clients.set(clientsWithMock);
          this.totalClients.set(clientsWithMock.length);
        }),
        catchError((error: unknown) => {
          this.clients.set(MOCK_CLIENTS);
          this.totalClients.set(MOCK_CLIENTS.length);
          this.error.set(this.extractErrorMessage(error));
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      );
  }

  /**
   * Creates a client record through the API.
   * @param {CreateClientDto} payload - The client payload.
   * @returns {Observable<Client>} Stream of the created client response.
   */
  createClient(payload: CreateClientDto): Observable<Client> {
    return this.http.post<Client>(`${environment.apiUrl}/clients`, payload);
  }

  /**
   * Placeholder for future client detail lookup flow.
   * @param {string} id - The client identifier.
   */
  getClientById(id: string): void {
    void id;
  }

  /**
   * Placeholder for future client update flow.
   * @param {string} id - The client identifier.
   * @param {UpdateClientDto} payload - The partial client payload.
   */
  updateClient(id: string, payload: UpdateClientDto): void {
    void id;
    void payload;
  }

  /**
   * Placeholder for future client deletion flow.
   * @param {string} id - The client identifier.
   */
  deleteClient(id: string): void {
    void id;
  }

  /**
   * Extracts a user-friendly message from an HTTP or runtime error.
   * @param {unknown} error - The captured error value.
   * @returns {string} A user-friendly message.
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (error && typeof error === 'object') {
      const response = error as {
        error?: { message?: string } | string;
        message?: string;
        statusText?: string;
      };

      if (typeof response.error === 'string' && response.error.trim()) {
        return response.error;
      }

      if (
        response.error &&
        typeof response.error === 'object' &&
        'message' in response.error &&
        typeof response.error.message === 'string' &&
        response.error.message.trim()
      ) {
        return response.error.message;
      }

      if (typeof response.message === 'string' && response.message.trim()) {
        return response.message;
      }

      if (typeof response.statusText === 'string' && response.statusText.trim()) {
        return response.statusText;
      }
    }

    return 'No se pudieron cargar los clientes.';
  }
}
