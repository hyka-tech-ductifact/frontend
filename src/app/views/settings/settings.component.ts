import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import {
  CreateWorkerPayload,
  SettingsService,
  SettingsWorker,
} from '../../core/services/settings.service';
import { StorageService } from '../../core/services/storage.service';
import { SettingsMobileComponent } from './pages/settings-mobile/settings-mobile.component';
import { SettingsWebComponent } from './pages/settings-web/settings-web.component';

/** Storage key used to persist the active app language. */
const PREFERRED_LANG_KEY = 'preferred-lang';

/** Supported UI language options for this feature. */
type SettingsLanguage = 'en' | 'es';

/** Delete-event contract emitted by settings presentation components. */
interface WorkerDeleteEvent {
  /** Unique worker identifier to remove. */
  id: string;

  /** Worker display name used in confirmation prompts. */
  name: string;
}

/**
 * Smart container for the settings page.
 * Owns state, language persistence, and worker CRUD orchestration.
 */
@Component({
  selector: 'app-settings',
  imports: [SettingsWebComponent, SettingsMobileComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  /** Service that stores the workers in a reactive in-memory subject. */
  private readonly settingsService = inject(SettingsService);

  /** Storage adapter used to persist language preferences across sessions. */
  private readonly storageService = inject(StorageService);

  /** Translation service used to switch and resolve locale content. */
  private readonly translateService = inject(TranslateService);

  /** Reactive workers list consumed by both web and mobile presentations. */
  protected readonly workers = toSignal(this.settingsService.getWorkers(), {
    initialValue: [] as SettingsWorker[],
  });

  /** Current language selected by the user in the settings view. */
  protected currentLanguage: SettingsLanguage = 'es';

  /**
   * Loads the persisted language on component bootstrap.
   * @returns {void}
   */
  ngOnInit(): void {
    void this.initializeLanguage();
  }

  /**
   * Handles language switch events emitted by child components.
   * @param {SettingsLanguage} language - New locale selected by the user.
   * @returns {void}
   */
  protected onLanguageChange(language: SettingsLanguage): void {
    this.currentLanguage = language;
    this.translateService.use(language);
    void this.storageService.set(PREFERRED_LANG_KEY, language);
  }

  /**
   * Handles add-worker events emitted by child components.
   * @param {CreateWorkerPayload} payload - Worker form payload to insert.
   * @returns {void}
   */
  protected onWorkerAdd(payload: CreateWorkerPayload): void {
    this.settingsService.addWorker(payload);
  }

  /**
   * Handles delete-worker events with a user confirmation guard.
   * @param {WorkerDeleteEvent} payload - Worker identity information for deletion.
   * @returns {void}
   */
  protected onWorkerDelete(payload: WorkerDeleteEvent): void {
    const question = this.translateService.instant('SETTINGS.WORKERS.DELETE_CONFIRM', {
      name: payload.name,
    });

    const userConfirmed = window.confirm(question);
    if (!userConfirmed) return;

    this.settingsService.deleteWorker(payload.id);
  }

  /**
   * Restores the language from persisted storage and applies it in ngx-translate.
   * @returns {Promise<void>} Resolves when the language has been restored.
   */
  private async initializeLanguage(): Promise<void> {
    const storedLanguage = await this.storageService.get(PREFERRED_LANG_KEY);
    if (storedLanguage === 'en' || storedLanguage === 'es') {
      this.currentLanguage = storedLanguage;
      this.translateService.use(storedLanguage);
      return;
    }

    const activeLanguage = this.translateService.currentLang;
    if (activeLanguage === 'en' || activeLanguage === 'es') {
      this.currentLanguage = activeLanguage;
      return;
    }

    this.currentLanguage = 'es';
    this.translateService.use('es');
  }
}
