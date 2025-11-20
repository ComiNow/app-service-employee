import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../services/auth.service';

const baseUrl = environment.baseUrl;

export interface Employee {
  id: string;
  identificationNumber: string;
  email: string;
  fullName: string;
  roleId: string;
  businessId: string;
  role?: {
    id: string;
    name: string;
    permissions: string[];
    description?: string;
    isDefault?: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getEmployeesByBusiness(): Observable<any[]> {
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      return new Observable<any[]>((observer) => {
        observer.error('No businessId available.');
      });
    }

    return this.http.get<any[]>(
      `${baseUrl}/auth/employees/business/${businessId}`
    );
  }
}
