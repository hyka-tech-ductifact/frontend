import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ConfigService } from './core/config/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({}),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({ fallbackLang: 'es' }),
    ...provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    {
      provide: APP_INITIALIZER,
      /**
       * Returns the initializer function that Angular DI invokes before bootstrap.
       * Triggers {@link ConfigService.load} to fetch and validate `/config.json`.
       * @param {ConfigService} config - The singleton {@link ConfigService} instance.
       * @returns {() => Promise<void>} Async initializer resolved before app mounts.
       */
      useFactory: (config: ConfigService) => () => config.load(),
      deps: [ConfigService],
      multi: true,
    },
  ],
};
