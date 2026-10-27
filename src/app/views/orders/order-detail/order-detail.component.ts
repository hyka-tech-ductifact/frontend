import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';
import { Order, OrderPiece, OrderService } from '../../../core/services/order.service';
import { OrderDetailMobileComponent } from './components/order-detail-mobile/order-detail-mobile.component';
import { OrderDetailWebComponent } from './components/order-detail-web/order-detail-web.component';

/**
 * Smart (container) component for the detail of a single order.
 * Reads `clientId`/`projectId`/`orderId` from the route, loads the order and its
 * pieces from `OrderService` and delegates presentation to the mobile or web sub-component.
 */
@Component({
  selector: 'app-order-detail',
  imports: [OrderDetailMobileComponent, OrderDetailWebComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderService = inject(OrderService);

  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);

  /** Identifier of the client owning the project, bound from the `:clientId` route segment. */
  public readonly clientId = input<string>();

  /** Identifier of the parent project, bound from the `:projectId` route segment. */
  public readonly projectId = input<string>();

  /** Identifier of the order to display, bound from the `:orderId` route segment. */
  public readonly orderId = input<string>();

  /** Order displayed in the detail view. */
  protected readonly order = signal<Order | undefined>(undefined);

  /** Pieces that belong to the displayed order. */
  protected readonly pieces = signal<OrderPiece[]>([]);

  /**
   * Loads the order and its pieces for the current route.
   * @returns {void}
   */
  ngOnInit(): void {
    const orderId = this.orderId();
    if (!orderId) return;

    this.orderService
      .getOrderById(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((order) => this.order.set(order));

    this.orderService
      .getOrderPieces(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pieces) => this.pieces.set(pieces));
  }

  /**
   * Navigates back to the orders list of the project.
   * @returns {void}
   */
  protected goBack(): void {
    const clientId = this.clientId();
    const projectId = this.projectId();
    void this.router.navigate(
      clientId && projectId ? ['/client', clientId, 'projects', projectId, 'orders'] : ['/client'],
    );
  }

  /**
   * Marks the displayed order as "ordered".
   * @returns {void}
   */
  protected onMarkAsOrdered(): void {
    const order = this.order();
    if (!order) return;
    this.orderService.updateOrderStatus(order.id, 'ordered');
  }

  /**
   * Deletes the displayed order and returns to the project's orders list.
   * @returns {void}
   */
  protected onDeleteOrder(): void {
    const order = this.order();
    if (!order) return;
    this.orderService.deleteOrder(order.id);
    this.goBack();
  }

  /**
   * Deletes a piece from the displayed order.
   * @param {string} pieceId - Unique identifier of the piece to delete.
   * @returns {void}
   */
  protected onDeletePiece(pieceId: string): void {
    this.orderService.deletePiece(pieceId);
  }
}
