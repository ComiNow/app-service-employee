import { Component, inject, input } from '@angular/core';
import { Category} from '../../interfaces/product.interface';
import { CategoriesService } from '../../services/categories.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'category-card',
  imports: [RouterLink],
  templateUrl: './category-card.component.html',
})
export class CategoryCardComponent {
  categories = input.required<Category[]>();
  categoriesService = inject(CategoriesService);

  onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/file.png';
}
}
