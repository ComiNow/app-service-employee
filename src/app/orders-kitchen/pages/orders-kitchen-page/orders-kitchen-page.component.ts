import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { KitchenOrdersService } from '../../services/kitchen-orders.service';
import { OrderCardComponent } from '../../components/order-card/order-card.component';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component';
import {
  KitchenOrder,
  OrderStatus,
} from '../../interfaces/kitchen-order.interface';

@Component({
  selector: 'app-orders-kitchen-page',
  standalone: true,
  imports: [CommonModule, OrderCardComponent, OrderDetailModalComponent],
  templateUrl: './orders-kitchen-page.component.html',
  styleUrl: './orders-kitchen-page.component.css',
})
export class OrdersKitchenPageComponent implements OnDestroy {
  private readonly kitchenOrdersService = inject(KitchenOrdersService);

  selectedOrder = signal<KitchenOrder | null>(null);
  showDetailModal = signal(false);
  private refreshTrigger = signal(0);
  private intervalId: any;

  ordersResource = rxResource({
    request: () => this.refreshTrigger(),
    loader: () => this.kitchenOrdersService.getKitchenOrders(),
  });

  filteredOrders = computed(() => {
    const orders = this.ordersResource.value()?.data ?? [];
    const paidOrders = orders.filter(
      (order) => order.status === OrderStatus.PAID
    );

    return this.redistributeOrdersForBalance(paidOrders);
  });

  private redistributeOrdersForBalance(orders: KitchenOrder[]): KitchenOrder[] {
    if (orders.length <= 4) return orders;

    const columns = [[], [], [], []] as KitchenOrder[][];
    const columnHeights = [0, 0, 0, 0];

    const estimateCardHeight = (order: KitchenOrder): number => {
      let baseHeight = 180;
      baseHeight += order.totalItems * 35;
      baseHeight += (order.items?.length || 0) * 25;
      baseHeight += order.totalAmount > 50000 ? 20 : 0;
      return baseHeight;
    };

    const sortedOrders = [...orders].sort(
      (a, b) => estimateCardHeight(b) - estimateCardHeight(a)
    );

    sortedOrders.forEach((order) => {
      const estimatedHeight = estimateCardHeight(order);
      const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[minHeightIndex].push(order);
      columnHeights[minHeightIndex] += estimatedHeight + 20;
    });

    return orders.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  ngOnInit() {
    // Actualizar órdenes cada 30 segundos
    this.intervalId = setInterval(() => {
      this.refreshOrders();
    }, 30000);
  }

  ngOnDestroy() {
    // Limpiar intervalo al destruir el componente
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onOrderDelivered(orderId: number): void {
    this.refreshOrders();
  }

  onOrderClicked(order: KitchenOrder): void {
    this.selectedOrder.set(order);
    this.showDetailModal.set(true);
  }

  onModalClosed(): void {
    this.selectedOrder.set(null);
    this.showDetailModal.set(false);
  }

  private refreshOrders(): void {
    this.refreshTrigger.update((value) => value + 1);
  }
}
