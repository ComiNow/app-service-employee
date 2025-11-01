// En CustomizationService

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
const baseUrl = environment.baseUrl;

export interface CustomizationPayload {
  logo: string | null;
  brand: string;
  font: string;
  fontSize: number;
  themeId: number;
  imageCarousel: string[];
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
    { id: 16, name: "pastel" }, { id: 17, name: "fantasy" }, { id: 18, "name": "wireframe" },
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
      errorMessage = `Server returned code: ${error.status}, error message: ${error.message}`;
      console.error('Backend error:', error.error);
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  uploadLogo(imageFile: File): Observable<string | null> {
    if (!imageFile) {
      console.warn('No logo file provided for upload.');
      return of(null);
    }
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http.post<FileUploadResponse>(`${baseUrl}/customization/files/logo`, formData).pipe(
      map((resp) => {
        if (resp && resp.fileName) {
          console.log('Logo subido con éxito, URL:', resp.fileName);
          return resp.fileName;
        }
        console.error('La respuesta de subida de logo no contiene fileName:', resp);
        return null;
      }),
      catchError(this.handleError)
    );
  }

  uploadCarouselImage(imageFile: File): Observable<string | null> {
    if (!imageFile) {
      console.warn('No carousel image file provided for upload.');
      return of(null);
    }
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http.post<FileUploadResponse>(`${baseUrl}/customization/files/carousel`, formData).pipe(
      map((resp) => {
        if (resp && resp.fileName) {
          console.log('Imagen de carrusel subida con éxito, URL:', resp.fileName);
          return resp.fileName;
        }
        console.error('La respuesta de subida de imagen de carrusel no contiene fileName:', resp);
        return null;
      }),
      catchError(this.handleError)
    );
  }

  uploadMultipleCarouselImages(files: File[]): Observable<string[]> {
    if (!files || files.length === 0) {
      console.warn('No carousel files provided for upload.');
      return of([]);
    }
    const uploadObservables: Observable<string | null>[] = files.map(file => this.uploadCarouselImage(file));

    return forkJoin(uploadObservables).pipe(
      map(urls => urls.filter((url): url is string => url !== null)),
      catchError(this.handleError)
    );
  }

  // Modificado para que sea solo para CREAR la personalización inicial
  saveCustomization(
    customizationData: {
      businessName: string;
      daisyTheme: string;
      baseFontSize: string;
      fontFamily: string;
      // No necesitamos existingCarouselUrls aquí, al crear, todo es nuevo
    },
    logoFile: File | null,
    carouselFiles: File[]
  ): Observable<any> {
    const businessId = this.getBusinessIdForInternalUse();
    if (!businessId) {
       console.error('No businessId disponible en el token para crear personalización.');
       return throwError(() => new Error('Business ID missing for customization creation.'));
    }

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
          imageCarousel: carouselUrls, // Aquí solo van las URL de las imágenes subidas nuevas
        };

        console.log('Payload final para enviar a /api/customization (creación POST):', payload);
        const backendUrl = `${baseUrl}/customization`;
        return this.http.post(backendUrl, payload).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  // Mantengo businessIdFromComponent solo para verificar que coincide con el del token, si lo deseas
  updateCustomization(
    businessIdFromComponent: string,
    customizationData: {
      businessName: string;
      daisyTheme: string;
      baseFontSize: string;
      fontFamily: string;
      existingCarouselUrls: string[]; // Estas son las URLs existentes que se mantendrán
    },
    newLogoFile: File | null,
    existingLogoUrl: string | null, // URL del logo que ya existía (si no se sube uno nuevo)
    newCarouselFiles: File[], // Nuevos archivos de carrusel para subir
    existingCarouselUrls: string[] // URLs existentes del carrusel que se mantendrán
  ): Observable<any> {
    const businessIdInToken = this.getBusinessIdForInternalUse();
    if (!businessIdInToken) {
      console.error('No businessId disponible en el token para actualizar personalización.');
      return throwError(() => new Error('Business ID missing for customization update.'));
    }
    if (businessIdFromComponent && businessIdFromComponent !== businessIdInToken) {
      console.error('Intento de actualizar personalización para un businessId diferente al autenticado.');
      return throwError(() => new Error('Unauthorized update attempt.'));
    }

    // Si hay un nuevo archivo de logo, subirlo. Si no, mantener el existingLogoUrl.
    const uploadNewLogo$ = newLogoFile ? this.uploadLogo(newLogoFile) : of(existingLogoUrl);
    const uploadNewCarouselImages$ = this.uploadMultipleCarouselImages(newCarouselFiles);

    return forkJoin([uploadNewLogo$, uploadNewCarouselImages$]).pipe(
      switchMap(([finalLogoUrl, newCarouselUrls]) => {
        const payload: CustomizationPayload = {
          logo: finalLogoUrl,
          brand: customizationData.businessName,
          font: customizationData.fontFamily,
          fontSize: this.mapBaseFontSizeToNumber(customizationData.baseFontSize),
          themeId: this.getThemeIdFromName(customizationData.daisyTheme),
          // Combinar las URLs existentes que se mantienen con las nuevas subidas
          imageCarousel: [...existingCarouselUrls, ...newCarouselUrls],
        };

        console.log(`Payload final para enviar a /api/customization (actualización PATCH) para businessId ${businessIdInToken}:`, payload);
        const backendUrl = `${baseUrl}/customization`;
        return this.http.patch(backendUrl, payload).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  private mapBaseFontSizeToNumber(baseSize: string): number {
    switch (baseSize.toLowerCase()) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
      case 'xl': return 20;
      default: return 16;
    }
  }

  private getThemeIdFromName(themeName: string): number {
    const foundTheme = this.daisyThemes.find(theme => theme.name.toLowerCase() === themeName.toLowerCase());
    if (!foundTheme) {
      console.warn(`Tema "${themeName}" no encontrado, usando el tema por defecto (light, ID: 1).`);
      return 1;
    }
    return foundTheme.id;
  }

  getDaisyThemes(): DaisyTheme[] {
    return [...this.daisyThemes];
  }

  getCustomization(businessIdFromComponent: string): Observable<CustomizationPayload> {
    const businessIdInToken = this.getBusinessIdForInternalUse();
    if (!businessIdInToken) {
      console.error('No businessId disponible en el token para obtener personalización.');
      return throwError(() => new Error('Business ID missing for customization retrieval.'));
    }
    if (businessIdFromComponent && businessIdFromComponent !== businessIdInToken) {
      console.error('Intento de obtener personalización para un businessId diferente al autenticado.');
      return throwError(() => new Error('Unauthorized retrieval attempt.'));
    }
    return this.http.get<CustomizationPayload>(`${baseUrl}/customization`).pipe(
      catchError(this.handleError)
    );
  }

  deleteCustomization(): Observable<any> {
    const businessIdInToken = this.getBusinessIdForInternalUse();
    if (!businessIdInToken) {
      console.error('No businessId disponible en el token para eliminar personalización.');
      return throwError(() => new Error('Business ID missing for customization deletion.'));
    }
    return this.http.delete(`${baseUrl}/customization`).pipe(
      catchError(this.handleError)
    );
  }
}