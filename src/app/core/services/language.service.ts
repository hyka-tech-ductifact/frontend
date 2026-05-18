import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('preferred-lang', lang);
  }

  initLanguage(): void {
    const savedLang = localStorage.getItem('preferred-lang');
    const lang = savedLang ?? this.translate.defaultLang ?? 'es';
    this.translate.use(lang);
  }
}
