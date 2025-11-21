import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, CartItemComponent, RouterLink],
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent {
  cartService = inject(CartService);

  isClearing = signal(false);
  isCheckingOut = signal(false);

  get items() {
    return this.cartService.cartItems();
  }

  get totalItems() {
    return this.cartService.totalItems();
  }

  get totalAmount() {
    return this.cartService.totalAmount();
  }

  clearCart() {
    this.isClearing.set(true);
    
    setTimeout(() => {
      this.cartService.clearCart();
      this.isClearing.set(false);
    }, 500);
  }

  onCheckout() {
    this.isCheckingOut.set(true);

    setTimeout(() => {
      this.isCheckingOut.set(false);
    }, 2000);
  }
}
