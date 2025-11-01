import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../interfaces/order.interface';

@Pipe({
  name: 'orderStatusTranslate'
})
export class OrderStatusTranslatePipe implements PipeTransform {
  transform(value: OrderStatus): string {
    switch (value) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.PAID:
        return 'Pagada';
      case OrderStatus.DELIVERED:
        return 'Entregada';
      default:
        return 'Desconocido';
    }
  }
}
