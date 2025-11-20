import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/app-navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { EmployeeService, Permission } from '../employee.service';

@Component({
  selector: 'role-page',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  standalone: true,
  templateUrl: './role-page.component.html',
})
export class CreateRoleComponent {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  modules = signal<Permission[]>([]); 
  loading = signal(true);
  isEditMode = signal(false);
  roleId: string | null = null;
  
  // Señal para el título dinámico
  roleName = signal(''); 

  // Lógica de detección de cambios
  private initialPermissions = new Set<string>();
  permissionsChanged = signal(false);
  
  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''], 
    });
  }

  ngOnInit(): void {
    this.employeeService.getPermissions().subscribe({
      next: (data: any[]) => {
        const cleanData = data.map(m => ({
            id: m._id?.$oid || m._id || m.id,
            name: m.name,
            displayName: m.display_name || m.displayName,
            description: m.description,
            icon: m.icon, // Asegúrate que el backend envíe el nombre del icono (ej: 'point_of_sale')
            isActive: m.is_active
        }));
        this.modules.set(cleanData);
        this.checkEditMode(); 
      },
      error: (err) => {
        console.error('Error cargando módulos', err);
        this.loading.set(false);
      }
    });
  }

  checkEditMode() {
    this.route.paramMap.subscribe(params => {
      this.roleId = params.get('id');
      if (this.roleId) {
        this.isEditMode.set(true);
        this.loadRoleData(this.roleId);
      } else {
        this.loading.set(false);
      }
    });
  }

  loadRoleData(id: string) {
    this.employeeService.getRoleById(id).subscribe({
      next: (role) => {
        this.form.patchValue({
          name: role.name,
          description: role.description
        });

        this.roleName.set(role.name);

        this.initialPermissions = new Set(role.permissions);
        this.selectedPermissions.set(new Set(role.permissions));
        
        this.form.markAsPristine(); 
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/employee-management']);
      }
    });
  }

  selectedPermissions = signal<Set<string>>(new Set());

  togglePermission(permissionId: string) {
    const current = new Set(this.selectedPermissions());
    if (current.has(permissionId)) {
      current.delete(permissionId);
    } else {
      current.add(permissionId);
    }
    this.selectedPermissions.set(current);
    this.checkPermissionsChanged();
  }

  isSelected(permissionId: string): boolean {
    return this.selectedPermissions().has(permissionId);
  }

  checkPermissionsChanged() {
    const current = this.selectedPermissions();
    const initial = this.initialPermissions;

    if (current.size !== initial.size) {
      this.permissionsChanged.set(true);
      return;
    }

    let changed = false;
    for (let item of current) {
      if (!initial.has(item)) {
        changed = true;
        break;
      }
    }
    this.permissionsChanged.set(changed);
  }

  get hasChanges(): boolean {
    if (!this.isEditMode()) return true; 
    return this.form.dirty || this.permissionsChanged();
  }

  onDelete() {
    if (!this.roleId) return;
    if (confirm('¿Estás seguro de eliminar este rol permanentemente?')) {
        this.employeeService.deleteRole(this.roleId).subscribe({
            next: () => this.router.navigate(['/employee-management']),
            error: (e) => alert('Error al eliminar: ' + e.message)
        });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    if (this.selectedPermissions().size === 0) {
      alert('Selecciona al menos una funcionalidad');
      return;
    }

    const formData = {
      ...this.form.value,
      permissions: Array.from(this.selectedPermissions())
    };

    if (this.isEditMode() && this.roleId) {
      this.employeeService.updateRole(this.roleId, formData).subscribe({
        next: () => this.router.navigate(['/employee-management']),
        error: (err) => console.error(err)
      });
    } else {
      this.employeeService.createRole(formData).subscribe({
        next: () => this.router.navigate(['/employee-management']),
        error: (err) => console.error(err)
      });
    }
  }
}