import { CommonModule } from '@angular/common';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Order } from '../../interfaces/order.interface';
import { RouterLink } from '@angular/router';
import { OrderStatusTranslatePipe } from '../../pipes/order-status-translate.pipe';

@Component({
  selector: 'orders-table',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, OrderStatusTranslatePipe, DatePipe, CommonModule],
  templateUrl: './orders-table.component.html',
})
export class OrdersTableComponent implements OnInit, OnChanges {
  Math = Math;
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

  ngOnInit(): void {
    this.initializePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders']) {
      this.currentPage = 1;
      this.initializePagination();
    }
  }

  private initializePagination(): void {
    if (this._orders && this._orders.length > 0) {
      this.totalOrders = this._orders.length;
      this.totalPages = Math.ceil(this.totalOrders / this.pageSize);
      this.updatePaginatedOrders();
    } else {
      this.totalOrders = 0;
      this.totalPages = 0;
      this.paginatedOrders = [];
    }
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

  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-warning',
      'completed': 'badge-success',
      'cancelled': 'badge-error',
      'processing': 'badge-info',
      'delivered': 'badge-success',
      'paid': 'badge-success',
      'unpaid': 'badge-warning'
    };
    return statusClasses[status.toLowerCase()] || 'badge-neutral';
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.changePage(page);
    }
  }
}
