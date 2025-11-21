import {
  Component,
  EventEmitter,
  inject,
  input,
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
import { finalize } from 'rxjs';

@Component({
  selector: 'order-card',
  standalone: true,
  imports: [CommonModule, ProductImagePipe],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.css'],
})
export class OrderCardComponent {
  order = input.required<KitchenOrder>();
  maxVisibleItems = signal(3);
  isUpdating = signal(false);

  @Output() orderDelivered = new EventEmitter<number>();
  @Output() orderClicked = new EventEmitter<KitchenOrder>();

  private kitchenOrdersService = inject(KitchenOrdersService);

  getVisibleItems() {
    return this.order()?.items?.slice(0, this.maxVisibleItems());
  }

  hasMoreItems(): boolean {
    return (this.order()?.items?.length ?? 0) > this.maxVisibleItems();
  }

  getStatusClass(): string {
    switch (this.order().status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.PAID:
        return 'status-paid';
      case OrderStatus.DELIVERED:
        return 'status-delivered';
      default:
        return 'status-unknown';
    }
  }

  getStatusText(): string {
    switch (this.order().status) {
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

  onMarkAsDelivered(event: Event): void {
    event.stopPropagation();

    if (this.isUpdating()) return;

    this.isUpdating.set(true);

    this.kitchenOrdersService.markOrderAsDelivered(this.order().id)
      .pipe(
        finalize(() => {
          this.isUpdating.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.orderDelivered.emit(this.order().id);
        },
        error: (error) => {
          console.error('Error al marcar orden como entregada:', error);
        },
      });
  }

  onCardClick(): void {
    this.orderClicked.emit(this.order());
  }
}