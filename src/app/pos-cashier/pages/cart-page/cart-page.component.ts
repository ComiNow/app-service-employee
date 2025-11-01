import { Component, inject } from '@angular/core';
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
    this.cartService.clearCart();
  }
}
