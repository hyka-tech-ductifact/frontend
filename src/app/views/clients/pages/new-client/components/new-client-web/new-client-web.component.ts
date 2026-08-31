import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Web/desktop presentation component for the new-client form.
 * Renders the client creation form in a layout adapted for larger screens.
 */
@Component({
  selector: 'app-new-client-web',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './new-client-web.component.html',
  styleUrl: './new-client-web.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClientWebComponent {
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
