import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/app-navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Employee, EmployeeService, Role } from '../employee.service';

@Component({
    selector: 'app-employee-management-page',
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
    standalone: true,
    templateUrl: './employee-management-page.component.html',
})
export class EmployeeManagementComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  employees = signal<Employee[]>([]);
  loading = signal(true);
  
  roles = signal<Role[]>([]);
  loadingRoles = signal<boolean>(true);

  showDeleteModal = signal(false);
  roleIdToDelete = signal<string | null>(null); 
  roleNameToDelete = signal<string>('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.loading.set(true);
    this.loadingRoles.set(true);

    this.employeeService.getEmployeesByBusiness().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false); 
      },
      error: () => this.loading.set(false)
    });

    this.employeeService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loadingRoles.set(false); 
      },
      error: (err) => {
        console.error('Error cargando roles', err);
        this.loadingRoles.set(false);
      }
    });
  }

  onView(id: string) {
    this.router.navigate(['/auth/register-employee'], { queryParams: { id, mode: 'view' } });
  }

  onEdit(id: string) {
    this.router.navigate(['/auth/register-employee'], { queryParams: { id } });
  }

  onDelete(id: string) {
     console.log('Borrar empleado', id);
  }

  onViewRole(roleId: string) { 
    this.router.navigate(['/roles/edit', roleId]); 
  }

  onDeleteRoleClick(roleId: string) { 
    const role = this.roles().find(r => r.id === roleId);
    if (!role) return;

    if (role.isSystem || role.isDefault || role.employeeCount > 0) {
      alert('No se puede eliminar este rol (Sistema, Default o con Empleados).');
      return;
    }

    this.roleIdToDelete.set(roleId);
    this.roleNameToDelete.set(role.name);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const id = this.roleIdToDelete();
    if (!id) return;

    this.employeeService.deleteRole(id).subscribe({
        next: () => {
          this.roles.update(current => current.filter(r => r.id !== id));
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert('Error al eliminar el rol.');
          this.closeDeleteModal();
        }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.roleIdToDelete.set(null);
    this.roleNameToDelete.set('');
  }
}