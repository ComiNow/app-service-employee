import { Routes } from "@angular/router";
import { OrdersAdminLayoutComponent } from "./layouts/orders-admin-layout/orders-admin-layout.component";
import { OrdersListComponent } from "./pages/orders-list/orders-list.component";
import { AuthenticatedGuard } from "../auth/guards/authenticated.guard";
import { ModuleAccessGuard } from "../auth/guards/module-access.guard";
import { AppModulesId } from "../auth/enum/app-modules";

export const ordersAdminRoutes: Routes = [
  {
    path: '',
    component: OrdersAdminLayoutComponent,
    canMatch: [AuthenticatedGuard],
    children: [
      {
        path: 'history',
        component: OrdersListComponent,
        canMatch: [ModuleAccessGuard],
        data: { moduleId: AppModulesId.REPORTS },
      },
      {
        path: '**',
        redirectTo: 'history',
      }
    ],
  },
]

export default ordersAdminRoutes;
