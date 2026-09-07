import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Supported worker role values for settings management. */
export type SettingsWorkerRole = 'worker' | 'supervisor' | 'administrator';

/**
 * Shape of a worker entity managed by the settings feature.
 */
export interface SettingsWorker {
  /** Stable worker identifier. */
  id: string;

  /** Full display name of the worker. */
  name: string;

  /** Email address used as the worker login reference. */
  email: string;

  /** Access level assigned to the worker. */
  role: SettingsWorkerRole;
}

/**
 * Input payload required to create a new worker in memory.
 */
export interface CreateWorkerPayload {
  /** Full display name of the worker to create. */
  name: string;

  /** Email address of the worker to create. */
  email: string;

  /** Initial role assigned to the worker. */
  role: SettingsWorkerRole;
}

/**
 * Stateful in-memory data source for the settings workers area.
 * Exposes simple mock CRUD operations backed by a BehaviorSubject.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  /** In-memory workers source used by the settings feature. */
  private readonly workersSubject = new BehaviorSubject<SettingsWorker[]>([
    {
      id: 'worker-ana',
      name: 'Ana Lopez',
      email: 'ana.lopez@climatech.es',
      role: 'worker',
    },
    {
      id: 'worker-miguel',
      name: 'Miguel Torres',
      email: 'miguel.torres@climatech.es',
      role: 'worker',
    },
    {
      id: 'worker-sofia',
      name: 'Sofia Ruiz',
      email: 'sofia.ruiz@climatech.es',
      role: 'supervisor',
    },
  ]);

  /**
   * Returns the workers stream for reactive UI rendering.
   * @returns {Observable<SettingsWorker[]>} Observable sequence of workers.
   */
  getWorkers(): Observable<SettingsWorker[]> {
    return this.workersSubject.asObservable();
  }

  /**
   * Adds a new worker to the in-memory collection.
   * @param {CreateWorkerPayload} payload - Worker data captured from the form UI.
   * @returns {void}
   */
  addWorker(payload: CreateWorkerPayload): void {
    const trimmedName = payload.name.trim();
    const trimmedEmail = payload.email.trim().toLowerCase();

    const newWorker: SettingsWorker = {
      id: this.buildWorkerId(trimmedName),
      name: trimmedName,
      email: trimmedEmail,
      role: payload.role,
    };

    this.workersSubject.next([newWorker, ...this.workersSubject.value]);
  }

  /**
   * Deletes an existing worker from the in-memory collection.
   * @param {string} workerId - The unique identifier of the worker to remove.
   * @returns {void}
   */
  deleteWorker(workerId: string): void {
    const updatedWorkers = this.workersSubject.value.filter((worker) => worker.id !== workerId);
    this.workersSubject.next(updatedWorkers);
  }

  /**
   * Creates a predictable, unique worker id for new records.
   * @param {string} workerName - Worker display name used as id seed.
   * @returns {string} A deterministic id suffix plus timestamp.
   */
  private buildWorkerId(workerName: string): string {
    const normalizedName = workerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `worker-${normalizedName || 'new'}-${Date.now()}`;
  }
}
