import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import type { CreateClientDto } from '../../../../core/models/client.model';
import { ClientsService } from '../../../../core/services/clients.service';
import { DeviceService } from '../../../../core/services/device.service';
import { NewClientMobileComponent } from './components/new-client-mobile/new-client-mobile.component';
import { NewClientWebComponent } from './components/new-client-web/new-client-web.component';

/**
 * Smart (container) component for the new-client page.
 * Delegates presentation to platform-specific sub-components and coordinates
 * client creation through `ClientsService`.
 */
@Component({
  selector: 'app-new-client',
  imports: [NewClientMobileComponent, NewClientWebComponent],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClientComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);

  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);

  /** Signal reflecting whether a create-client request is in progress. */
  readonly isSubmitting = signal(false);

  /** Reactive form group backing the new-client fields. */
  readonly clientForm = this.fb.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: [''],
    address: [''],
    description: [''],
  });

  /**
   * Validates and submits the new-client form, creating the client through the API.
   * Navigates back to the client list on success.
   * @returns {void}
   */
  onSubmit(): void {
    if (this.clientForm.invalid || this.isSubmitting()) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.clientForm.getRawValue() as CreateClientDto;

    this.clientsService.createClient(payload).subscribe({
      /**
       *
       */
      next: () => this.navigateToClientList(),
      /**
       *
       */
      error: () => this.isSubmitting.set(false),
      /**
       *
       */
      complete: () => this.isSubmitting.set(false),
    });
  }

  /**
   * Cancels client creation and returns to the client list without saving.
   * @returns {void}
   */
  onCancel(): void {
    this.navigateToClientList();
  }

  /**
   * Navigates back to the client dashboard.
   * @returns {void}
   */
  private navigateToClientList(): void {
    void this.router.navigate(['/client']);
  }
}
