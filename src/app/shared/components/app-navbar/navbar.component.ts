import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AppModulesId } from '../../../auth/enum/app-modules';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  private userModules: string[] = [];

  AppModulesId = AppModulesId;

  sidebarVisible = false;

  async ngOnInit() {
    this.authService.getUserModuleAccess().subscribe((modules) => {
      this.userModules = modules;
      console.log('Sidebar module access:', this.userModules);
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  isModuleAccessible(moduleId: string): boolean {
    return this.userModules.includes(moduleId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
