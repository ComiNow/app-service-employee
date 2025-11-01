import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/app-navbar/navbar.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-orders-admin-layout',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './orders-admin-layout.component.html',
})
export class OrdersAdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
