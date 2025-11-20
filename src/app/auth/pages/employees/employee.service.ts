import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../services/auth.service';

// Asumimos que baseUrl es: http://localhost:3000/api
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

export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isSystem: boolean;
  permissions: string[]; // Array de IDs de permisos
  businessId: string;
  employeeCount: number;
}

export interface Permission {
  id: string; 
  name: string;
  displayName: string;
  description: string;
  icon: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Obtener empleados por negocio
  getEmployeesByBusiness(): Observable<any[]> {
    const businessId = this.authService.user()?.businessId;

    if (!businessId) {
      // Retornamos un array vacío o error si no hay negocio, para evitar llamadas rotas
      return new Observable(obs => obs.error('No businessId available'));
    }

    return this.http.get<any[]>(
      `${baseUrl}/auth/employees/business/${businessId}`
    );
  }

  // Obtener todos los roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${baseUrl}/roles`);
  }

  // 1. CORREGIDO: Obtener módulos (permisos) disponibles
  // Endpoint: http://localhost:3000/api/auth/modules
  getPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/auth/modules`);
  }

  // Obtener un rol por ID para editarlo
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${baseUrl}/roles/${id}`);
  }

  // Crear rol
  // Endpoint: http://localhost:3000/api/roles
  createRole(roleData: { name: string; permissions: string[]; description?: string }): Observable<any> {
    // Opcional: Si tu backend necesita el businessId explícito, lo agregamos.
    // Si el backend lo saca del token, puedes quitar la línea del businessId.
    const businessId = this.authService.user()?.businessId;
    
    const payload = {
      ...roleData,
    };

    return this.http.post(`${baseUrl}/roles`, payload);
  }

  // Actualizar rol
  // Endpoint: http://localhost:3000/api/roles/:id
  updateRole(id: string, roleData: { name: string; permissions: string[]; description?: string }): Observable<any> {
    return this.http.patch(`${baseUrl}/roles/${id}`, roleData);
  }

  // NUEVO: Eliminar rol
  // Endpoint: http://localhost:3000/api/roles/:id
  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${baseUrl}/roles/${id}`);
  }
}