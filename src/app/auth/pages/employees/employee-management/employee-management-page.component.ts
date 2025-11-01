import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../../../utils/form-utils';
import { DataService } from '../../../services/data.service';
import { NavbarComponent } from '../../../../shared/components/app-navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Employee, EmployeeService } from '../employee.service';

@Component({
    selector: 'app-employee-management-page',
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
    standalone: true,
    templateUrl: './employee-management-page.component.html',
})
export class EmployeeManagementComponent {

    private employeeService = inject(EmployeeService);

  employees = signal<Employee[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.error.set(null);

    this.employeeService.getEmployeesByBusiness().subscribe({
      next: (data) => {
        console.log('Empleados obtenidos:', data);
        this.employees.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener empleados:', err);
        this.error.set('No se pudieron cargar los empleados.');
        this.loading.set(false);
      },
    });
  }

  onView(id: string) {
    console.log('Ver empleado:', id);
  }

  onEdit(id: string) {
    console.log('Editar empleado:', id);
  }

  onDelete(id: string) {
    console.log('Eliminar empleado:', id);
  }
}

