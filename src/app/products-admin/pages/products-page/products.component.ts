import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ProductTableComponent } from "../../products/components/product-table/product-table.component";
import { ProductsService } from '../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategorySidebarComponent } from "../../products/components/category-sidebar/category-sidebar.component";
import { Subject} from 'rxjs';
import { CategoriesService } from '../../products/services/categories.service';

@Component({
  selector: 'products',
  imports: [RouterLink, ProductTableComponent, CategorySidebarComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);

  categoryId = signal<number | null>(null);
  private reloadCategoriesTrigger = new Subject<void>();
  private reloadProductsTrigger = new Subject<void>();
  private viewUpdateTrigger = signal(0);

  categoriesResource = rxResource({
    request: () => this.reloadCategoriesTrigger,
    loader: () => this.categoriesService.getCategories(),
  });

  productsResource = rxResource({
    request: () => this.reloadProductsTrigger,
    loader: () => this.productsService.getProducts(),
  });


  reloadCategories = (deletedCategoryId: number) => {
  console.log('Categoría eliminada, actualizando la lista localmente...');
  this.categoriesResource.update((oldValue) => {
    if (oldValue) {
      return oldValue.filter(category => category.id !== deletedCategoryId);
    }
    return oldValue;
  });
  this.viewUpdateTrigger.update(value => value + 1);
}


    reloadProducts = (deletedProductId?: number) => {
    console.log('Recargando productos...');
    if (deletedProductId) {
      this.productsResource.update((oldValue) => {
        if (oldValue?.data) {
          return { ...oldValue, data: oldValue.data.filter(product => product.id !== deletedProductId) };
        }
        return oldValue;
      });
    } else {
      this.reloadProductsTrigger.next();
    }
    this.viewUpdateTrigger.update(value => value + 1);
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return 'Sin categoría';

    const categoriesData = this.categoriesResource.value() || [];
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría no encontrada';
  }

  filteredProducts = computed(() => {
    const products = this.productsResource.value()?.data ?? [];
    const currentCategoryId = this.categoryId();
    if (!currentCategoryId) return products;

    return products.filter(p => p.categoryId === currentCategoryId);
  });

  constructor() {
    effect(() => {
      this.categoriesResource.value();
      this.productsResource.value();
    });

    effect(() => {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        this.categoryId.set(id ? +id : null);
      });
    });
  }

}