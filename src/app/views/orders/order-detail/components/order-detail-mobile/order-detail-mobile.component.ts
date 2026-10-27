import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import type { Order, OrderPiece } from '../../../../../core/services/order.service';

/** A single labelled dimension chip of a piece (e.g. `a` / `0.4m`). */
interface PieceDimension {
  label: string;
  value: string;
}

/** Piece enriched with the values needed by the card template. */
interface PieceView {
  piece: OrderPiece;
  initials: string;
  dimensions: PieceDimension[];
  lineTotal: number;
}

/**
 * Mobile presentation component for the selected order's detail.
 * Renders the order's pieces and summary inside an Ionic header/content shell,
 * mirroring `OrderDetailWebComponent`.
 */
@Component({
  selector: 'app-order-detail-mobile',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    TranslatePipe,
    DecimalPipe,
  ],
  templateUrl: './order-detail-mobile.component.html',
  styleUrl: './order-detail-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailMobileComponent {
  /** Order currently displayed in the detail view. */
  readonly order = input<Order | undefined>(undefined);

  /** Pieces that belong to the displayed order. */
  readonly pieces = input<OrderPiece[]>([]);

  /** Emitted when the user clicks the back button. */
  readonly goBack = output<void>();

  /** Emitted when the user marks the order as "ordered". */
  readonly markAsOrdered = output<void>();

  /** Emitted when the user confirms deleting the order. */
  readonly deleteOrder = output<void>();

  /** Emitted with the piece id when the user deletes a piece. */
  readonly deletePiece = output<string>();

  /** Whether the delete confirmation modal is open. */
  readonly isDeleteModalOpen = signal(false);

  /** Whether the displayed order has already been marked as "ordered". */
  readonly isOrdered = computed(() => this.order()?.status === 'ordered');

  /** Pieces enriched with initials, parsed dimension chips and line totals. */
  readonly pieceViews = computed<PieceView[]>(() =>
    this.pieces().map((piece) => ({
      piece,
      initials: piece.name.slice(0, 2).toUpperCase(),
      dimensions: piece.dimensions.split(',').map((part) => {
        const [label, value] = part.split(':').map((text) => text.trim());
        return { label, value: value ?? '' };
      }),
      lineTotal: piece.unitArea * piece.quantity,
    })),
  );

  /** Total material area, in square meters, across every piece. */
  readonly totalMaterial = computed(() =>
    this.pieceViews().reduce((total, view) => total + view.lineTotal, 0),
  );

  /**
   * Forwards the back action to the smart parent.
   * @returns {void}
   */
  protected onBack(): void {
    this.goBack.emit();
  }

  /**
   * Forwards the mark-as-ordered action to the smart parent.
   * @returns {void}
   */
  protected onMarkAsOrdered(): void {
    this.markAsOrdered.emit();
  }

  /**
   * Forwards the piece deletion to the smart parent.
   * @param {string} pieceId - Unique identifier of the piece to delete.
   * @returns {void}
   */
  protected onDeletePiece(pieceId: string): void {
    this.deletePiece.emit(pieceId);
  }

  /**
   * Opens the delete confirmation modal.
   * @returns {void}
   */
  protected requestDeleteOrder(): void {
    this.isDeleteModalOpen.set(true);
  }

  /**
   * Closes the delete confirmation modal without deleting.
   * @returns {void}
   */
  protected cancelDeleteOrder(): void {
    this.isDeleteModalOpen.set(false);
  }

  /**
   * Confirms the order deletion and forwards it to the smart parent.
   * @returns {void}
   */
  protected confirmDeleteOrder(): void {
    this.isDeleteModalOpen.set(false);
    this.deleteOrder.emit();
  }
}
