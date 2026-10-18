import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';

/** Lifecycle status of an order (and its pieces). */
export type OrderStatus = 'pending' | 'ordered';

/** Priority assigned to an order when it is created. */
export type OrderPriority = 'normal' | 'alta' | 'urgente';

/** Category an order belongs to. */
export type OrderCategory = 'conductos' | 'materiales' | 'herramientas';

/** A single piece included in an order. */
export interface OrderPiece {
  /** Unique piece identifier. */
  id: string;

  /** Identifier of the order this piece belongs to. */
  orderId: string;

  /** Display name of the piece (e.g. "Conducto Rectangular"). */
  name: string;

  /** Human-readable dimensions summary (e.g. "a: 0.4m, b: 0.3m, L: 2m"). */
  dimensions: string;

  /** Short description of the piece. */
  description: string;

  /** Material area in square meters required by a single unit. */
  unitArea: number;

  /** Number of units ordered for this piece. */
  quantity: number;

  /** Lifecycle status of the piece, mirrors its owning order by default. */
  status: OrderStatus;
}

/** An order placed within a client project. */
export interface Order {
  /** Unique order identifier. */
  id: string;

  /** Identifier of the parent project this order belongs to. */
  projectId: string;

  /** Short display name/title of the order (e.g. "Codos y Reducciones Planta 1"). */
  code: string;

  /** Short description of the order contents. */
  description: string;

  /** Estimated total price of the order. */
  totalPrice: number;

  /** Name of the client the order belongs to. */
  clientName: string;

  /** Lifecycle status of the order. */
  status: OrderStatus;

  /** Total number of pieces contained in the order. */
  totalPieces: number;

  /** Total square meters of material required by the order. */
  totalArea: number;

  /** ISO creation date of the order. */
  createdAt: string;

  /** Priority of the order. */
  priority?: OrderPriority;

  /** Category of the order. */
  category?: OrderCategory;

  /** Requested delivery date (ISO `yyyy-MM-dd`), if any. */
  deliveryDate?: string;
}

/** Data collected by the "new order" form. */
export interface NewOrderPayload {
  code: string;
  description: string;
  priority: OrderPriority;
  category: OrderCategory;
  deliveryDate?: string;
}

/** Mock pieces used as a fallback so the UI renders during development. */
const MOCK_PIECES: OrderPiece[] = [
  // order-001
  {
    id: 'piece-001',
    description: 'Conducto recto de sección rectangular',
    unitArea: 2.8,
    orderId: 'order-001',
    name: 'Conducto Rectangular',
    dimensions: 'a: 0.4m, b: 0.3m, L: 2m',
    quantity: 12,
    status: 'pending',
  },
  {
    id: 'piece-002',
    description: 'Reducción para cambio de sección',
    unitArea: 1.6,
    orderId: 'order-001',
    name: 'Reducción Concéntrica',
    dimensions: 'a1: 0.5m, a2: 0.3m, L: 1.5m',
    quantity: 6,
    status: 'pending',
  },
  {
    id: 'piece-003',
    description: 'Codo rectangular de 90 grados para cambio de dirección',
    unitArea: 1.2,
    orderId: 'order-001',
    name: 'Codo 90° Rectangular',
    dimensions: 'a: 0.4m, b: 0.3m, R: 0.5m',
    quantity: 8,
    status: 'pending',
  },
  // order-002
  {
    id: 'piece-004',
    description: 'Conducto recto de sección circular',
    unitArea: 3.77,
    orderId: 'order-002',
    name: 'Conducto Circular',
    dimensions: 'D: 0.3m, L: 4m',
    quantity: 10,
    status: 'ordered',
  },
  {
    id: 'piece-005',
    description: 'Derivación en T para ramales secundarios',
    unitArea: 0.84,
    orderId: 'order-002',
    name: 'Derivación en T',
    dimensions: 'a: 0.4m, b: 0.3m, L: 0.6m',
    quantity: 5,
    status: 'ordered',
  },
  // order-003
  {
    id: 'piece-006',
    description: 'Conducto recto de sección rectangular',
    unitArea: 4,
    orderId: 'order-003',
    name: 'Conducto Rectangular',
    dimensions: 'a: 0.6m, b: 0.4m, L: 2m',
    quantity: 14,
    status: 'pending',
  },
  {
    id: 'piece-007',
    description: 'Codo rectangular de 45 grados',
    unitArea: 1.5,
    orderId: 'order-003',
    name: 'Codo 45° Rectangular',
    dimensions: 'a: 0.6m, b: 0.4m, R: 0.6m',
    quantity: 4,
    status: 'pending',
  },
  // order-004
  {
    id: 'piece-008',
    description: 'Transición entre conducto rectangular y circular',
    unitArea: 1.1,
    orderId: 'order-004',
    name: 'Transición Rectangular-Circular',
    dimensions: 'a: 0.5m, b: 0.3m, D: 0.3m',
    quantity: 6,
    status: 'pending',
  },
  {
    id: 'piece-009',
    description: 'Conducto recto de sección circular',
    unitArea: 3.77,
    orderId: 'order-004',
    name: 'Conducto Circular',
    dimensions: 'D: 0.4m, L: 3m',
    quantity: 9,
    status: 'pending',
  },
  {
    id: 'piece-010',
    description: 'Caja de distribución de aire de impulsión',
    unitArea: 1.84,
    orderId: 'order-004',
    name: 'Plenum de Impulsión',
    dimensions: 'a: 0.8m, b: 0.5m, h: 0.4m',
    quantity: 2,
    status: 'pending',
  },
  // order-005
  {
    id: 'piece-011',
    description: 'Conducto recto de sección rectangular',
    unitArea: 3.2,
    orderId: 'order-005',
    name: 'Conducto Rectangular',
    dimensions: 'a: 0.5m, b: 0.3m, L: 2m',
    quantity: 8,
    status: 'ordered',
  },
  {
    id: 'piece-012',
    description: 'Reducción con eje desplazado',
    unitArea: 1.1,
    orderId: 'order-005',
    name: 'Reducción Excéntrica',
    dimensions: 'a1: 0.5m, a2: 0.3m, L: 1m',
    quantity: 3,
    status: 'ordered',
  },
  // order-006
  {
    id: 'piece-013',
    description: 'Codo rectangular de 90 grados',
    unitArea: 0.7,
    orderId: 'order-006',
    name: 'Codo 90° Rectangular',
    dimensions: 'a: 0.3m, b: 0.2m, R: 0.4m',
    quantity: 6,
    status: 'pending',
  },
  {
    id: 'piece-014',
    description: 'Conducto recto de sección rectangular',
    unitArea: 2,
    orderId: 'order-006',
    name: 'Conducto Rectangular',
    dimensions: 'a: 0.3m, b: 0.2m, L: 2m',
    quantity: 5,
    status: 'pending',
  },
];

/** Mock orders, tied to existing mock project ids, used as a fallback during development. */
const MOCK_ORDERS: Order[] = [
  // Project: Climatización Planta 1 y 2
  {
    id: 'order-001',
    projectId: 'a1b2c3d4-0000-4000-8000-000000000001',
    code: 'Conductos Principales Planta 1',
    description: 'Conductos principales para habitaciones 101-130',
    totalPrice: 2850,
    clientName: 'Hotel Mediterráneo',
    status: 'pending',
    totalPieces: 26,
    totalArea: 48.5,
    createdAt: '2026-02-10',
  },
  {
    id: 'order-002',
    projectId: 'a1b2c3d4-0000-4000-8000-000000000001',
    code: 'Derivaciones Habitaciones Planta 1',
    description: 'Derivaciones y conexiones a unidades terminales',
    totalPrice: 1980,
    clientName: 'Hotel Mediterráneo',
    status: 'ordered',
    totalPieces: 15,
    totalArea: 32.4,
    createdAt: '2026-01-28',
  },
  {
    id: 'order-003',
    projectId: 'a1b2c3d4-0000-4000-8000-000000000001',
    code: 'Conductos Principales Planta 2',
    description: 'Conductos principales para habitaciones 201-230',
    totalPrice: 3120,
    clientName: 'Hotel Mediterráneo',
    status: 'pending',
    totalPieces: 18,
    totalArea: 52.2,
    createdAt: '2026-02-15',
  },
  // Project: Zona Spa y Piscina
  {
    id: 'order-004',
    projectId: 'a1b2c3d4-0000-4000-8000-000000000002',
    code: 'Impulsión Zona Spa',
    description: 'Red de impulsión para el área de spa',
    totalPrice: 1450,
    clientName: 'Hotel Mediterráneo',
    status: 'pending',
    totalPieces: 17,
    totalArea: 21.7,
    createdAt: '2026-02-20',
  },
  // Project: Recepción Principal
  {
    id: 'order-005',
    projectId: 'a1b2c3d4-0000-4000-8000-000000000003',
    code: 'Conductos Recepción',
    description: 'Conductos de climatización del vestíbulo',
    totalPrice: 2240,
    clientName: 'Hotel Mediterráneo',
    status: 'ordered',
    totalPieces: 11,
    totalArea: 38.0,
    createdAt: '2026-01-06',
  },
  {
    id: 'order-006',
    projectId: 'a1b2c3d4-0000-4000-8000-000000000003',
    code: 'Cortinas de Aire y Split',
    description: 'Soportes y accesorios de fijación',
    totalPrice: 980,
    clientName: 'Hotel Mediterráneo',
    status: 'pending',
    totalPieces: 11,
    totalArea: 40.5,
    createdAt: '2026-01-09',
  },
];

/**
 * Mock data service for the "Orders" feature.
 * Keeps orders and pieces in memory and exposes them as live Observables so
 * components stay in sync with mutations while the backend contract is defined.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly injector = inject(Injector);

  /** In-memory orders collection. */
  private readonly orders = signal<Order[]>(MOCK_ORDERS);

  /** In-memory order pieces collection. */
  private readonly pieces = signal<OrderPiece[]>(MOCK_PIECES);

  /**
   * Streams the orders that belong to a project, re-emitting on every change.
   * @param {string} projectId - Unique identifier of the parent project.
   * @returns {Observable<Order[]>} Observable with the project's orders.
   */
  getOrdersByProjectId(projectId: string): Observable<Order[]> {
    return toObservable(
      computed(() => this.orders().filter((order) => order.projectId === projectId)),
      { injector: this.injector },
    );
  }

  /**
   * Streams a single order, re-emitting on every change.
   * @param {string} orderId - Unique identifier of the order to resolve.
   * @returns {Observable<Order | undefined>} Observable with the matching order, if any.
   */
  getOrderById(orderId: string): Observable<Order | undefined> {
    return toObservable(
      computed(() => this.orders().find((order) => order.id === orderId)),
      { injector: this.injector },
    );
  }

  /**
   * Streams the pieces that belong to an order, re-emitting on every change.
   * @param {string} orderId - Unique identifier of the owning order.
   * @returns {Observable<OrderPiece[]>} Observable with the order's pieces.
   */
  getOrderPieces(orderId: string): Observable<OrderPiece[]> {
    return toObservable(
      computed(() => this.pieces().filter((piece) => piece.orderId === orderId)),
      { injector: this.injector },
    );
  }

  /**
   * Appends a new order to the in-memory collection for a project.
   * @param {Partial<Order> & { projectId: string }} payload - Partial order data,
   * requiring at least the owning `projectId`.
   * @returns {void}
   */
  createOrder(payload: Partial<Order> & { projectId: string }): void {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      projectId: payload.projectId,
      code: payload.code ?? '',
      description: payload.description ?? '',
      totalPrice: payload.totalPrice ?? 0,
      clientName: payload.clientName ?? '',
      status: payload.status ?? 'pending',
      totalPieces: payload.totalPieces ?? 0,
      totalArea: payload.totalArea ?? 0,
      createdAt: payload.createdAt ?? new Date().toISOString(),
      priority: payload.priority,
      category: payload.category,
      deliveryDate: payload.deliveryDate,
    };

    this.orders.update((current) => [...current, newOrder]);
  }

  /**
   * Removes an order and its pieces from the in-memory collections.
   * @param {string} orderId - Unique identifier of the order to delete.
   * @returns {void}
   */
  deleteOrder(orderId: string): void {
    this.orders.update((current) => current.filter((order) => order.id !== orderId));
    this.pieces.update((current) => current.filter((piece) => piece.orderId !== orderId));
  }

  /**
   * Removes a single piece from its order.
   * @param {string} pieceId - Unique identifier of the piece to delete.
   * @returns {void}
   */
  deletePiece(pieceId: string): void {
    this.pieces.update((current) => current.filter((piece) => piece.id !== pieceId));
  }

  /**
   * Updates the status of an existing order (and its pieces).
   * @param {string} orderId - Unique identifier of the order to update.
   * @param {string} status - New status value to apply.
   * @returns {void}
   */
  updateOrderStatus(orderId: string, status: string): void {
    const nextStatus = status as OrderStatus;

    this.orders.update((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    );
    this.pieces.update((current) =>
      current.map((piece) =>
        piece.orderId === orderId ? { ...piece, status: nextStatus } : piece,
      ),
    );
  }
}
