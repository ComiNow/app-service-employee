import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams} from "@angular/common/http";
import { Observable, of, throwError} from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Category} from "../interfaces/product.interface";
import { AuthService } from "../../auth/services/auth.service";

const baseUrl = environment.baseUrl;

const emptyCategory: Category = {
  id: 0,
  name: '',
  firstImage: '',
  secondImage: ''
};


@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private authService = inject(AuthService);
  token = computed(this._token);

  getCategories(params: { limit?: number; page?: number; } = {}): Observable<Category[]> {
      console.log("Llamando a categorias");
      const businessId = this.authService.user()?.businessId;
  
      if (!businessId) {
        console.error('No se pudo obtener el businessId del usuario autenticado para obtener las categorías.');
        return throwError(() => new Error('Business ID is missing. Cannot fetch categories.'));
      }
  
      let httpParams = new HttpParams();
  
      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
  
      httpParams = httpParams.set('businessId', businessId);
  
      return this.http.get<Category[]>(`${baseUrl}/categories`, { params: httpParams });
    }
  
    getCategoryById(id: string): Observable<Category> {
      if (!id || id === 'new') {
        return of(emptyCategory);
      }
      const businessId = this.authService.user()?.businessId;
      if (!businessId) {
        return throwError(() => new Error('Business ID is missing. Cannot fetch category by ID.'));
      }
      let httpParams = new HttpParams().set('businessId', businessId);
      return this.http.get<Category>(`${baseUrl}/categories/${id}`, { params: httpParams });
    }

  }
