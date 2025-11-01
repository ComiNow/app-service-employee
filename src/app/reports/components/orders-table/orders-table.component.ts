import { CommonModule } from '@angular/common';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Order } from '../../interfaces/order.interface';
import { RouterLink } from '@angular/router';
import { OrderStatusPipe } from '../../pipes/order-status.pipe';
import { OrderStatusTranslatePipe } from '../../pipes/order-status-translate.pipe';

@Component({
  selector: 'orders-table',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, OrderStatusPipe, OrderStatusTranslatePipe, DatePipe, CommonModule],
  templateUrl: './orders-table.component.html',
})
export class OrdersTableComponent implements OnInit {
  private _orders: Order[] = [];

  @Input()
  set orders(value: Order[]) {
    this._orders = value;
    this.initializePagination();
  }

  get orders(): Order[] {
    return this._orders;
  }

  currentPage = 1;
  pageSize = 10;
  totalOrders = 0;
  paginatedOrders: Order[] = [];
  totalPages = 0;

  private initializePagination(): void {
    if (this._orders && this._orders.length > 0) {
      this.totalOrders = this._orders.length;
      this.totalPages = Math.ceil(this.totalOrders / this.pageSize);
      this.updatePaginatedOrders();
    }
  }

  ngOnInit(): void {
    this.initializePagination();
  }

  updatePaginatedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedOrders = this.orders.slice(startIndex, endIndex);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updatePaginatedOrders();
    }
  }

  changePageSize(newSize: string): void {
    this.pageSize = parseInt(newSize, 10);
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalOrders / this.pageSize);
    this.updatePaginatedOrders();
  }

  handlePageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.changePageSize(target.value);
    }
  }
}
