import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OrderResponse, OrderService, OrderPayload } from '../../../pos-cashier/services/order.service';
import { finalize } from 'rxjs';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
}

@Component({
  selector: 'sidebar-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-payment.component.html',
})
export class SidebarPaymentComponent {
  cartService = inject(CartService)
  sidebarService = inject(SidebarService);
  http = inject(HttpClient);
  orderService = inject(OrderService);

  selectedTable: number = 1;
  selectedPaymentMethod: PaymentMethod | null = null;

  paymentMethods: PaymentMethodOption[] = [
    { id: 'CASH', name: 'EFECTIVO' },
    { id: 'BANK_TRANSFER', name: 'TRANSFERENCIA' },
    { id: 'CREDIT_CARD', name: 'TARJETA CRÉDITO' },
    { id: 'DEBIT_CARD', name: 'TARJETA DÉBITO' },
  ];

  showSuccessModal = signal(false);
  showTableErrorModal = signal(false);
  showPaymentErrorModal = signal(false);
  isProcessing = signal(false);

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
  }

  finalizeOrder() {
    if (!this.selectedTable) {
      this.showTableErrorModal.set(true);
      return;
    }
    if (!this.selectedPaymentMethod) {
      this.showPaymentErrorModal.set(true);
      return;
    }

    this.isProcessing.set(true);

    const orderPayload:  Omit<OrderPayload, 'businessId'> = {
      table: Number(this.selectedTable),
      status: 'PAID',
      paidMethodType: this.selectedPaymentMethod,
      items: this.cartService.getItemsForApi(),
    };


    this.orderService.createOrder(orderPayload)
      .pipe(
        finalize(() => this.isProcessing.set(false))
      )
      .subscribe({
      next: (response: OrderResponse) => {
        console.log('Pedido enviado con éxito:', response);
        this.showSuccessModal.set(true);
        this.cartService.clearCart();

        setTimeout(() => {
          this.showSuccessModal.set(false);
          this.backToCart();
        }, 3000);
      },
      error: (error) => {
        console.error('Error al enviar el pedido:', error);
      }
    });
  }

  closeErrorModals() {
    this.showTableErrorModal.set(false);
    this.showPaymentErrorModal.set(false);
  }

  backToCart() {
    this.sidebarService.showCart();
  }

}