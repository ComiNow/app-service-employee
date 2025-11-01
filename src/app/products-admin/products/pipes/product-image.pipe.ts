import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productImage',
  standalone: true,
})
export class ProductImagePipe implements PipeTransform {
  transform(value: string | string[] | null | undefined): string {
    if (value === null || value === undefined) {
      return './assets/images/no-image.jpg';
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : './assets/images/no-image.jpg';
    }

    return value;
  }
}
