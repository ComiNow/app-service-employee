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

  onDateRangeSelected(event: { start: Date | null; end: Date | null }) {
    this.customStartDate.set(event.start);
    this.customEndDate.set(event.end);
  }

  setDateFilter() {
    this.customStartDate.set(null);
    this.customEndDate.set(null);
  }

  ordersResource = rxResource({
    request: () => ({}),
    loader: () => this.orderService.getOrders(),
  });

  filtersOrders = computed(() => {
    let orders: Order[] = [];
    const startDate = this.customStartDate();
    const endDate = this.customEndDate();

    if (startDate && endDate) {
      orders = this.ordersResource.value()?.data ?? [];

      if (startDate.getTime() === endDate.getTime()) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        return orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startOfDay && orderDate <= endOfDay;
        });
      }

      return orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return orders;
  });

}
