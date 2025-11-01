import { Pipe, PipeTransform } from "@angular/core";
import { OrderStatus } from "../interfaces/order.interface";

@Pipe({
  name: 'orderStatus',
})
export class OrderStatusPipe implements PipeTransform {
  transform(value: OrderStatus): string {
    let textClass = '';

    if (value === 'PENDING') {
      textClass = 'text-warning font-semibold';
    }
    if (value === 'PAID') {
      textClass = 'text-info font-semibold';
    }

    if (value === 'DELIVERED') {
      textClass = 'text-success font-semibold';
    }

    return textClass;
  }
}

