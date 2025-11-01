import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  KitchenOrder,
  OrderStatus,
} from '../../interfaces/kitchen-order.interface';
import { KitchenOrdersService } from '../../services/kitchen-orders.service';
import { ProductImagePipe } from '../../pipes/product-image.pipe';

@Component({
  selector: 'order-detail-modal',
  standalone: true,
  imports: [CommonModule, ProductImagePipe],
  templateUrl: './order-detail-modal.component.html',
  styles: [
    `
      .product-image-modal {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .product-img-modal {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `,
  ],
})
export class OrderDetailModalComponent {
  @Input() order = signal<KitchenOrder | null>(null);
  @Input() isVisible = signal(false);
  @Output() modalClosed = new EventEmitter<void>();
  @Output() orderDelivered = new EventEmitter<number>();

  private kitchenOrdersService = inject(KitchenOrdersService);

  getStatusClass(): string {
    const status = this.order()?.status;
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PAID:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(): string {
    const status = this.order()?.status;
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.PAID:
        return 'Pagado';
      case OrderStatus.DELIVERED:
        return 'Entregado';
      default:
        return 'Desconocido';
    }
  }

  closeModal(): void {
    this.isVisible.set(false);
    this.modalClosed.emit();
  }

  onMarkAsDelivered(): void {
    const orderId = this.order()?.id;
    if (!orderId) return;

    this.kitchenOrdersService.markOrderAsDelivered(orderId).subscribe({
      next: () => {
        this.orderDelivered.emit(orderId);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error al marcar orden como entregada:', error);
      },
    });
  }
}
