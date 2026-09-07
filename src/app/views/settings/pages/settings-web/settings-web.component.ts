import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  CreateWorkerPayload,
  SettingsWorker,
  SettingsWorkerRole,
} from '../../../../core/services/settings.service';

/** Supported language values handled by the settings feature. */
type SettingsLanguage = 'en' | 'es';

/** Supported tab values rendered by the settings web screen. */
type SettingsTab = 'workers' | 'general';

/** Payload emitted when deleting a specific worker. */
export interface WorkerDeleteEvent {
  /** Unique worker identifier. */
  id: string;

  /** Worker display name used in confirmation prompts. */
  name: string;
}

/**
 * Desktop/web settings presentation component.
 * Renders Workers and General tabs and emits UI events to its smart parent.
 */
@Component({
  selector: 'app-settings-web',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings-web.component.html',
  styleUrl: './settings-web.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsWebComponent {
  /** Workers list rendered in the cards grid. */
  readonly workers = input<SettingsWorker[]>([]);

  /** Currently selected application language for the dropdown. */
  readonly selectedLanguage = input<SettingsLanguage>('es');

  /** Emits a language change request to the smart parent container. */
  readonly languageChange = output<SettingsLanguage>();

  /** Emits an add-worker request payload to the smart parent container. */
  readonly workerAdd = output<CreateWorkerPayload>();

  /** Emits a delete-worker request payload to the smart parent container. */
  readonly workerDelete = output<WorkerDeleteEvent>();

  /** Signal storing the active tab state. */
  readonly activeTab = signal<SettingsTab>('workers');

  /** Signal controlling visibility of the add-worker modal. */
  readonly isAddWorkerModalOpen = signal(false);

  /** Signal controlling visibility of the permissions modal. */
  readonly isPermissionsModalOpen = signal(false);

  /** Signal holding the worker currently selected for modal actions. */
  readonly selectedWorker = signal<SettingsWorker | null>(null);

  /** Reactive form used by the add-worker modal. */
  readonly addWorkerForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl<SettingsWorkerRole>('worker', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  /** Card count used by the total-workers stat tile. */
  readonly totalWorkers = computed(() => this.workers().length);

  /** Card count used by the active-workers stat tile. */
  readonly activeWorkers = computed(() => this.workers().length);

  /** Card count used by the supervisors stat tile. */
  readonly supervisorsCount = computed(
    () => this.workers().filter((worker) => worker.role === 'supervisor').length,
  );

  /** Card count used by the pending-workers stat tile. */
  readonly pendingWorkers = computed(() => 0);

  /**
   * Navigates back to the previous browser history entry.
   * @returns {void}
   */
  protected goBack(): void {
    window.history.back();
  }

  /**
   * Switches the content tab between Workers and General.
   * @param {SettingsTab} tab - Target tab to activate.
   * @returns {void}
   */
  protected switchTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  /**
   * Emits the selected language to the smart parent.
   * @param {Event} event - Native select change event carrying the language value.
   * @returns {void}
   */
  protected onLanguageSelect(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    const value = select?.value;
    if (value === 'en' || value === 'es') {
      this.languageChange.emit(value);
    }
  }

  /**
   * Opens the add-worker modal and resets its form state.
   * @returns {void}
   */
  protected openAddWorkerModal(): void {
    this.addWorkerForm.reset({
      name: '',
      email: '',
      role: 'worker',
    });
    this.isAddWorkerModalOpen.set(true);
  }

  /**
   * Opens the permissions modal for the selected worker.
   * @param {SettingsWorker} worker - Worker associated with the permissions dialog.
   * @returns {void}
   */
  protected openPermissionsModal(worker: SettingsWorker): void {
    this.selectedWorker.set(worker);
    this.isPermissionsModalOpen.set(true);
  }

  /**
   * Closes the add-worker modal.
   * @returns {void}
   */
  protected closeAddWorkerModal(): void {
    this.isAddWorkerModalOpen.set(false);
  }

  /**
   * Closes the permissions modal.
   * @returns {void}
   */
  protected closePermissionsModal(): void {
    this.isPermissionsModalOpen.set(false);
  }

  /**
   * Closes every open modal and clears current overlay state.
   * @returns {void}
   */
  protected closeAllModals(): void {
    this.isAddWorkerModalOpen.set(false);
    this.isPermissionsModalOpen.set(false);
  }

  /**
   * Submits the add-worker form and emits a payload for creation.
   * @returns {void}
   */
  protected submitAddWorker(): void {
    if (this.addWorkerForm.invalid) {
      this.addWorkerForm.markAllAsTouched();
      return;
    }

    const workerName = this.addWorkerForm.controls.name.value.trim();
    const workerEmail = this.addWorkerForm.controls.email.value.trim();
    const workerRole = this.addWorkerForm.controls.role.value;

    this.workerAdd.emit({
      name: workerName,
      email: workerEmail,
      role: workerRole,
    });

    this.closeAddWorkerModal();
  }

  /**
   * Emits a worker delete intent to the smart parent.
   * @param {SettingsWorker} worker - Worker selected for deletion.
   * @returns {void}
   */
  protected requestDeleteWorker(worker: SettingsWorker): void {
    this.workerDelete.emit({ id: worker.id, name: worker.name });
  }

  /**
   * Resolves the translated role key for a worker role value.
   * @param {SettingsWorkerRole} role - Worker role value.
   * @returns {string} Translation key for the role label.
   */
  protected getRoleLabelKey(role: SettingsWorkerRole): string {
    if (role === 'supervisor') return 'SETTINGS.WORKERS.ROLE_SUPERVISOR';
    if (role === 'administrator') return 'SETTINGS.WORKERS.ROLE_ADMINISTRATOR';
    return 'SETTINGS.WORKERS.ROLE_WORKER';
  }

  /**
   * Resolves badge CSS classes for the worker role chip.
   * @param {SettingsWorkerRole} role - Worker role value.
   * @returns {string} Tailwind utility classes for the role chip.
   */
  protected getRoleBadgeClass(role: SettingsWorkerRole): string {
    if (role === 'supervisor') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    if (role === 'administrator') {
      return 'bg-purple-50 text-purple-700 border-purple-100';
    }
    return 'bg-sky-50 text-sky-700 border-sky-100';
  }

  /**
   * Indicates whether a role should render broad management permissions.
   * @param {SettingsWorkerRole} role - Worker role value.
   * @returns {boolean} True when full-scope permissions should be shown.
   */
  protected hasFullPermissions(role: SettingsWorkerRole): boolean {
    return role === 'supervisor' || role === 'administrator';
  }

  /**
   * Resolves the header title key based on the active tab.
   * @returns {string} Translation key for the page title.
   */
  protected getPageTitleKey(): string {
    return this.activeTab() === 'workers'
      ? 'SETTINGS.HEADER.WORKERS_TITLE'
      : 'SETTINGS.HEADER.GENERAL_TITLE';
  }

  /**
   * Resolves the header subtitle key based on the active tab.
   * @returns {string} Translation key for the page subtitle.
   */
  protected getPageSubtitleKey(): string {
    return this.activeTab() === 'workers'
      ? 'SETTINGS.HEADER.WORKERS_SUBTITLE'
      : 'SETTINGS.HEADER.GENERAL_SUBTITLE';
  }
}
