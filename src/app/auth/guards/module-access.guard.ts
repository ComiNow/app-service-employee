import { Injectable } from '@angular/core';
import { CanMatch, Route, UrlSegment, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ModuleAccessGuard implements CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  canMatch(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | boolean {
    const requiredModuleId = route.data?.['moduleId'];

    if (!requiredModuleId) {
      return true; 
    }

    return this.authService.getUserModuleAccess().pipe(
    map((moduleAccess: string[]) => {
      console.log('User module access in Guard:', moduleAccess);
      const hasAccess = moduleAccess.includes(requiredModuleId);
      console.log(`User has access to ${requiredModuleId}:`, hasAccess); 
      if (!hasAccess) {
        this.router.navigate(['/']);
      }
      return hasAccess;
    })
    );
  }
}
