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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import {
  CreateWorkerPayload,
  SettingsWorker,
  SettingsWorkerRole,
} from '../../../../core/services/settings.service';

/** Supported language values handled by the settings feature. */
type SettingsLanguage = 'en' | 'es';

/** Supported tab values rendered by the settings mobile screen. */
type SettingsTab = 'workers' | 'general';

/** Payload emitted when deleting a specific worker. */
export interface WorkerDeleteEvent {
  /** Unique worker identifier. */
  id: string;

  /** Worker display name used in confirmation prompts. */
  name: string;
}

/**
 * Mobile settings presentation component.
 * Mirrors the `new-client-mobile` hero header pattern and renders the
 * Workers/General tabs in a scrollable body with mock worker CRUD actions.
 */
@Component({
  selector: 'app-settings-mobile',
  imports: [ReactiveFormsModule, TranslatePipe, IonHeader, IonToolbar],
  templateUrl: './settings-mobile.component.html',
  styleUrl: './settings-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsMobileComponent {
  /** Browser location service used to navigate back to the previous view. */
  private readonly location = inject(Location);

  /** Workers list rendered in the cards list. */
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

  /** Count rendered in the about card for consistency with design data. */
  readonly totalWorkers = computed(() => this.workers().length);

  /**
   * Navigates back to the previous view in the browser history stack.
   * @returns {void}
   */
  goBack(): void {
    this.location.back();
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
}
