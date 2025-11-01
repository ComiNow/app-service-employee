import { Routes } from '@angular/router';
import { KitchenLayoutComponent } from './layouts/kitchen-layout/kitchen-layout.component';
import { OrdersKitchenPageComponent } from './pages/orders-kitchen-page/orders-kitchen-page.component';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ModuleAccessGuard } from '../auth/guards/module-access.guard';
import { AppModulesId } from '../auth/enum/app-modules';

export const ordersKitchenRoutes: Routes = [
  {
    path: '',
    component: KitchenLayoutComponent,
    canMatch: [AuthenticatedGuard, ModuleAccessGuard],
    data: { moduleId: AppModulesId.ORDERS},
    children: [
      {
        path: '',
        component: OrdersKitchenPageComponent,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];

export default ordersKitchenRoutes;
