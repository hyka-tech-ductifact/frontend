import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Mobile presentation component for the new-client form.
 * Renders the client creation form adapted for small screens.
 */
@Component({
  selector: 'app-new-client-mobile',
  imports: [ReactiveFormsModule, IonHeader, IonToolbar, IonContent, TranslatePipe],
  templateUrl: './new-client-mobile.component.html',
  styleUrl: './new-client-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClientMobileComponent {
  /** Reactive form group bound to the new-client fields. */
  readonly clientForm = input.required<FormGroup>();

  /** Whether a create-client request is in progress. */
  readonly isSubmitting = input(false);

  /** Emitted when the user submits the new-client form. */
  readonly formSubmit = output<void>();

  /** Emitted when the user cancels client creation. */
  readonly cancel = output<void>();

  /**
   * Forwards the submit action to the parent component.
   * @returns {void}
   */
  onSubmit(): void {
    this.formSubmit.emit();
  }

  /**
   * Forwards the cancel/back action to the parent component.
   * @returns {void}
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
