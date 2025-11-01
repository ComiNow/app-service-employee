import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpClient} from "@angular/common/http";
import { Observable, throwError} from "rxjs";
import { environment } from "../../../environments/environment.development";
import { ApiCartItem } from "./cart.service";
import { AuthService } from "../../auth/services/auth.service";

export interface OrderPayload {
  businessId: string; 
  table: number;
  status: 'PAID';
  paidMethodType: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';
  items: ApiCartItem[];
}

export interface OrderResponse {
  id: number;
  message?: string;
}

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private authService = inject(AuthService); 
  token = computed(this._token);

  createOrder(orderData: Omit<OrderPayload, 'businessId'>): Observable<OrderResponse> {
    console.log("Enviando orden al backend...");
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      console.error('No se pudo obtener el businessId del usuario autenticado para crear la orden.');
      return throwError(() => new Error('Business ID is missing. Cannot create order.'));
    }

    const fullOrderPayload: OrderPayload = {
      ...orderData, 
      businessId: businessId 
    };

    console.log("Payload enviado a /orders/pos:", fullOrderPayload);

    return this.http.post<OrderResponse>(`${baseUrl}/orders/pos`, fullOrderPayload);
  }
}
