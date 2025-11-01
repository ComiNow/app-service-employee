import { Component, inject, input } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  products = input.required<Product[]>();
  productsService = inject(ProductsService);
  cartService = inject(CartService);

  private quantities = new Map<number, number>();

  getQuantity(product: Product): number {
    return this.quantities.get(product.id) || 1;
  }

  incrementQuantity(product: Product): void {
    this.quantities.set(product.id, (this.quantities.get(product.id) || 1) + 1);
  }

  decrementQuantity(product: Product): void {
    const currentQuantity = this.quantities.get(product.id) || 1;
    if (currentQuantity > 1) {
      this.quantities.set(product.id, currentQuantity - 1);
    }
  }

  addToCart(product: Product): void {
    const quantity = this.getQuantity(product);
    this.cartService.addToCart(product, quantity);
    console.log(`Agregando ${quantity} de ${product.name} al carrito.`);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/file.png';
  }
}
