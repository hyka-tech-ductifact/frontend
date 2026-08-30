import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

/**
 * Web/desktop layout component that wraps routed views with a collapsible sidebar
 * navigation. The navigation bar is hidden on the login route.
 */
@Component({
  selector: 'app-web-layout',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './web-layout.component.html',
  styleUrls: ['./web-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebLayoutComponent {
  private readonly router = inject(Router);

  protected readonly authService = inject(AuthService);

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

  /**
   *
   */
  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
