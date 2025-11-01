import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  KitchenOrder,
  KitchenOrdersResponse,
} from '../interfaces/kitchen-order.interface';
import { AuthService } from '../../auth/services/auth.service';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class KitchenOrdersService {
  private http = inject(HttpClient);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private authService = inject(AuthService);
  token = computed(this._token);

  getKitchenOrders(limit: number = 100): Observable<KitchenOrdersResponse> {
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      return new Observable<KitchenOrdersResponse>((observer) => {
        observer.error('No businessId available.');
      });
    }

    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('page', '1');

    // Endpoint de cocina que incluye los productos de cada orden
    const url = `${baseUrl}/orders/kitchen/${businessId}`;

    return this.http.get<KitchenOrdersResponse>(url, { params });
  }

  markOrderAsDelivered(orderId: number): Observable<any> {
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      return new Observable((observer) => {
        observer.error('No businessId available.');
      });
    }

    const url = `${baseUrl}/orders/${businessId}/order/${orderId}/delivered`;

    return this.http.patch(url, {});
  }

  getOrderById(orderId: string): Observable<any> {
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      return new Observable((observer) => {
        observer.error('No businessId available.');
      });
    }

    const url = `${baseUrl}/orders/${businessId}/${orderId}`;

    return this.http.get(url);
  }
}
