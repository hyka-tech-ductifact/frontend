import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { ConfigService } from './core/config/config.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

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
       * Triggers config loading first, then silently restores any refreshable session
       * before the router begins activating protected routes.
       * @param {ConfigService} config - The singleton {@link ConfigService} instance.
       * @param {AuthService} auth - The singleton auth service used to rehydrate session state.
       * @returns {() => Promise<void>} Async initializer resolved before app mounts.
       */
      useFactory: (config: ConfigService, auth: AuthService) => async () => {
        await config.load();
        await auth.initSession();
      },
      deps: [ConfigService, AuthService],
      multi: true,
    },
  ],
};
