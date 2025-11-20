import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { RegisterEmployeePageComponent } from './auth/pages/employees/register-employee-page/register-employee-page.component';
import { EmployeeManagementComponent } from './auth/pages/employees/employee-management/employee-management-page.component';
import { CreateRoleComponent } from './auth/pages/employees/role-page/role-page.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    canMatch: [NotAuthenticatedGuard],
  },
  {
    path: 'customization',
    loadChildren: () => import('./customization/customization.routes'),
    canMatch: [AuthenticatedGuard],
  },
  {
    path: 'register-employee',
    component: RegisterEmployeePageComponent,
    canMatch: [AuthenticatedGuard], 
  }, 
  {
    path: 'create-roles',    
    component: CreateRoleComponent,
    canMatch: [AuthenticatedGuard], 
  },
  {
    path: 'roles/edit/:id',   
    component: CreateRoleComponent,
    canMatch: [AuthenticatedGuard],
  },
  {
    path: 'employee-management',
    component: EmployeeManagementComponent,
    canMatch: [AuthenticatedGuard], 
  },
  {
    path: 'products',
    loadChildren: () => import('./products-admin/products-admin.routes'),
  },
  {
    path: 'pos',
    loadChildren: () => import('./pos-cashier/cashier.routes'),
  },
  {
    path: 'orders',
    loadChildren: () => import('./reports/orders-admin.routes'),
  },
  {
    path: 'kitchen',
    loadChildren: () => import('./orders-kitchen/orders-kitchen.routes'),
  },
  {
    path: '',
    loadChildren: () => import('./home/home.routes'),
    canMatch: [AuthenticatedGuard],
  },
];
