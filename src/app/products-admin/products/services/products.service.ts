import { computed, inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Product, ProductsResponse } from '../interfaces/product.interface';
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable, of, switchMap, tap, throwError } from "rxjs";
import { AuthService } from "../../../auth/services/auth.service";

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
  token = computed(this._token);
  private authService = inject(AuthService);
  private productsCache = new Map<string, ProductsResponse>();
  private productCache = new Map<string, Product>();



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


  updateProduct(id: number, productLike: Partial<Product>, imageFile?: FileList): Observable<Product> {

    if (imageFile && imageFile.length > 0) {
      return this.uploadImage(imageFile[0]).pipe(
        switchMap((imageUrl) => {
          const updatedProductLike: Partial<Product> = {
            ...productLike,
            image: imageUrl ? [imageUrl] : [],
          };
          return this.http.patch<Product>(`${baseUrl}/products/${id}`, updatedProductLike);
        }),
        tap((product) => this.updateProductCache(product))
      );

    } else {
      return this.http.patch<Product>(`${baseUrl}/products/${id}`, productLike).pipe(
        tap((product) => this.updateProductCache(product))
      );
    }
  }

  updateProductCache(product: Product) {
    const productId = product.id;
    this.productCache.set(String(productId), product);
    this.productsCache.forEach(productResponse => {
      productResponse.data = productResponse.data.map((currentProduct) => {
        return currentProduct.id === productId ? product : currentProduct;
      })
    })
  }

  createProduct(productLike: Partial<Product>, imageFile?: FileList): Observable<Product> {
    if (imageFile && imageFile.length > 0) {
      return this.uploadImage(imageFile[0]).pipe(
        switchMap(imageUrl => {
          const updatedProductLike: Partial<Product> = {
            ...productLike,
            image: imageUrl ? [imageUrl] : [],
          };
          return this.http.post<Product>(`${baseUrl}/products`, updatedProductLike);
        })
      );
    } else {
      return this.http.post<Product>(`${baseUrl}/products`, productLike);
    }

  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/products/${id}`);
  }

  delateProductCache(product: Product) {
    const productId = product.id;
    this.productCache.set(String(productId), product);
    this.productsCache.forEach(productResponse => {
      productResponse.data = productResponse.data.map((currentProduct) => {
        return currentProduct.id === productId ? product : currentProduct;
      })
    })
  }

  uploadImage(image?: File): Observable<string | null> {
    if (!image) return of(null);
    const formData = new FormData();
    formData.append('file', image);
    return this.http.post<{ fileName: string }>(`${baseUrl}/files/product`, formData).pipe(
      map((resp) => resp.fileName)
    );

  }
}
