import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import type { Client } from '../../../../../../core/models/client.model';

/**
 * Mobile presentation component for the new-project form.
 * Renders the project creation form adapted for small screens.
 */
@Component({
  selector: 'app-new-project-mobile',
  imports: [ReactiveFormsModule, IonHeader, IonToolbar, IonContent, TranslatePipe],
  templateUrl: './new-project-mobile.component.html',
  styleUrl: './new-project-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectMobileComponent {
  /** Reactive form group bound to the new-project fields. */
  readonly projectForm = input.required<FormGroup>();

  /** Client the new project is created for. */
  readonly client = input<Client | null>(null);

  /** Whether a create-project request is in progress. */
  readonly isSubmitting = input(false);

  /** Translation key for a failed create-project request, if any. */
  readonly errorMessage = input<string | null>(null);

  /** Emitted when the user submits the new-project form. */
  readonly projectSubmit = output<void>();

  /** Emitted when the user cancels project creation. */
  readonly cancelAction = output<void>();

  /**
   * Forwards the submit action to the parent component.
   * @returns {void}
   */
  onSubmit(): void {
    this.projectSubmit.emit();
  }

  /**
   * Forwards the cancel/back action to the parent component.
   * @returns {void}
   */
  onCancel(): void {
    this.cancelAction.emit();
  }
}
