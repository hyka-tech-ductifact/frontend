import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

/** Data returned by the modal when the user confirms the new order. */
export interface NewOrderModalResult {
  code: string;
  description: string;
}

/**
 * Mobile modal used to create a new order, mirroring the
 * `Nuevo Pedido` mobile mockup. Opened through `ModalController`.
 */
@Component({
  selector: 'app-new-order-modal',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
  ],
  templateUrl: './new-order-modal.component.html',
  styleUrl: './new-order-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOrderModalComponent {
  private readonly modalController = inject(ModalController);
  private readonly formBuilder = inject(FormBuilder);

  /** Reactive form backing the modal fields. */
  protected readonly orderForm = this.formBuilder.nonNullable.group({
    code: ['', Validators.required],
    description: ['', Validators.required],
  });

  /**
   * Closes the modal, optionally returning the created order data.
   * @param {NewOrderModalResult} [data] - Order data to hand back to the opener.
   * @param {string} [role] - Dismiss role (`confirm` when an order was created).
   * @returns {Promise<boolean>} Whether the modal was dismissed.
   */
  protected dismissModal(data?: NewOrderModalResult, role = 'cancel'): Promise<boolean> {
    return this.modalController.dismiss(data, role);
  }

  /**
   * Validates the form and closes the modal returning the order data.
   * @returns {void}
   */
  protected submitOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    const { code, description } = this.orderForm.getRawValue();
    void this.dismissModal({ code: code.trim(), description: description.trim() }, 'confirm');
  }
}
