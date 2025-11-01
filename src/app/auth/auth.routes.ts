import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { RegisterBusinessComponent } from './pages/business-page/business-page.component';
import { RegisterEmployeePageComponent } from './pages/employees/register-employee-page/register-employee-page.component';
import { EmployeeManagementComponent } from './pages/employees/employee-management/employee-management-page.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
      },
      {
        path: 'register',
        component: RegisterPageComponent,
      },
      {
        path: 'register-business',
        component: RegisterBusinessComponent,
      },
      {
        path: 'register-employee',
        component: RegisterEmployeePageComponent,
      },
      {
        path: 'employee-management',
        component: EmployeeManagementComponent,
      },
      { 
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];

export default authRoutes;
