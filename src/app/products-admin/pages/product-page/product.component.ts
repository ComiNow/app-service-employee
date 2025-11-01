import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductsService } from '../../products/services/products.service';
import { ProductDetailsComponent } from "./product-details/product-details.component";
import { CategoriesService } from '../../products/services/categories.service';

@Component({
  selector: 'app-product',
  imports: [ProductDetailsComponent],
  templateUrl: './product.component.html',
})
export class ProductComponent {

  ActivatedRoute = inject(ActivatedRoute)
  router = inject(Router)
  productService = inject(ProductsService)
  categoriesService = inject(CategoriesService)

  productId = toSignal(
    this.ActivatedRoute.params.pipe(
      map(params => params['id'])
    )
  )

  productResource = rxResource({
    request: () => ({ id: this.productId() }),
    loader: ({request}) => {
      return this.productService.getProductById(request.id);
    }
  })

  categoriesResource = rxResource({
    request: () => ({}),
    loader: () => this.categoriesService.getCategories(),
  });

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return 'Sin categoría';

    const categoriesData = this.categoriesResource.value() || [];
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría no encontrada';
  }

  redirectEffect = effect(() => {
    if(this.productResource.error()){
      this.router.navigate(['/admin/products']);
    }
  })
}
