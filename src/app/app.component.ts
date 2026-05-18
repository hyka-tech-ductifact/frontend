import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceService } from './core/services/device.service';
import { WebLayoutComponent } from './layouts/web-layout/web-layout.component';
import { MobileLayoutComponent } from './layouts/mobile-layout/mobile-layout.component';

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
  protected readonly deviceService = inject(DeviceService);

  ngOnInit() {
    this.initializeApp();
  }

  private async initializeApp() {
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

  private setupNativeKeyboard() {
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
