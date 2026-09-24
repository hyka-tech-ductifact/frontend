import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import type { Client } from '../../../../../core/models/client.model';
import type { Project, ProjectStatus } from '../../../../../core/models/project.model';

/** Mock client used as a fallback when the API is unavailable during development. */
const MOCK_CLIENT: Client = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Hotel Mediterráneo',
  phone: '+34 963 123 456',
  email: 'contact@hotelmediterraneo.es',
  description: 'Main construction partner',
  user_id: '550e8400-e29b-41d4-a716-446655440000',
};

/** Mock projects mirroring the "Hotel Mediterráneo" HTML design mockups. */
const MOCK_PROJECTS: Project[] = [
  {
    id: 'a1b2c3d4-0000-4000-8000-000000000001',
    clientId: MOCK_CLIENT.id,
    name: 'Climatización Planta 1 y 2',
    description: 'Instalación de conductos para 60 habitaciones',
    status: 'in_progress',
    totalSquareMeters: 194.1,
    createdAt: '2026-01-12',
  },
  {
    id: 'a1b2c3d4-0000-4000-8000-000000000002',
    clientId: MOCK_CLIENT.id,
    name: 'Zona Spa y Piscina',
    description: 'Sistema de climatización para área de spa',
    status: 'not_started',
    totalSquareMeters: 0,
    createdAt: '2026-01-18',
  },
  {
    id: 'a1b2c3d4-0000-4000-8000-000000000003',
    clientId: MOCK_CLIENT.id,
    name: 'Recepción Principal',
    description: 'Instalación de cortinas de aire y split',
    status: 'completed',
    totalSquareMeters: 78.5,
    createdAt: '2026-01-05',
  },
];

/** Describes the next lifecycle status a project moves to when advanced. */
const NEXT_STATUS: Record<ProjectStatus, ProjectStatus> = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'completed',
};

/**
 * API service for the "Client Projects" feature.
 * Resolves the owning client and lists its projects, falling back to mock
 * data so the feature renders cleanly while the backend contract evolves.
 */
@Injectable({ providedIn: 'root' })
export class ClientProjectsService {
  private readonly http = inject(HttpClient);

  /** Projects currently loaded for the active client. */
  readonly projects = signal<Project[]>([]);

  /** Whether a projects request is in progress. */
  readonly isLoading = signal(false);

  /** Last error message produced while loading projects, if any. */
  readonly error = signal<string | null>(null);

  /**
   * Fetches a client by id, falling back to mock data when the request fails.
   * @param {string} clientId - Unique client identifier.
   * @returns {Observable<Client>} Stream emitting the resolved client.
   */
  getClientById(clientId: string): Observable<Client> {
    return this.http
      .get<Client>(`${environment.apiUrl}/clients/${clientId}`)
      .pipe(catchError(() => of({ ...MOCK_CLIENT, id: clientId })));
  }

  /**
   * Loads the projects owned by a client and syncs the `projects` signal.
   * @param {string} clientId - Unique client identifier.
   * @returns {Observable<Project[]>} Stream emitting the client's projects.
   */
  getClientProjects(clientId: string): Observable<Project[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return of(MOCK_PROJECTS.map((project) => ({ ...project, clientId }))).pipe(
      tap((projects) => {
        this.projects.set(projects);
        this.isLoading.set(false);
      }),
    );
  }

  /**
   * Advances a project to its next lifecycle status.
   * @param {string} projectId - Unique project identifier.
   * @returns {void}
   */
  advanceProjectStatus(projectId: string): void {
    this.projects.update((projects) =>
      projects.map((project) =>
        project.id === projectId ? { ...project, status: NEXT_STATUS[project.status] } : project,
      ),
    );
  }

  /**
   * Removes a project from the local project list.
   * @param {string} projectId - Unique project identifier.
   * @returns {void}
   */
  deleteProject(projectId: string): void {
    this.projects.update((projects) => projects.filter((project) => project.id !== projectId));
  }
}
