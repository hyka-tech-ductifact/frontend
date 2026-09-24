import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { Client } from '../../../../../../core/models/client.model';
import type { Project, ProjectStatus } from '../../../../../../core/models/project.model';

/**
 * Desktop/web presentation component for the client projects page.
 * Renders the client header, summary stats, and the projects grid.
 */
@Component({
  selector: 'app-client-projects-web',
  imports: [TranslatePipe],
  templateUrl: './client-projects-web.component.html',
  styleUrl: './client-projects-web.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientProjectsWebComponent {
  private readonly location = inject(Location);

  /** Client that owns the displayed projects. */
  readonly client = input<Client | null>(null);

  /** Projects rendered in the grid. */
  readonly projects = input<Project[]>([]);

  /** Whether a loading operation is in progress. */
  readonly isLoading = input(false);

  /** Emitted when the user requests to create a new project. */
  readonly addProject = output<void>();

  /** Emitted with the project id when the user advances its status. */
  readonly advanceStatus = output<string>();

  /** Emitted with the project id when the user confirms a project deletion. */
  readonly deleteProject = output<string>();

  /** Project currently targeted by the delete confirmation modal, if any. */
  private readonly projectPendingDelete = signal<Project | null>(null);

  /** Total number of projects owned by the client. */
  readonly totalProjects = computed(() => this.projects().length);

  /** Number of projects currently in progress. */
  readonly inProgressCount = computed(
    () => this.projects().filter((project) => project.status === 'in_progress').length,
  );

  /** Number of completed projects. */
  readonly completedCount = computed(
    () => this.projects().filter((project) => project.status === 'completed').length,
  );

  /** Sum of the square meters ordered across every project. */
  readonly totalSquareMeters = computed(() =>
    this.projects().reduce((total, project) => total + project.totalSquareMeters, 0),
  );

  /** Whether the delete confirmation modal is currently open. */
  readonly isDeleteModalOpen = computed(() => this.projectPendingDelete() !== null);

  /** Name of the project pending deletion, used in the confirmation modal. */
  readonly projectPendingDeleteName = computed(() => this.projectPendingDelete()?.name ?? '');

  /**
   * Navigates back to the client list.
   * @returns {void}
   */
  protected goBack(): void {
    this.location.back();
  }

  /**
   * Forwards the add-project action to the smart parent.
   * @returns {void}
   */
  protected onAdd(): void {
    this.addProject.emit();
  }

  /**
   * Forwards the advance-status action to the smart parent, unless the
   * project is already completed.
   * @param {Project} project - Project whose status should advance.
   * @returns {void}
   */
  protected onAdvance(project: Project): void {
    if (project.status === 'completed') return;
    this.advanceStatus.emit(project.id);
  }

  /**
   * Opens the delete confirmation modal for a project.
   * @param {Project} project - Project targeted for deletion.
   * @returns {void}
   */
  protected requestDelete(project: Project): void {
    this.projectPendingDelete.set(project);
  }

  /**
   * Closes the delete confirmation modal without deleting anything.
   * @returns {void}
   */
  protected cancelDelete(): void {
    this.projectPendingDelete.set(null);
  }

  /**
   * Confirms the pending deletion and forwards it to the smart parent.
   * @returns {void}
   */
  protected confirmDelete(): void {
    const project = this.projectPendingDelete();
    if (!project) return;
    this.deleteProject.emit(project.id);
    this.projectPendingDelete.set(null);
  }

  /**
   * Resolves the translation key for a project's status badge.
   * @param {ProjectStatus} status - Project status value.
   * @returns {string} Translation key for the status label.
   */
  protected getStatusLabelKey(status: ProjectStatus): string {
    if (status === 'in_progress') return 'CLIENTS.PROJECTS.STATUS.IN_PROGRESS';
    if (status === 'completed') return 'CLIENTS.PROJECTS.STATUS.COMPLETED';
    return 'CLIENTS.PROJECTS.STATUS.NOT_STARTED';
  }

  /**
   * Resolves the translation key for a project's primary action button.
   * @param {ProjectStatus} status - Project status value.
   * @returns {string} Translation key for the action label.
   */
  protected getActionLabelKey(status: ProjectStatus): string {
    if (status === 'not_started') return 'CLIENTS.PROJECTS.CARD.CHANGE_TO_IN_PROGRESS';
    if (status === 'in_progress') return 'CLIENTS.PROJECTS.CARD.CHANGE_TO_COMPLETED';
    return 'CLIENTS.PROJECTS.CARD.VIEW_DETAILS';
  }

  /**
   * Resolves the badge CSS classes for a project's status chip.
   * @param {ProjectStatus} status - Project status value.
   * @returns {string} Tailwind utility classes for the status chip.
   */
  protected getStatusBadgeClass(status: ProjectStatus): string {
    if (status === 'in_progress') {
      return 'bg-sky-50 text-sky-600 border-sky-100';
    }
    if (status === 'completed') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  }

  /**
   * Resolves the icon gradient CSS classes for a project card.
   * @param {ProjectStatus} status - Project status value.
   * @returns {string} Tailwind gradient utility classes for the card icon.
   */
  protected getIconGradientClass(status: ProjectStatus): string {
    if (status === 'in_progress') return 'from-sky-400 to-blue-600';
    if (status === 'completed') return 'from-emerald-500 to-emerald-600';
    return 'from-slate-400 to-slate-500';
  }

  /**
   * Resolves the metrics box CSS classes for a project card.
   * @param {ProjectStatus} status - Project status value.
   * @returns {string} Tailwind utility classes for the metrics box.
   */
  protected getMetricsBoxClass(status: ProjectStatus): string {
    if (status === 'in_progress') return 'bg-sky-50 border-sky-100';
    if (status === 'completed') return 'bg-emerald-50 border-emerald-100';
    return 'bg-slate-50 border-slate-100';
  }

  /**
   * Resolves the metrics value text CSS classes for a project card.
   * @param {ProjectStatus} status - Project status value.
   * @returns {string} Tailwind utility classes for the metrics value text.
   */
  protected getMetricsValueClass(status: ProjectStatus): string {
    if (status === 'in_progress') return 'text-sky-700';
    if (status === 'completed') return 'text-emerald-700';
    return 'text-slate-700';
  }
}
