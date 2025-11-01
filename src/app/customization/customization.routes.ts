import { Routes } from '@angular/router';
import { BusinessCustomizationComponent } from './components/bussiness-customization/business-customization.component';
import { AuthLayoutComponent } from '../auth/layout/auth-layout/auth-layout.component';

export const customizationRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: BusinessCustomizationComponent,
      },
      { 
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];

export default customizationRoutes;
