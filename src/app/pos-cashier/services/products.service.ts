import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams} from "@angular/common/http";
import { Observable, of, throwError} from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Product, ProductsResponse} from "../interfaces/product.interface";
import { AuthService } from "../../auth/services/auth.service";

const baseUrl = environment.baseUrl;

const emptyProduct: Product = {
  id: 0,
  name: '',
  categoryId: null,
  price: 0,
  stock: 0,
  image: [''],
  available: true
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private authService = inject(AuthService);
  token = computed(this._token);

  getProducts(params: { limit?: number; page?: number; categoryId?: number; } = {}): Observable<ProductsResponse> {
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      console.error('No se pudo obtener el businessId del usuario autenticado para obtener los productos.');
      return throwError(() => new Error('Business ID is missing. Cannot fetch products.'));
    }

    let httpParams = new HttpParams();

    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.categoryId !== undefined) {
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    }

    httpParams = httpParams.set('businessId', businessId);

    return this.http.get<ProductsResponse>(`${baseUrl}/products`, { params: httpParams });
  }
  
  getProductById(id: string): Observable<Product> {
    if (!id || id === 'new') {
      return of(emptyProduct);
    }
    const businessId = this.authService.user()?.businessId;
    if (!businessId) {
      return throwError(() => new Error('Business ID is missing. Cannot fetch product by ID.'));
    }
    let httpParams = new HttpParams().set('businessId', businessId);
    return this.http.get<Product>(`${baseUrl}/products/${id}`, { params: httpParams });
  }
}
