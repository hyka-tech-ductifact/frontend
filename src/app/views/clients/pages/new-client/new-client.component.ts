import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { CreateClientDto } from '../../../../core/models/client.model';
import { ClientsService } from '../../../../core/services/clients.service';

@Component({
  selector: 'app-new-client',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="new-client-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Clients</p>
          <h1>New Client</h1>
          <p>Create a new client record for the dashboard.</p>
        </div>

        <button type="button" class="secondary-button" routerLink="/client">Back</button>
      </header>

      <form class="client-form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          <span>Name *</span>
          <input type="text" formControlName="name" />
        </label>

        <label>
          <span>Phone *</span>
          <input type="text" formControlName="phone" />
        </label>

        <label>
          <span>Email</span>
          <input type="email" formControlName="email" />
        </label>

        <label>
          <span>Address</span>
          <input type="text" formControlName="address" />
        </label>

        <label>
          <span>Type</span>
          <input type="text" formControlName="type" />
        </label>

        <label class="full-width">
          <span>Description</span>
          <textarea rows="5" formControlName="description"></textarea>
        </label>

        <div class="actions full-width">
          <button type="submit" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Saving...' : 'Create client' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        padding: 2rem;
        background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
        color: #0f172a;
      }

      .new-client-page {
        max-width: 960px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .eyebrow {
        margin: 0 0 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.75rem;
        color: #2563eb;
        font-weight: 700;
      }

      h1 {
        margin: 0;
        font-size: 2rem;
        line-height: 1.1;
      }

      .page-header p {
        margin: 0.35rem 0 0;
        color: #475569;
      }

      .secondary-button,
      .actions button {
        border: 0;
        border-radius: 999px;
        padding: 0.9rem 1.25rem;
        font-weight: 700;
        cursor: pointer;
      }

      .secondary-button {
        background: #e2e8f0;
        color: #0f172a;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 96px;
      }

      .client-form {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        padding: 1.25rem;
        border-radius: 1.5rem;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
        border: 1px solid rgba(148, 163, 184, 0.18);
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        font-size: 0.92rem;
        color: #334155;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      input,
      textarea {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 0.95rem;
        padding: 0.9rem 1rem;
        font: inherit;
        background: #fff;
        color: #0f172a;
        outline: none;
      }

      input:focus,
      textarea:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.14);
      }

      .actions {
        display: flex;
        justify-content: flex-end;
      }

      .actions button {
        background: #2563eb;
        color: #fff;
        min-width: 160px;
      }

      .actions button:disabled {
        opacity: 0.7;
        cursor: progress;
      }

      @media (max-width: 720px) {
        .page-header {
          flex-direction: column;
        }

        .client-form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClientComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly location = inject(Location);

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: [''],
    address: [''],
    type: [''],
    description: [''],
  });

  /**
   * Submits the new-client form, creates the client, and returns to the previous view.
   * @returns {void}
   */
  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.form.getRawValue() as CreateClientDto;

    this.clientsService.createClient(payload).subscribe({
      next: () => this.location.back(),
      error: () => this.isSubmitting.set(false),
      complete: () => this.isSubmitting.set(false),
    });
  }
}
