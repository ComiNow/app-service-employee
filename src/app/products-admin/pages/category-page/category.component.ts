import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CategoryDetailsComponent } from "./category-details/category-details.component";
import { CategoriesService } from '../../products/services/categories.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category.component.html',
  imports: [CategoryDetailsComponent],
})
export class CategoryComponent {
  ActivatedRoute = inject(ActivatedRoute)
  router = inject(Router)
  categoriesService = inject(CategoriesService)

  categoryId = toSignal(
    this.ActivatedRoute.params.pipe(
      map(params => params['id'])
    )
  )

  categoryResource = rxResource({
    request: () => ({ id: this.categoryId() }),
    loader: ({ request }) => {
      return this.categoriesService.getCategoryById(request.id);
    }
  });
}
