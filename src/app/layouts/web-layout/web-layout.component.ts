import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

/**
 * Web/desktop layout component that wraps routed views with a collapsible sidebar
 * navigation. The navigation bar is hidden on the login route.
 */
@Component({
  selector: 'app-web-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './web-layout.component.html',
  styleUrls: ['./web-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebLayoutComponent {
  private readonly router = inject(Router);

  /** Signal controlling whether the sidebar is in a collapsed (narrow) state. */
  readonly isSidebarCollapsed = signal(false);

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

  /** True when the current route is not the login page, indicating the nav should be shown. */
  readonly showNav = computed(() => !this.currentUrl().startsWith('/login'));

  /** True when the current route is under the /client path. */
  readonly isClientsActive = computed(() => this.currentUrl().startsWith('/client'));

  /**
   * Toggles the sidebar between its expanded and collapsed states.
   * @returns {void}
   */
  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }
}
