import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  starOutline,
  settingsOutline,
  headsetOutline,
  logOutOutline,
  createOutline,
  peopleOutline,
} from 'ionicons/icons';

/**
 * Mobile layout component that wraps routed views with an Ionic side menu.
 * The menu is hidden on the login route to provide a clean authentication screen.
 */
@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
  ],
  templateUrl: './mobile-layout.component.html',
  styleUrls: ['./mobile-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileLayoutComponent {
  private readonly router = inject(Router);

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
}
