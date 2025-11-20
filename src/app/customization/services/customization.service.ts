import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

const baseUrl = environment.baseUrl;

// Actualizada según tu respuesta JSON del backend
export interface CustomizationPayload {
  id?: number;
  businessId?: string;
  logo: string | null;
  brand: string;
  font: string;
  fontSize: number;
  themeId: number;
  imageCarousel: string[];
  // Agregamos esto para poder leer el nombre del tema que viene del back
  theme?: {
    id: number;
    name: string;
  };
}

interface FileUploadResponse {
  fileName: string;
}

export interface DaisyTheme {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomizationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private daisyThemes: DaisyTheme[] = [
    { id: 1, name: "light" }, { id: 2, name: "dark" }, { id: 3, name: "cupcake" },
    { id: 4, name: "bumblebee" }, { id: 5, name: "emerald" }, { id: 6, name: "corporate" },
    { id: 7, name: "synthwave" }, { id: 8, name: "retro" }, { id: 9, name: "cyberpunk" },
    { id: 10, name: "valentine" }, { id: 11, name: "halloween" }, { id: 12, name: "garden" },
    { id: 13, name: "forest" }, { id: 14, name: "aqua" }, { id: 15, name: "lofi" },
    { id: 16, name: "pastel" }, { id: 17, name: "fantasy" }, { id: 18, name: "wireframe" },
    { id: 19, name: "black" }, { id: 20, name: "luxury" }, { id: 21, name: "dracula" },
    { id: 22, name: "cmyk" }, { id: 23, name: "autumn" }, { id: 24, name: "business" },
    { id: 25, name: "acid" }, { id: 26, name: "lemonade" }, { id: 27, name: "night" },
    { id: 28, name: "coffee" }, { id: 29, name: "winter" }, { id: 30, name: "dim" },
    { id: 31, name: "nord" }, { id: 32, name: "sunset" }, { id: 33, name: "caramellatte" },
    { id: 34, name: "abyss" }, { id: 35, name: "silk" }
  ];

  constructor() { }

  private getBusinessIdForInternalUse(): string | null {
    return this.authService.user()?.businessId || null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Si el backend envía un mensaje claro, lo usamos
      errorMessage = error.error?.message || `Server returned code: ${error.status}`;
      console.error('Backend error detail:', error.error);
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // --- MÉTODOS DE SUBIDA DE ARCHIVOS ---

  uploadLogo(imageFile: File): Observable<string | null> {
    if (!imageFile) return of(null);
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http.post<FileUploadResponse>(`${baseUrl}/customization/files/logo`, formData).pipe(
      map((resp) => resp?.fileName || null),
      catchError(this.handleError)
    );
  }

  uploadMultipleCarouselImages(files: File[]): Observable<string[]> {
    if (!files || files.length === 0) return of([]);
    
    // Reutilizamos la lógica de subida individual si tienes el endpoint, 
    // o iteramos sobre el endpoint de carrusel
    const uploadObservables = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<FileUploadResponse>(`${baseUrl}/customization/files/carousel`, formData).pipe(
            map(res => res.fileName),
            catchError(() => of(null)) // Si una falla, no rompemos todo el forkJoin
        );
    });

    return forkJoin(uploadObservables).pipe(
      map(urls => urls.filter((url): url is string => url !== null)),
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS PRINCIPALES ---

  // GET: Concatena el ID a la URL
  getCustomization(businessIdFromComponent: string): Observable<CustomizationPayload> {
    const businessIdInToken = this.getBusinessIdForInternalUse();
    
    // Validaciones de seguridad
    if (!businessIdInToken) return throwError(() => new Error('No token Business ID'));
    if (businessIdFromComponent && businessIdFromComponent !== businessIdInToken) {
      return throwError(() => new Error('Unauthorized retrieval attempt.'));
    }

    // CORRECCIÓN: Agregar el ID
    return this.http.get<CustomizationPayload>(`${baseUrl}/customization/${businessIdInToken}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST: Crea nueva personalización
  saveCustomization(
    customizationData: any, // Tipar según tu formulario
    logoFile: File | null,
    carouselFiles: File[]
  ): Observable<any> {
    const businessId = this.getBusinessIdForInternalUse();
    if (!businessId) return throwError(() => new Error('No token Business ID'));

    const uploadLogo$ = logoFile ? this.uploadLogo(logoFile) : of(null);
    const uploadCarouselImages$ = this.uploadMultipleCarouselImages(carouselFiles);

    return forkJoin([uploadLogo$, uploadCarouselImages$]).pipe(
      switchMap(([logoUrl, carouselUrls]) => {
        const payload: CustomizationPayload = {
          logo: logoUrl,
          brand: customizationData.businessName,
          font: customizationData.fontFamily,
          fontSize: this.mapBaseFontSizeToNumber(customizationData.baseFontSize),
          themeId: this.getThemeIdFromName(customizationData.daisyTheme),
          imageCarousel: carouselUrls,
        };

        return this.http.post(`${baseUrl}/customization`, payload).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  // PATCH: Actualiza (URL sin ID, el back usa el del body o token)
  updateCustomization(
    businessIdFromComponent: string,
    customizationData: any, 
    newLogoFile: File | null,
    existingLogoUrl: string | null,
    newCarouselFiles: File[],
    existingCarouselUrls: string[]
  ): Observable<any> {
    const businessIdInToken = this.getBusinessIdForInternalUse();
    
    if (!businessIdInToken) return throwError(() => new Error('No token Business ID'));
    if (businessIdFromComponent !== businessIdInToken) return throwError(() => new Error('Unauthorized'));

    const uploadNewLogo$ = newLogoFile ? this.uploadLogo(newLogoFile) : of(existingLogoUrl);
    const uploadNewCarouselImages$ = this.uploadMultipleCarouselImages(newCarouselFiles);

    return forkJoin([uploadNewLogo$, uploadNewCarouselImages$]).pipe(
      switchMap(([finalLogoUrl, newCarouselUrls]) => {
        const payload: CustomizationPayload = {
          logo: finalLogoUrl, // Aquí va la URL (nueva o vieja)
          brand: customizationData.businessName,
          font: customizationData.fontFamily,
          fontSize: this.mapBaseFontSizeToNumber(customizationData.baseFontSize),
          themeId: this.getThemeIdFromName(customizationData.daisyTheme),
          imageCarousel: [...existingCarouselUrls, ...newCarouselUrls],
        };

        // URL para PATCH (sin ID al final según tu indicación)
        return this.http.patch(`${baseUrl}/customization`, payload).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  // DELETE: Borrar (URL sin ID)
  deleteCustomization(): Observable<any> {
    return this.http.delete(`${baseUrl}/customization`).pipe(
      catchError(this.handleError)
    );
  }

  // --- HELPERS ---
  private mapBaseFontSizeToNumber(baseSize: string): number {
    const sizes: {[key: string]: number} = { 'sm': 14, 'md': 16, 'lg': 18, 'xl': 20 };
    return sizes[baseSize.toLowerCase()] || 16;
  }

  private getThemeIdFromName(themeName: string): number {
    const found = this.daisyThemes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
    return found ? found.id : 1;
  }

  getDaisyThemes(): DaisyTheme[] {
    return [...this.daisyThemes];
  }
}