import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../../utils/form-utils';
import { DataService } from '../../services/data.service';

@Component({
    selector: 'app-register-page',
    imports: [RouterLink, ReactiveFormsModule],
    standalone: true,
    templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
    
    fb = inject(FormBuilder);
    router = inject(Router);

    dataService = inject(DataService);

    formUtils = FormUtils;
    isSubmitting = signal(false);

    identificationType = [
        { id: 'CC', name: 'CC' },
        { id: 'CE', name: 'CE' },
        { id: 'PA', name: 'PA' },
        { id: 'TE', name: 'TE' },
    ];

    registerForm = this.fb.group(
        {
            identificationType: ['', Validators.required],
            identificationNumber: [
                '',
                [Validators.required, Validators.maxLength(10), Validators.pattern(FormUtils.numberPattern)],
            ],
            fullName: [
                '',
                [Validators.required, Validators.pattern(FormUtils.namePattern)],
            ],
            phoneNumber: [
                '',
                [Validators.required, Validators.maxLength(10), Validators.pattern(FormUtils.numberPattern)],
            ],
            email: [
                '',
                [Validators.required, Validators.pattern(FormUtils.emailPattern)],
            ],
            password: ['', [Validators.required, Validators.pattern(FormUtils.passwordPattern)]],
            password2: ['', Validators.required],
        },
        {
            validators: [FormUtils.isFieldOneEqualFieldTwo('password', 'password2')],
        }
    );

    continueToNextPage() { 
        Object.keys(this.registerForm.controls).forEach((controlName) => {
            const control = this.registerForm.get(controlName);
            control?.markAsTouched();
        });

        if (this.registerForm.invalid) {
            return;
        }

        this.isSubmitting.set(true);

        this.dataService.setRegisterData(this.registerForm.value);

        this.router.navigateByUrl('/auth/register-business');
    }
}