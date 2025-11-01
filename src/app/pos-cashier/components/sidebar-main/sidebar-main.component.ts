import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItemComponent } from "../cart-item/cart-item.component";
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'sidebar-main',
  imports: [CartItemComponent, CommonModule],
  templateUrl: './sidebar-main.component.html',
})
export class SidebarMainComponent {
  cartService = inject(CartService)
  sidebarService = inject(SidebarService)

  goToPayment() {
    this.sidebarService.showCheckout();
  }
}
