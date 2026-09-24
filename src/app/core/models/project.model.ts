/** Lifecycle status of a client project. */
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * A construction project owned by a client.
 * `status` and `totalSquareMeters` are frontend-only fields: the current
 * backend `Project` entity does not yet expose them, so they are populated
 * from mock data until that API contract is extended.
 */
export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  address?: string;
  managerName?: string;
  phone?: string;
  status: ProjectStatus;
  totalSquareMeters: number;
  createdAt?: string;
}
