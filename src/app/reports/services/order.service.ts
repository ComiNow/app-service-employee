import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { OrderServiceResponse } from "../interfaces/order.interface";
import { Observable, of, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { AuthService } from "../../auth/services/auth.service";

const baseUrl = environment.baseUrl;


@Injectable({ providedIn: 'root' })
export class OrderService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private ordersCache: OrderServiceResponse = { data: [], meta: { total: 0, page: 0, lastPage: 0 } };

  getOrders(): Observable<OrderServiceResponse> {
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      console.error('Business ID is missing.');
      return throwError(() => new Error('Business ID is missing. Cannot fetch orders.'));
    }

    if (this.ordersCache.data?.length) {
      return of(this.ordersCache);
    }

    return this.http
      .get<OrderServiceResponse>(`${baseUrl}/orders/${businessId}?limit=100`)
      .pipe(
        tap((response) => {
          this.ordersCache = response;
        })
      );
  }


}
