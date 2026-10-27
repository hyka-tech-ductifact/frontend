import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import type { NewOrderPayload, Order } from '../../../../../core/services/order.service';

/**
 * Desktop/web presentation component for the order list of a project.
 * Renders the project header, stats, the pending/ordered columns and the
 * "new order" and "delete" modals, mirroring the `Nuevo Pedido` mockup.
 */
@Component({
  selector: 'app-order-web',
  imports: [TranslatePipe, ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './order-web.component.html',
  styleUrl: './order-web.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWebComponent {
  private readonly formBuilder = inject(FormBuilder);

  /** Orders rendered in the list. */
  readonly orders = input<Order[]>([]);

  /** Name of the parent project shown in the header card. */
  readonly projectName = input('');

  /** Description of the parent project shown in the header card. */
  readonly projectDescription = input('');

  /** Emitted when the user clicks the back button. */
  readonly goBack = output<void>();

  /** Emitted with the order id when the user opens an order. */
  readonly selectOrder = output<string>();

  /** Emitted with the order id when the user marks a pending order as ordered. */
  readonly markOrdered = output<string>();

  /** Emitted with the order id when the user confirms an order deletion. */
  readonly deleteOrder = output<string>();

  /** Emitted with the form data when the user creates a new order. */
  readonly createOrder = output<NewOrderPayload>();

  /** Whether the "new order" modal is open. */
  readonly isNewOrderModalOpen = signal(false);

  /** Id of the order targeted by the delete confirmation modal, if any. */
  private readonly orderPendingDelete = signal<string | null>(null);

  /** Whether the delete confirmation modal is open. */
  readonly isDeleteModalOpen = computed(() => this.orderPendingDelete() !== null);

  /** Reactive form backing the "new order" modal. */
  protected readonly orderForm = this.formBuilder.nonNullable.group({
    code: ['', Validators.required],
    priority: ['normal' as NewOrderPayload['priority']],
    description: ['', Validators.required],
    category: ['conductos' as NewOrderPayload['category']],
    deliveryDate: [''],
  });

  /** Orders still pending. */
  readonly pendingOrders = computed(() =>
    this.orders().filter((order) => order.status === 'pending'),
  );

  /** Orders already marked as "ordered". */
  readonly orderedOrders = computed(() =>
    this.orders().filter((order) => order.status === 'ordered'),
  );

  /** Sum of the square meters across every order of the project. */
  readonly totalArea = computed(() =>
    this.orders().reduce((total, order) => total + order.totalArea, 0),
  );

  /**
   * Forwards the back action to the smart parent.
   * @returns {void}
   */
  protected onBack(): void {
    this.goBack.emit();
  }

  /**
   * Forwards the selected order id to the smart parent.
   * @param {string} orderId - Unique identifier of the selected order.
   * @returns {void}
   */
  protected onSelect(orderId: string): void {
    this.selectOrder.emit(orderId);
  }

  /**
   * Forwards the mark-as-ordered action to the smart parent.
   * @param {string} orderId - Unique identifier of the order to mark as ordered.
   * @returns {void}
   */
  protected onMarkOrdered(orderId: string): void {
    this.markOrdered.emit(orderId);
  }

  /**
   * Opens the "new order" modal with a clean form.
   * @returns {void}
   */
  protected openNewOrderModal(): void {
    this.orderForm.reset();
    this.isNewOrderModalOpen.set(true);
  }

  /**
   * Closes the "new order" modal without creating anything.
   * @returns {void}
   */
  protected closeNewOrderModal(): void {
    this.isNewOrderModalOpen.set(false);
  }

  /**
   * Emits the form data when it is valid and closes the modal.
   * @returns {void}
   */
  protected submitNewOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    const { code, priority, description, category, deliveryDate } = this.orderForm.getRawValue();
    this.createOrder.emit({
      code: code.trim(),
      description: description.trim(),
      priority,
      category,
      deliveryDate: deliveryDate || undefined,
    });
    this.isNewOrderModalOpen.set(false);
  }

  /**
   * Opens the delete confirmation modal for an order.
   * @param {string} orderId - Unique identifier of the order targeted for deletion.
   * @returns {void}
   */
  protected requestDelete(orderId: string): void {
    this.orderPendingDelete.set(orderId);
  }

  /**
   * Closes the delete confirmation modal without deleting anything.
   * @returns {void}
   */
  protected cancelDelete(): void {
    this.orderPendingDelete.set(null);
  }

  /**
   * Confirms the pending deletion and forwards it to the smart parent.
   * @returns {void}
   */
  protected confirmDelete(): void {
    const orderId = this.orderPendingDelete();
    if (!orderId) return;
    this.deleteOrder.emit(orderId);
    this.orderPendingDelete.set(null);
  }
}
