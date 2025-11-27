import { Component, inject, input, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../../../utils/form-utils';
import { CategoriesService } from '../../../products/services/categories.service';
import { Category } from '../../../products/interfaces/category.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'category-details',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './category-details.component.html',

})

export class CategoryDetailsComponent {
  category = input.required<Category>();
  fb = inject(FormBuilder);
  categoriesService = inject(CategoriesService)

  imageFiles: (File | null)[] = [null, null];
  tempImages: (string | null)[] = [null, null];

  router = inject(Router);
  formUtils = FormUtils;
  showSuccessModalUpdate = signal(false);
  showSuccessModalCreate = signal(false);

  imageChanged = signal(false);
  isSaving = signal(false);

  productForm = this.fb.group({
    name: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['category']) {
      this.loadCategoryIntoForm();
      this.imageChanged.set(false);
    }
  }

  loadCategoryIntoForm() {
    const currentCategory = this.category();
    if (currentCategory && currentCategory.id !== 0) {
      this.productForm.patchValue({
        name: currentCategory.name,
      });

      this.tempImages[0] = currentCategory.firstImage || null;
      this.tempImages[1] = currentCategory.secondImage || null;
      this.imageFiles = [null, null];
    } else {
      this.tempImages = [null, null];
      this.imageFiles = [null, null];
    }

  }

  onFilesChanged(index: number, event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.imageFiles[index] = files[0];
      this.tempImages[index] = URL.createObjectURL(files[0]);
    } else {
      this.imageFiles[index] = null;
      this.tempImages[index] = null;
    }
    this.imageChanged.set(true);
  }

  imageHasChanged(): boolean {
    return this.imageChanged();
  }

  onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();
    if (!isValid) return;
    const formValue = this.productForm.value;
    const categoryLike: Partial<Category> = {
      name: formValue.name!,
    };
    const categoryId = this.category().id;

    const filesToUpload: { file: File, index: number }[] = [];
    if (this.imageFiles[0]) {
      filesToUpload.push({ file: this.imageFiles[0], index: 0 });
    }
    if (this.imageFiles[1]) {
      filesToUpload.push({ file: this.imageFiles[1], index: 1 });
    }

    const shouldUpdate = this.productForm.dirty || this.imageChanged() || categoryId === 0;

    if (!shouldUpdate) {
      console.log('No hay cambios para guardar.');
      this.router.navigateByUrl('/products');
      return;
    }

    if (categoryId === 0 && filesToUpload.length < 2) {
      alert('Para crear una categoría, ambas imágenes son obligatorias.');
      return;
    }

    this.isSaving.set(true);

    if (categoryId === 0) {
      const imageFileList = this.arrayToFileList(filesToUpload.map(f => f.file));
      this.categoriesService.createCategory(categoryLike, imageFileList)
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (category) => {
          this.showSuccessModalCreate.set(true);
          setTimeout(() => {
            this.router.navigateByUrl('/products');
          }, 1000);
        },
        error: (error) => {
          console.error('Error creando categoría', error);
        },
      });
    } else {
      this.categoriesService.updateCategory(
        categoryId,
        categoryLike,
        this.imageFiles[0],
        this.imageFiles[1]
      )
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (category) => {
          this.showSuccessModalUpdate.set(true);
          setTimeout(() => {
            this.router.navigateByUrl('/products');
          }, 2000);
        },
        error: (error) => {
          console.error('Error actualizando categoría', error);
        },
      });
    }
  }

  private arrayToFileList(files: File[]): FileList {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  }

}