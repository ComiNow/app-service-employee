import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CartService } from '../../services/cart.service';

@Component({
  selector: 'cart-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-item.component.html',
})
export class CartItemComponent {
  item = input.required<CartItem>();
  cartService = inject(CartService);

  incrementQuantity(): void {
    this.cartService.updateQuantity(
      this.item().product.id,
      this.item().quantity + 1
    );
  }

  decrementQuantity(): void {
    if (this.item().quantity > 1) {
      this.cartService.updateQuantity(
        this.item().product.id,
        this.item().quantity - 1
      );
    }
  }

  removeItem(): void {
    this.cartService.removeFromCart(this.item().product.id);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/file.png';
  }
}
