import { Component, EventEmitter, inject, Input, input, Output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { map } from 'rxjs';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../interfaces/category.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'category-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-sidebar.component.html',
})
export class CategorySidebarComponent {

  ActivatedRoute = inject(ActivatedRoute)

  categories = input.required<Category[]>();

  showSuccessModalDelete = signal(false);
  showConfirmDeleteModal = signal(false);
  showWarningModal = signal(false);
  errorMessage = signal<string | null>(null);
  categoryToDelete = signal<number | null>(null);
  getCategoryName = input.required<(categoryId: number | null) => string>();

  router = inject(Router);
  categoriesService = inject(CategoriesService);

  @Output() categoryDeleted = new EventEmitter<number>();

  activeCategoryId = toSignal(this.ActivatedRoute.params.pipe(
    map(params => params['id'] ? +params['id'] : null)
  ));

  onDeleteCategory(categoryId: number): void {
    this.categoryToDelete.set(categoryId);
    this.showConfirmDeleteModal.set(true);
    this.showWarningModal.set(false);
    this.errorMessage.set(null);
  }

  confirmDelete(): void {
    const categoryId = this.categoryToDelete();
    if (!categoryId) return;

    this.showConfirmDeleteModal.set(false);

    this.categoriesService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.showSuccessModalDelete.set(true);
        this.showConfirmDeleteModal.set(false);
        this.categoryDeleted.emit(categoryId);
        setTimeout(() => {
          this.showSuccessModalDelete.set(false);
        }, 1000);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400 && error.error && typeof error.error === 'object' && error.error.message === 'Cannot delete category with associated products') {
        this.showWarningModal.set(true);
      } else {
          this.errorMessage.set('Ocurrió un error inesperado al eliminar la categoría.');
        }
      }
    });
  }

  isCategoryActive(categoryId: number | null): boolean {
    return this.activeCategoryId() === categoryId;
  }
}
