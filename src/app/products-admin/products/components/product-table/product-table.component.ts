import { CurrencyPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import { ProductImagePipe } from '../../pipes/product-image.pipe';

@Component({
  selector: 'product-table',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ProductImagePipe],
  templateUrl: './product-table.component.html',
})
export class ProductTableComponent {

  products = input.required<Product[]>();
  getCategoryName = input.required<(categoryId: number | null) => string>();
  

  currentPage = input.required<number>();
  totalPages = input.required<number>(); 
  showSuccessModalDelete = signal(false);
  showConfirmDeleteModal = signal(false);
  productToDelete = signal<number | null>(null);
  
  router = inject(Router);
  productsService = inject(ProductsService);

  @Output() productDeleted = new EventEmitter<number>();

  @Output() pageChange = new EventEmitter<number>();

  onDeleteProduct(productId: number): void {
    this.productToDelete.set(productId);
    this.showConfirmDeleteModal.set(true);
  }

  confirmDelete(): void {
    const productId = this.productToDelete();
    if (!productId) return;

    this.productsService.deleteProduct(productId).subscribe({
      next: () => {
        this.showSuccessModalDelete.set(true);
        this.showConfirmDeleteModal.set(false);
        this.productDeleted.emit(productId);
        setTimeout(() => {
          this.showSuccessModalDelete.set(false);
        }, 1000);
      },
      error: (error) => {
        console.error('Error al eliminar el producto:', error);
      },
    });
  }

  onPageChange(newPage: number) {
    this.pageChange.emit(newPage);
  }
}