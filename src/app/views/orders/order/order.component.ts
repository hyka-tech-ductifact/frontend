import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';
import { ClientProjectsService } from '../../../core/services/client-projects.service';
import { NewOrderPayload, Order, OrderService } from '../services/order.service';
import { OrderMobileComponent } from './components/order-mobile/order-mobile.component';
import { OrderWebComponent } from './components/order-web/order-web.component';

/**
 * Smart (container) component for the order list of a project.
 * Reads `clientId`/`projectId` from the route, loads the project's orders from
 * `OrderService` and delegates presentation to the mobile or web sub-component.
 */
@Component({
  selector: 'app-order',
  imports: [OrderMobileComponent, OrderWebComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderService = inject(OrderService);
  private readonly clientProjectsService = inject(ClientProjectsService);

  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);

  /** Identifier of the client owning the project, bound from the `:clientId` route segment. */
  public readonly clientId = input<string>();

  /** Identifier of the parent project, bound from the `:projectId` route segment. */
  public readonly projectId = input<string>();

  /** Orders that belong to the current project. */
  protected readonly orders = signal<Order[]>([]);

  /** Parent project resolved from the loaded client projects. */
  protected readonly project = computed(() =>
    this.clientProjectsService.projects().find((project) => project.id === this.projectId()),
  );

  /**
   * Loads the project's orders, and the client's projects when opened directly by URL.
   * @returns {void}
   */
  ngOnInit(): void {
    const projectId = this.projectId();
    if (projectId) {
      this.orderService
        .getOrdersByProjectId(projectId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((orders) => this.orders.set(orders));
    }

    const clientId = this.clientId();
    if (clientId && this.clientProjectsService.projects().length === 0) {
      this.clientProjectsService.getClientProjects(clientId).subscribe();
    }
  }

  /**
   * Navigates back to the client projects page.
   * @returns {void}
   */
  protected goBack(): void {
    const clientId = this.clientId();
    void this.router.navigate(clientId ? ['/client', clientId, 'projects'] : ['/client']);
  }

  /**
   * Navigates to the detail of the selected order.
   * @param {string} orderId - Unique identifier of the order to open.
   * @returns {void}
   */
  protected onSelectOrder(orderId: string): void {
    const clientId = this.clientId();
    const projectId = this.projectId();
    if (!clientId || !projectId) return;
    void this.router.navigate([
      '/client',
      clientId,
      'projects',
      projectId,
      'order-details',
      orderId,
    ]);
  }

  /**
   * Creates a new order within the current project.
   * @param {NewOrderPayload} payload - Data collected by the new order form.
   * @returns {void}
   */
  protected onCreateOrder(payload: NewOrderPayload): void {
    const projectId = this.projectId();
    if (!projectId) return;
    this.orderService.createOrder({
      ...payload,
      projectId,
      clientName: this.orders()[0]?.clientName,
    });
  }

  /**
   * Marks the given order as "ordered".
   * @param {string} orderId - Unique identifier of the order to mark as ordered.
   * @returns {void}
   */
  protected onMarkOrderAsOrdered(orderId: string): void {
    this.orderService.updateOrderStatus(orderId, 'ordered');
  }

  /**
   * Deletes the given order from the current project.
   * @param {string} orderId - Unique identifier of the order to delete.
   * @returns {void}
   */
  protected onDeleteOrder(orderId: string): void {
    this.orderService.deleteOrder(orderId);
  }
}
