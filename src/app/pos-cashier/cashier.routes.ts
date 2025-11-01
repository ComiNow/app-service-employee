import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CategoryProductsPageComponent } from './pages/category-products-page/category-products-page.component';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ModuleAccessGuard } from '../auth/guards/module-access.guard';
import { PosPageComponent } from './pages/pos-page/pos-page.component';
import { AppModulesId } from '../auth/enum/app-modules';

export const storeRoutes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    canMatch: [AuthenticatedGuard, ModuleAccessGuard],
    data: { moduleId: AppModulesId.POS },
    children: [
      {
        path: '',
        component: PosPageComponent,
      },
      { path: 'category/:id',
        component: CategoryProductsPageComponent,
      },
      {
        path: 'cart',
        component: CartPageComponent,
      },
      {
        path: '**',
        component: NotFoundPageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default storeRoutes;
