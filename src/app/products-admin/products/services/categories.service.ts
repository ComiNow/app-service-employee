import { computed, inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { forkJoin, map, Observable, of, switchMap, throwError } from "rxjs";
import { Category } from "../interfaces/category.interface";
import { AuthService } from "../../../auth/services/auth.service";

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


  createCategory(categoryLike: Partial<Category>, imageFiles?: FileList): Observable<Category> {
    if (imageFiles && imageFiles.length > 0) {
      const firstImage = imageFiles[0];
      const secondImage = imageFiles[1];
      return forkJoin({
        first: this.uploadImage(firstImage),
        second: this.uploadImage(secondImage)
      }).pipe(

        switchMap(({ first, second }) => {
          const updatedCategoryLike: Partial<Category> = {
            ...categoryLike,
            firstImage: first ?? '',
            secondImage: second ?? ''
          };
          return this.http.post<Category>(`${baseUrl}/categories`, updatedCategoryLike);
        })
      );

    } else {
      return this.http.post<Category>(`${baseUrl}/categories`, categoryLike);
    }

  }
  
  updateCategory(
    id: number,
    categoryLike: Partial<Category>,
    firstImageFile: File | null = null,
    secondImageFile: File | null = null
  ): Observable<Category> {

    return this.getCategoryById(id.toString()).pipe(
      switchMap(currentCategory => {
        const uploadObservables: { [key: string]: Observable<string | null> } = {};

        if (firstImageFile) {
          uploadObservables['first'] = this.uploadImage(firstImageFile);
        } else {
          uploadObservables['first'] = of(currentCategory.firstImage || null);
        }
        if (secondImageFile) {
          uploadObservables['second'] = this.uploadImage(secondImageFile);
        } else {
          uploadObservables['second'] = of(currentCategory.secondImage || null);
        }

        const nameChanged = categoryLike.name !== currentCategory.name;

        if (!firstImageFile && !secondImageFile && !nameChanged) {
          console.log('No hay cambios en la categoría para actualizar.');
          return of(currentCategory);
        }

        return forkJoin(uploadObservables).pipe(
          switchMap(images => {
            const updatedCategoryLike: Partial<Category> = {
              ...categoryLike,
              firstImage: images['first'] ?? currentCategory.firstImage,
              secondImage: images['second'] ?? currentCategory.secondImage
            };
            return this.http.patch<Category>(`${baseUrl}/categories/${id}`, updatedCategoryLike);
          })
        );
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/categories/${id}`);
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
