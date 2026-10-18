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
import { IonButton, IonContent, ModalController } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import type { NewOrderPayload, Order } from '../../../services/order.service';
import {
  NewOrderModalComponent,
  type NewOrderModalResult,
} from '../new-order-modal/new-order-modal.component';

/**
 * Mobile presentation component for the order list of a project.
 * Renders the project header, pending/ordered stats, a "Nuevo Pedido" action
 * and the orders split into pending and already-ordered sections,
 * mirroring the `Order Management` mockup.
 */
@Component({
  selector: 'app-order-mobile',
  imports: [IonContent, TranslatePipe, CurrencyPipe, DatePipe, DecimalPipe, IonButton],
  templateUrl: './order-mobile.component.html',
  styleUrl: './order-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMobileComponent {
  private readonly modalController = inject(ModalController);

  /** Orders rendered in the list. */
  readonly orders = input<Order[]>([]);

  /** Name of the parent project shown in the header card. */
  readonly projectName = input('');

  /** Description of the parent project shown in the header card. */
  readonly projectDescription = input('');

  /** Emitted when the user taps the back button. */
  readonly goBack = output<void>();

  /** Emitted with the form data when the user creates a new order. */
  readonly createOrder = output<NewOrderPayload>();

  /** Emitted with the order id when the user selects an order. */
  readonly selectOrder = output<string>();

  /** Emitted with the order id when the user marks a pending order as ordered. */
  readonly markOrdered = output<string>();

  /** Emitted with the order id when the user confirms an order deletion. */
  readonly deleteOrder = output<string>();

  /** Id of the order targeted by the delete confirmation modal, if any. */
  private readonly orderPendingDelete = signal<string | null>(null);

  /** Whether the delete confirmation modal is currently open. */
  readonly isDeleteModalOpen = computed(() => this.orderPendingDelete() !== null);

  /** Orders still pending. */
  readonly pendingOrders = computed(() =>
    this.orders().filter((order) => order.status === 'pending'),
  );

  /** Orders already marked as "ordered". */
  readonly orderedOrders = computed(() =>
    this.orders().filter((order) => order.status === 'ordered'),
  );

  /** Number of orders still pending. */
  readonly pendingCount = computed(() => this.pendingOrders().length);

  /** Number of orders already marked as "ordered". */
  readonly orderedCount = computed(() => this.orderedOrders().length);

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
   * Opens the new-order modal and emits the created order when it is confirmed.
   * @returns {Promise<void>} Resolves once the modal has been dismissed.
   */
  protected async onAdd(): Promise<void> {
    const modal = await this.modalController.create({
      component: NewOrderModalComponent,
      cssClass: 'new-order-modal',
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss<NewOrderModalResult>();
    if (role !== 'confirm' || !data) return;
    this.createOrder.emit({ ...data, priority: 'normal', category: 'conductos' });
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
