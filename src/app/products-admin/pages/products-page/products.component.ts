import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ProductTableComponent } from "../../products/components/product-table/product-table.component";
import { ProductsService } from '../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategorySidebarComponent } from "../../products/components/category-sidebar/category-sidebar.component";
import { CategoriesService } from '../../products/services/categories.service';

@Component({
  selector: 'products',
  standalone: true, 
  imports: [RouterLink, ProductTableComponent, CategorySidebarComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);

  categoryId = signal<number | null>(null);
  page = signal<number>(1);
  limit = signal<number>(15);
  
  private version = signal(0);

  categoriesResource = rxResource({
    loader: () => this.categoriesService.getCategories(),
  });

  productsResource = rxResource({
    request: () => ({ 
      page: this.page(), 
      limit: this.limit(), 
      categoryId: this.categoryId(),
      version: this.version() 
    }),
    loader: ({ request }) => {

      return this.productsService.getProducts({
        page: request.page,
        limit: request.limit,
        categoryId: request.categoryId ?? undefined 
      });
    }
  });

  totalPages = computed(() => {
    const meta = this.productsResource.value()?.meta;
    return meta ? meta.lastPage : 1; 
  });

  productsData = computed(() => {
    return this.productsResource.value()?.data ?? [];
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const newId = id ? +id : null;

      if (this.categoryId() !== newId) {
        this.categoryId.set(newId);
        this.page.set(1); 
      }
    });
  }

  handlePageChange(newPage: number) {
    this.page.set(newPage);
  }

  reloadProducts = (deletedProductId?: number) => {
    if (deletedProductId) {
       this.productsResource.update(current => {
         if (!current?.data) return current;
         return {
           ...current,
           data: current.data.filter(p => p.id !== deletedProductId)
         };
       });
    }
    this.version.update(v => v + 1); 
  }

  
  reloadCategories = (deletedCategoryId: number) => {
    this.categoriesResource.update((oldValue) => {
      if (oldValue) return oldValue.filter(category => category.id !== deletedCategoryId);
      return oldValue;
    });
    if(this.categoryId() === deletedCategoryId) {
    }
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return 'Sin categoría';
    const categoriesData = this.categoriesResource.value() || [];
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría no encontrada';
  }
}