import { Routes } from '@angular/router';
import { AdminNavbarComponent } from './layouts/admin-navbar/admin-navbar.component';
import { ProductsComponent } from './pages/products-page/products.component';
import { ProductComponent } from './pages/product-page/product.component';
import { CategoryComponent } from './pages/category-page/category.component';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ModuleAccessGuard } from '../auth/guards/module-access.guard';
import { AppModulesId } from '../auth/enum/app-modules';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminNavbarComponent,
    canMatch: [AuthenticatedGuard, ModuleAccessGuard],
    data: { moduleId: AppModulesId.PRODUCTS },
    children: [
      {
        path: '',
        component: ProductsComponent,
      },
      {
        path: 'categories',
        component: ProductsComponent,
      },
      { 
        path: 'categories/:id',
        component: ProductsComponent,
      },
      {
        path: 'category/:id',
        component: CategoryComponent,
      },
      {
        path: ':id',
        component: ProductComponent,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  }
];

export default adminRoutes;
