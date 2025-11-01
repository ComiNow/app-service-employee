import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs'; 

@Component({
  selector: 'login-page',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  fb = inject(FormBuilder);
  hasError = signal(false);
  isLoading = signal(false); 
  router = inject(Router);

  authService = inject(AuthService);

  formUtils = FormUtils;

  loginForm = this.fb.group(
    {
      email: [
        '',
        [Validators.required, Validators.pattern(FormUtils.emailPattern)],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern(FormUtils.passwordPattern)]
      ],
    }
  );

  onSubmit() {

    Object.keys(this.loginForm.controls).forEach((controlName) => {
      const control = this.loginForm.get(controlName);
      control?.markAsTouched();
    });

    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
      return;
    }

    this.isLoading.set(true); 
    
    const { email = '', password = '' } = this.loginForm.value;

    this.authService.login(email!, password!)
    .pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    )
    .subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/');
          return;
        }

        this.hasError.set(true);
        setTimeout(() => {
          this.hasError.set(false);
        }, 3000);
      },
      error: (err) => {
        this.hasError.set(true);
        setTimeout(() => {
          this.hasError.set(false);
        }, 3000);
      }
    });
  }
}