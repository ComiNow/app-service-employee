import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  currentSidebar = signal<'cart' | 'payment'>('cart');

  showCheckout() {
    this.currentSidebar.set('payment');
  }

  showCart() {
    this.currentSidebar.set('cart');
  }
}
