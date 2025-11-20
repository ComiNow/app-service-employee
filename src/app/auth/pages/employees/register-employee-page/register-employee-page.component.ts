import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../../../utils/form-utils';
import { DataService } from '../../../services/data.service';
import { NavbarComponent } from '../../../../shared/components/app-navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-employee-page',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  standalone: true,
  templateUrl: './register-employee-page.component.html',
})
export class RegisterEmployeePageComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  isSubmitting = signal(false);
  dataService = inject(DataService);
  authService = inject(AuthService);

  showSuccessModal = signal(false);
  showErrorModal = signal(false);

  formUtils = FormUtils;

  cargos = [
    { id: '691e5fc362e1b40d467b7f6b', name: 'Cajero' },
    { id: '691e5fc362e1b40d467b7f6c', name: 'Cocinero' },
    { id: '691e5fc362e1b40d467b7f6d', name: 'Mesero' },
    { id: '691e5fc362e1b40d467b7f6a', name: 'Gerente' },
    { id: '691e5fc362e1b40d467b7f69', name: 'Administrador' },
  ];

  registerForm = this.fb.group(
    {
      cargos: ['', Validators.required],
      identificationNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(FormUtils.numberPattern),
        ],
      ],
      fullName: [
        '',
        [Validators.required, Validators.pattern(FormUtils.namePattern)],
      ],
      email: [
        '',
        [Validators.required, Validators.pattern(FormUtils.emailPattern)],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern(FormUtils.passwordPattern)],
      ],
      password2: ['', Validators.required],
    },
    {
      validators: [FormUtils.isFieldOneEqualFieldTwo('password', 'password2')],
    }
  );

  closeSuccessModal() {
    this.showSuccessModal.set(false);
    this.router.navigateByUrl('/employee-management');
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
  }

  onSubmit() {
    Object.keys(this.registerForm.controls).forEach((controlName) => {
      const control = this.registerForm.get(controlName);
      control?.markAsTouched();
    });

    if (this.registerForm.invalid) {
      for (const controlName in this.registerForm.controls) {
        const control = this.registerForm.get(controlName);
        console.log(`${controlName}:`, control?.errors);
      }
      return;
    }

    const formValue = this.registerForm.value;

    this.isSubmitting.set(true);

    this.authService
      .registerEmployee(
        formValue.fullName!,
        formValue.identificationNumber!,
        formValue.cargos!,
        formValue.password!,
        formValue.email!
      )
      .subscribe({
        next: () => {
          this.showSuccessModal.set(true);
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Error:', err);
          this.showErrorModal.set(true);
          this.isSubmitting.set(false);
        },
      });
  }
}
