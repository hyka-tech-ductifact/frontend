import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceService } from './core/services/device.service';
import { WebLayoutComponent } from './layouts/web-layout/web-layout.component';
import { MobileLayoutComponent } from './layouts/mobile-layout/mobile-layout.component';

/**
 * Root component of the application.
 * Handles platform initialization, language configuration, and native keyboard setup.
 */
@Component({
  selector: 'app-root',
  imports: [WebLayoutComponent, MobileLayoutComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private platform = inject(Platform);
  private translate = inject(TranslateService);

  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);

  /**
   * Angular lifecycle hook. Triggers application initialization.
   * @returns {void}
   */
  ngOnInit(): void {
    this.initializeApp();
  }

  /**
   * Waits for the platform to be ready, then configures supported languages
   * and applies native-specific setup when running on a Capacitor platform.
   * @returns {Promise<void>} Resolves when initialization is complete.
   */
  private async initializeApp(): Promise<void> {
    await this.platform.ready();

    // 1. Configurar Idiomas
    this.translate.addLangs(['es', 'en']);
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|es/) ? browserLang : 'es');

    // 2. Lógica Nativa (Capacitor)
    if (Capacitor.isNativePlatform()) {
      this.setupNativeKeyboard();
    }
  }

  /**
   * Configures the native keyboard plugin to allow scrolling and toggles a
   * CSS class on the body element when the keyboard is shown or hidden.
   * @returns {void}
   */
  private setupNativeKeyboard(): void {
    // Permitir scroll para que el teclado no tape inputs
    Keyboard.setScroll({ isDisabled: false });

    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-is-open');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-is-open');
    });
  }
}
