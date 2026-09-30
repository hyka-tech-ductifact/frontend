import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Client } from '../../../../core/models/client.model';
import type { CreateProjectDto } from '../../../../core/models/project.model';
import { DeviceService } from '../../../../core/services/device.service';
import { ClientProjectsService } from '../client-projects/services/client-projects.service';
import { NewProjectMobileComponent } from './pages/new-project-mobile/new-project-mobile.component';
import { NewProjectWebComponent } from './pages/new-project-web/new-project-web.component';

/**
 * Smart (container) component for the new-project page.
 * Delegates presentation to platform-specific sub-components and coordinates
 * project creation through `ClientProjectsService`.
 */
@Component({
  selector: 'app-new-project',
  imports: [NewProjectMobileComponent, NewProjectWebComponent],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientProjectsService = inject(ClientProjectsService);

  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);

  /** Identifier of the client the new project is created for, read from the route. */
  private readonly clientId = this.route.snapshot.paramMap.get('clientId') ?? '';

  /** Client resolved for the current route, used to display context in the form. */
  protected readonly client = signal<Client | null>(null);

  /** Signal reflecting whether a create-project request is in progress. */
  readonly isSubmitting = signal(false);

  /** Error message produced by a failed create-project request, if any. */
  readonly errorMessage = signal<string | null>(null);

  /** Reactive form group backing the new-project fields. */
  readonly projectForm = this.fb.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    managerName: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    description: [''],
  });

  /**
   * Loads the owning client so its name/phone can be shown alongside the form.
   * @returns {void}
   */
  ngOnInit(): void {
    this.clientProjectsService.getClientById(this.clientId).subscribe((client) => {
      this.client.set(client);
    });
  }

  /**
   * Validates and submits the new-project form, creating the project through the API.
   * Navigates back to the client's projects page on success.
   * @returns {void}
   */
  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid || this.isSubmitting()) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const payload = this.projectForm.getRawValue() as CreateProjectDto;

    try {
      await firstValueFrom(this.clientProjectsService.createProject(this.clientId, payload));
      this.isSubmitting.set(false);
      this.navigateToProjects();
    } catch {
      this.isSubmitting.set(false);
      this.errorMessage.set('CLIENTS.NEW_PROJECT.ERRORS.CREATE_FAILED');
    }
  }

  /**
   * Cancels project creation and returns to the client's projects page without saving.
   * @returns {void}
   */
  onCancel(): void {
    this.navigateToProjects();
  }

  /**
   * Navigates back to the client's projects page.
   * @returns {void}
   */
  private navigateToProjects(): void {
    void this.router.navigate(['/client', this.clientId, 'projects']);
  }
}
