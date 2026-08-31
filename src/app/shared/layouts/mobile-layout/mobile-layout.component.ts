import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  createOutline,
  headsetOutline,
  logOutOutline,
  peopleOutline,
  personCircleOutline,
  settingsOutline,
  starOutline,
} from 'ionicons/icons';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Mobile layout component that wraps routed views with an Ionic side menu.
 * The menu is hidden on the login route to provide a clean authentication screen.
 */
@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    IonRouterOutlet,
    TranslateModule,
  ],
  templateUrl: './mobile-layout.component.html',
  styleUrls: ['./mobile-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileLayoutComponent {
  private readonly router = inject(Router);

  protected readonly authService = inject(AuthService);

  /**
   * Signal that reflects the current URL after every successful navigation,
   * initialised with the router's current URL at component creation time.
   */
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** True when the current route is not the login page, indicating the menu should be shown. */
  readonly showMenu = computed(() => !this.currentUrl().startsWith('/login'));

  /**
   * Registers the Ionicons used in this component's template.
   */
  constructor() {
    addIcons({
      personCircleOutline,
      starOutline,
      settingsOutline,
      headsetOutline,
      logOutOutline,
      createOutline,
      peopleOutline,
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
