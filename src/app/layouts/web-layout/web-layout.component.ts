import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

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

  readonly isSidebarCollapsed = signal(false);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly showNav = computed(() => !this.currentUrl().startsWith('/login'));

  readonly isClientsActive = computed(() => this.currentUrl().startsWith('/client'));

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }
}
