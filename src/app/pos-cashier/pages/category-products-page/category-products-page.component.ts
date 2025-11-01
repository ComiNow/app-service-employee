import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Category, Product } from '../../interfaces/product.interface';
import { ProductCardComponent } from "../../components/product-card/product-card.component";
import { CategoriesService } from '../../services/categories.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-category-products-page',
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './category-products-page.component.html',
})
export class CategoryProductsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);

  public categoryId = signal<number | null>(null);
  public productsResource = signal<Product[] | null>(null);
  public categoryResource = signal<Category | null>(null);
  public loading = signal(true);
  public categoryName = computed(() => this.categoryResource()?.name || 'Categoría');

  public filteredProducts = computed(() => {
    const products = this.productsResource();
    const currentCategoryId = this.categoryId();
    if (!products || !currentCategoryId) return [];
    return products.filter(p => p.categoryId === currentCategoryId);
  });

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        this.categoryId.set(id);
        return this.categoriesService.getCategoryById(String(id));
      })
    ).subscribe({
      next: (category) => {
        this.categoryResource.set(category);
        this.loadProductsByCategory(this.categoryId()!);
      },
      error: (error) => {
        console.error('Error loading category', error);
        this.loading.set(false);
        // Handle error
      }
    });

    this.loadProductsByCategoryInitially();
  }

  loadProductsByCategory(categoryId: number): void {
    this.loading.set(true);
    this.productsService.getProducts().subscribe({
      next: (response) => {
        this.productsResource.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.loading.set(false);
        // Manejar el error
      }
    });
  }

  loadProductsByCategoryInitially(): void {
    this.loading.set(true);
    this.productsService.getProducts().subscribe({
      next: (response) => {
        this.productsResource.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products initially', error);
        this.loading.set(false);
      }
    });
  }
}
