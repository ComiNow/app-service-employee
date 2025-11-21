import { Component, computed, inject, signal } from '@angular/core';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { OrderService } from '../../services/order.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DateRangePicker } from '../../../shared/components/datepicker/datepicker.component';
import { Order } from '../../interfaces/order.interface';

@Component({
  selector: 'app-orders-list',
  imports: [OrdersTableComponent, CommonModule, DateRangePicker],
  templateUrl: './orders-list.component.html',
})
export class OrdersListComponent {

  private orderService = inject(OrderService);

  customStartDate = signal<Date | null>(null);
  customEndDate = signal<Date | null>(null);
  refreshTrigger = signal(0);

  onDateRangeSelected(event: { start: Date | null; end: Date | null }) {
    this.orderService.clearCache();
    this.customStartDate.set(event.start);
    this.customEndDate.set(event.end);
    this.refreshTrigger.update(prev => prev + 1);
  }

  onRefreshRequested() {
    this.orderService.clearCache();
    this.refreshTrigger.update(prev => prev + 1);
  }

  ordersResource = rxResource({
    request: () => ({ trigger: this.refreshTrigger() }),
    loader: () => this.orderService.getOrders(),
  });

  filtersOrders = computed(() => {
    const allOrders = this.ordersResource.value()?.data ?? [];
    const startDate = this.customStartDate();
    const endDate = this.customEndDate();

    if (!startDate || !endDate) {
      return [];
    }

    let filtered: Order[] = [];

    if (startDate.getTime() === endDate.getTime()) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      filtered = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
    } else {
      filtered = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return [...filtered];
  });

}