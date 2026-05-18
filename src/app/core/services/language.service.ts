import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Service responsible for managing the application's active language.
 * Persists the user's language preference in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  /**
   * Switches the active language and saves the selection to localStorage.
   * @param {string} lang - The BCP 47 language code to activate (e.g. 'en', 'es').
   * @returns {void}
   */
  changeLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('preferred-lang', lang);
  }

  /**
   * Initializes the language from the persisted preference in localStorage,
   * falling back to the translate service's default language or 'es'.
   * @returns {void}
   */
  initLanguage(): void {
    const savedLang = localStorage.getItem('preferred-lang');
    const lang = savedLang ?? this.translate.defaultLang ?? 'es';
    this.translate.use(lang);
  }
}
