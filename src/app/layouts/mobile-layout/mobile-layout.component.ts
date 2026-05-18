import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
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

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly showMenu = computed(() => !this.currentUrl().startsWith('/login'));

  /**
   *
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
