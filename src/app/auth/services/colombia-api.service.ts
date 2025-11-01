import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id: number;
  name: string;
  description: string;
  cityCapitalId: number;
  municipalities: number;
  surface: number;
  population: number;
  phonePrefix: string;
  countryId: number;
  regionId: number;
}

export interface City {
  id: number;
  name: string;
  description: string;
  surface: number | null;
  population: number | null;
  postalCode: string | null;
  departmentId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ColombiaApiService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api-colombia.com/api/v1';

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.API_URL}/Department`, {
      params: {
        sortBy: 'name',
        sortDirection: 'asc',
      },
    });
  }

  getCitiesByDepartmentId(departmentId: number): Observable<City[]> {
    return this.http.get<City[]>(
      `${this.API_URL}/Department/${departmentId}/cities`,
      {
        params: {
          sortBy: 'name',
          sortDirection: 'asc',
        },
      }
    );
  }
}
