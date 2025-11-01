import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/app-navbar/navbar.component';

@Component({
  selector: 'admin-navbar',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './admin-navbar.component.html',
})
export class AdminNavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
