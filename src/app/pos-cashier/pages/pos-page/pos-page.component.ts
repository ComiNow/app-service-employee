import { Component, computed, inject, signal } from '@angular/core';
import { CategoryCardComponent } from "../../components/category-card/category-card.component";
import { ProductCardComponent } from "../../components/product-card/product-card.component";
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { CartService } from '../../services/cart.service';
import { SidebarMainComponent } from "../../components/sidebar-main/sidebar-main.component";
import { SidebarPaymentComponent } from "../../components/sidebar-payment/sidebar-payment.component";
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-home-page',
  imports: [CategoryCardComponent, ProductCardComponent, CommonModule, SidebarMainComponent, SidebarPaymentComponent],
  templateUrl: './pos-page.component.html',
})
export class PosPageComponent {

  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  cartService = inject(CartService)
  sidebarService = inject(SidebarService)

  categoriesResource = rxResource({
    loader: () => this.categoriesService.getCategories(),
  });

  productsResource = rxResource({
    loader: () => this.productsService.getProducts(),
  });

  searchText = signal('');
  showSections = computed(() => !this.searchText());

  filteredProducts = computed(() => {
    const allProducts = this.productsResource.value()?.data || [];
    const currentSearchText = this.searchText().toLowerCase();

    if (!currentSearchText) {
      return allProducts;
    }

    return allProducts.filter(product =>
      product.name.toLowerCase().includes(currentSearchText)
    );
  });

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchText.set(inputElement.value);
  }
}