import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Client } from '../../../../core/models/client.model';
import { DeviceService } from '../../../../core/services/device.service';
import { ClientProjectsMobileComponent } from './pages/client-projects-mobile/client-projects-mobile.component';
import { ClientProjectsWebComponent } from './pages/client-projects-web/client-projects-web.component';
import { ClientProjectsService } from './services/client-projects.service';

/**
 * Smart (container) component for the client projects page.
 * Resolves the client and its projects for the current route and delegates
 * presentation to platform-specific sub-components.
 */
@Component({
  selector: 'app-client-projects',
  imports: [ClientProjectsMobileComponent, ClientProjectsWebComponent],
  templateUrl: './client-projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientProjectsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);

  /** Service that resolves the client and manages its project list. */
  protected readonly clientProjectsService = inject(ClientProjectsService);

  /** Identifier of the client whose projects are displayed, read from the route. */
  private readonly clientId = this.route.snapshot.paramMap.get('clientId') ?? '';

  /** Client resolved for the current route. */
  protected readonly client = signal<Client | null>(null);

  /**
   * Loads the client and its projects for the current route.
   * @returns {void}
   */
  ngOnInit(): void {
    this.clientProjectsService.getClientById(this.clientId).subscribe((client) => {
      this.client.set(client);
    });
    void this.clientProjectsService.getClientProjects(this.clientId).subscribe();
  }

  /**
   * Handles the add-project action emitted by a child component.
   * Placeholder hook for the future "new project" flow.
   * @returns {void}
   */
  protected onAddProject(): void {
    // Intended to open a new-project modal or navigation form.
  }

  /**
   * Handles the advance-status event emitted by a child component.
   * @param {string} projectId - Unique identifier of the project to advance.
   * @returns {void}
   */
  protected onAdvanceStatus(projectId: string): void {
    this.clientProjectsService.advanceProjectStatus(projectId);
  }

  /**
   * Handles the delete-project event emitted by a child component.
   * @param {string} projectId - Unique identifier of the project to delete.
   * @returns {void}
   */
  protected onDeleteProject(projectId: string): void {
    this.clientProjectsService.deleteProject(projectId);
  }
}
