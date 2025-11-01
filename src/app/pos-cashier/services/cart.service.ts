import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../interfaces/product.interface';

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface ApiCartItem {
  productId: number;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private _cartItems = signal<CartItem[]>([]);

  public cartItems = computed(() => this._cartItems());
  public totalItems = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.quantity, 0);
  });
  public totalAmount = computed(() => {
    return this._cartItems().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  });

  constructor() {
    this.loadCartFromStorage();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this._cartItems();
    const existingItem = currentCart.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      this._cartItems.set([...currentCart]);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product: product,
        quantity: quantity,
        price: product.price, 
      };
      this._cartItems.set([...currentCart, newItem]);
    }

    this.saveCartToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentCart = this._cartItems();
    const updatedCart = currentCart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    this._cartItems.set(updatedCart);
    this.saveCartToStorage();
  }

  removeFromCart(productId: number): void {
    const currentCart = this._cartItems();
    const updatedCart = currentCart.filter(
      (item) => item.product.id !== productId
    );
    this._cartItems.set(updatedCart);
    this.saveCartToStorage();
  }

  getItemsForApi(): ApiCartItem[] {
    return this.cartItems().map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
  }

  clearCart(): void {
    this._cartItems.set([]);
    localStorage.removeItem('cart');
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this._cartItems()));
  }

  private loadCartFromStorage(): void {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          this._cartItems.set(parsedCart);
        }
      } catch (error) {
        console.error('Error al procesar el carrito desde localStorage', error);
      }
    }
  }
}
