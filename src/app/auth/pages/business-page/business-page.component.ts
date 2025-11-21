import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormUtils } from '../../../utils/form-utils';
import { DataService } from '../../services/data.service';
import {
  ColombiaApiService,
  Department,
  City,
} from '../../services/colombia-api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register-business',
  templateUrl: './business-page.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HttpClientModule, CommonModule],
})
export class RegisterBusinessComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  dataService = inject(DataService);
  authService = inject(AuthService);
  colombiaApiService = inject(ColombiaApiService);

  showSuccessModalValue = signal(false);
  isSubmitting = signal(false);
  
  currentYear = new Date().getFullYear();
  logoPreviewUrl: string | ArrayBuffer | null = null;

  formUtils = FormUtils;

  departments: Department[] = [];
  cities: City[] = [];
  loadingDepartments = signal(false);
  loadingCities = signal(false);

  businessForm = this.fb.group({
    businessName: [
      '',
      [Validators.required, Validators.pattern(FormUtils.businessPattern)],
    ],
    businessPhoneNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(FormUtils.numberPattern),
      ],
    ],
    businessEmail: [
      '',
      [Validators.required, Validators.pattern(FormUtils.emailPattern)],
    ],
    departmentId: [null as number | null, Validators.required],
    department: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: [
      '',
      [Validators.required, Validators.pattern(FormUtils.numberPattern)],
    ],
    address: ['', Validators.required],
    logoFile: [null as File | null],
    primaryColor: ['#0056B3', Validators.required],
    secondaryColor: ['#6C757D', Validators.required],
    accentColor: ['#28A745', Validators.required],
    baseFontSize: ['md', Validators.required],
    fontFamily: ['sans-serif', Validators.required],
  });

  private registerDataFromPage1: any | null = null;

  ngOnInit(): void {
    this.registerDataFromPage1 = this.dataService.getRegisterData();
    
    if (!this.registerDataFromPage1) {
      this.router.navigateByUrl('/auth/register');
      return;
    }

    this.loadDepartments();

    this.businessForm
      .get('departmentId')
      ?.valueChanges.subscribe((departmentId) => {
        if (departmentId) {
          this.onDepartmentChange(departmentId);
        }
      });
  }

  loadDepartments(): void {
    this.loadingDepartments.set(true);
    this.colombiaApiService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.loadingDepartments.set(false);
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
        this.loadingDepartments.set(false);
      },
    });
  }

  onDepartmentChange(departmentId: number): void {
    const selectedDepartment = this.departments.find(
      (dept) => dept.id === departmentId
    );
    if (selectedDepartment) {
      this.businessForm.patchValue({
        department: selectedDepartment.name,
        city: '',
      });
      this.loadCitiesByDepartment(departmentId);
    }
  }

  loadCitiesByDepartment(departmentId: number): void {
    this.loadingCities.set(true);
    this.cities = [];
    this.colombiaApiService.getCitiesByDepartmentId(departmentId).subscribe({
      next: (cities) => {
        this.cities = cities;
        this.loadingCities.set(false);
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
        this.loadingCities.set(false);
      },
    });
  }

  showSuccessModal(): boolean {
    return this.showSuccessModalValue();
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.businessForm.patchValue({ logoFile: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.businessForm.patchValue({ logoFile: null });
      this.logoPreviewUrl = null;
    }
  }

  onSubmitBusinessForm() {
    Object.keys(this.businessForm.controls).forEach((controlName) => {
      const control = this.businessForm.get(controlName);
      control?.markAsTouched();
    });

    if (this.businessForm.invalid) {
      return;
    }

    if (!this.registerDataFromPage1) {
      this.router.navigateByUrl('/auth/register');
      return;
    }

    this.isSubmitting.set(true);

    const businessFormValues = this.businessForm.value;
    const registerDataPage1Values = this.registerDataFromPage1;

    const payloadForBackend = {
      businessName: businessFormValues.businessName,
      businessEmail: businessFormValues.businessEmail,
      businessPhone: businessFormValues.businessPhoneNumber,
      
      adminFullName: registerDataPage1Values.fullName,
      adminEmail: registerDataPage1Values.email,
      adminPhone: registerDataPage1Values.phoneNumber,
      adminIdentificationNumber: registerDataPage1Values.identificationNumber,
      adminIdentificationType: registerDataPage1Values.identificationType,
      adminPassword: registerDataPage1Values.password,
      
      locationState: businessFormValues.department,
      locationCity: businessFormValues.city,
      locationPostalCode: businessFormValues.postalCode,
      locationAddress: businessFormValues.address,
    };

    this.authService.registerBusiness(payloadForBackend)
    .pipe(
      finalize(() => this.isSubmitting.set(false))
    )
    .subscribe({
      next: (response) => {
        this.showSuccessModalValue.set(true);
        this.dataService.clearRegisterData();
        setTimeout(() => {
          this.showSuccessModalValue.set(false);
          this.router.navigateByUrl('/customization');
        }, 3000);
      },
      error: (error) => {
        console.error('Error al registrar negocio:', error);
        alert(
          'Error al registrar negocio: ' +
            (error.error?.message || 'Verifique los datos ingresados.')
        );
      },
    });
  }
}