import { Component, inject, input, signal, SimpleChanges } from '@angular/core';
import { Product } from '../../../products/interfaces/product.interface';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../products/services/products.service';
import { FormUtils } from '../../../../utils/form-utils';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../../products/services/categories.service';
import { Category } from '../../../products/interfaces/category.interface';

@Component({
  selector: 'product-details',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent {
  product = input.required<Product>();
  fb = inject(FormBuilder);
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  router = inject(Router);
  formUtils = FormUtils;

  tempImage = signal<string[]>([]);
  imageFile: FileList | undefined = undefined;

  categories: Category[] = [];
  showSuccessModalUpdate = signal(false);
  showSuccessModalCreate = signal(false);
  imageChanged = signal(false);

  productForm = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: [0, Validators.required],
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) {
      this.loadProductIntoForm();
    }
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProductIntoForm();
  }

  hasImageToShow(): boolean {
    if (this.tempImage().length > 0) {
      return true;
    }

    if (
      !this.isCreateMode() &&
      this.product().image &&
      this.product().image!.length > 0
    ) {
      return true;
    }

    return false;
  }

  getImageSource(): string {
    if (this.tempImage().length > 0) {
      return this.tempImage()[0];
    }

    if (
      !this.isCreateMode() &&
      this.product().image &&
      this.product().image!.length > 0
    ) {
      return this.product().image![0];
    }

    return './assets/file.png';
  }

  isCreateMode(): boolean {
    return this.product().id === 0;
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  loadProductIntoForm() {
    const currentProduct = this.product();
    if (currentProduct && currentProduct.id !== 0) {
      this.productForm.patchValue({
        name: currentProduct.name,
        price: currentProduct.price,
        stock: currentProduct.stock,
        categoryId:
          currentProduct.categoryId !== null ? currentProduct.categoryId : 0,
      });
    }
  }

  onFilesChanged(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    this.imageFile = files;
    const imageUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    this.tempImage.set(imageUrls);
    this.imageChanged.set(true);
  }

  onSubmit() {
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      name: formValue.name?.trim(),
      price: Number(formValue.price),
      stock: Number(formValue.stock),
      categoryId:
        formValue.categoryId !== 0 ? Number(formValue.categoryId) : null,
    };

    if (this.isCreateMode()) {
      this.productsService
        .createProduct(productLike, this.imageFile)
        .subscribe({
          next: () => {
            this.showSuccessModalCreate.set(true);
            setTimeout(() => {
              this.router.navigateByUrl('/products');
            }, 1000);
          },
          error: (err) => console.error('Error creating product', err),
        });
    } else {
      this.productsService
        .updateProduct(this.product().id, productLike, this.imageFile)
        .subscribe({
          next: () => {
            this.showSuccessModalUpdate.set(true);
            setTimeout(() => {
              this.router.navigateByUrl('/products');
            }, 2000);
          },
          error: (err) => console.error('Error updating product', err),
        });
    }
  }
}
