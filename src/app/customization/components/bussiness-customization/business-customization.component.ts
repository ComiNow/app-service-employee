import { Component, OnInit, inject, signal, HostListener, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CustomizationService, DaisyTheme, CustomizationPayload } from '../../services/customization.service';
import { FormUtils } from '../../../utils/form-utils';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../../auth/services/auth.service';

interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
  version: string;
  lastModified: string;
  files: { [key: string]: string };
}

interface ThemeColors {
  name: string;
  base100: string;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  isDark: boolean;
}

@Component({
  selector: 'app-business-customization',
  templateUrl: './business-customization.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HttpClientModule, CommonModule]
})
export class BusinessCustomizationComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  http = inject(HttpClient);
  customizationService = inject(CustomizationService);
  router = inject(Router);

  businessId: string | null = null;
  showSuccessModalValue = signal(false);
  isThemeDropdownOpen = signal(false);
  isLoadingInitial = signal(true);
  isSaving = signal(false);

  currentYear = new Date().getFullYear();
  logoPreviewUrl: string | ArrayBuffer | null = null;
  showPreviewModal: boolean = false;

  carouselImagePreviews: { file: File | null, url: string | ArrayBuffer | null, isExisting: boolean }[] = [];

  formUtils = FormUtils;

  googleFonts: GoogleFont[] = [];
  filteredGoogleFonts: GoogleFont[] = [];
  private googleFontsApiKey = 'AIzaSyBM7_2dUTFIRdQqCakM8Ppg6hQCPDibcWA';

  daisyThemes: DaisyTheme[] = [];

  isCustomizationExisting: boolean = false;

  themeColors: { [key: string]: ThemeColors } = {
    light: {
      name: 'Light',
      base100: '#ffffff',
      primary: '#570df8',
      secondary: '#f000b8',
      accent: '#37cdbe',
      neutral: '#3d4451',
      isDark: false,
    },
    dark: {
      name: 'Dark',
      base100: '#1d232a',
      primary: '#661ae6',
      secondary: '#d926aa',
      accent: '#1fb2a6',
      neutral: '#2a323c',
      isDark: true,
    },
    cupcake: {
      name: 'Cupcake',
      base100: '#faf7f5',
      primary: '#65c3c8',
      secondary: '#ef9fbc',
      accent: '#eeaf3a',
      neutral: '#291334',
      isDark: false,
    },
    bumblebee: {
      name: 'Bumblebee',
      base100: '#fef3c7',
      primary: '#f9d72f',
      secondary: '#df7e07',
      accent: '#181830',
      neutral: '#181830',
      isDark: false,
    },
    emerald: {
      name: 'Emerald',
      base100: '#ffffff',
      primary: '#66cc8a',
      secondary: '#377cfb',
      accent: '#ea5234',
      neutral: '#333c4d',
      isDark: false,
    },
    corporate: {
      name: 'Corporate',
      base100: '#ffffff',
      primary: '#4b6bfb',
      secondary: '#7b92b2',
      accent: '#67cba0',
      neutral: '#181a2a',
      isDark: false,
    },
    synthwave: {
      name: 'Synthwave',
      base100: '#1a103d',
      primary: '#e779c1',
      secondary: '#58c7f3',
      accent: '#f3cc30',
      neutral: '#20134e',
      isDark: true,
    },
    retro: {
      name: 'Retro',
      base100: '#ebe9e4',
      primary: '#ef9995',
      secondary: '#a4cbb4',
      accent: '#dc8850',
      neutral: '#2e282a',
      isDark: false,
    },
    cyberpunk: {
      name: 'Cyberpunk',
      base100: '#ffee00',
      primary: '#ff7598',
      secondary: '#75d1f0',
      accent: '#c07eec',
      neutral: '#1c1917',
      isDark: false,
    },
    valentine: {
      name: 'Valentine',
      base100: '#f7e7e8',
      primary: '#e96d7b',
      secondary: '#a991f7',
      accent: '#88dbdd',
      neutral: '#2e282a',
      isDark: false,
    },
    halloween: {
      name: 'Halloween',
      base100: '#1a1919',
      primary: '#f28c18',
      secondary: '#6d3a9c',
      accent: '#51a800',
      neutral: '#1b1d1d',
      isDark: true,
    },
    garden: {
      name: 'Garden',
      base100: '#efeee9',
      primary: '#5c7f67',
      secondary: '#ecf4e7',
      accent: '#5c7f67',
      neutral: '#2a2e37',
      isDark: false,
    },
    forest: {
      name: 'Forest',
      base100: '#171212',
      primary: '#1eb854',
      secondary: '#1db88e',
      accent: '#1db8ab',
      neutral: '#19362d',
      isDark: true,
    },
    aqua: {
      name: 'Aqua',
      base100: '#09253d',
      primary: '#3abff8',
      secondary: '#828df8',
      accent: '#f471b5',
      neutral: '#1c2b35',
      isDark: true,
    },
    lofi: {
      name: 'Lofi',
      base100: '#ffffff',
      primary: '#0d0d0d',
      secondary: '#1a1919',
      accent: '#1a1919',
      neutral: '#1a1919',
      isDark: false,
    },
    pastel: {
      name: 'Pastel',
      base100: '#ffffff',
      primary: '#d1c1d7',
      secondary: '#f6cbd1',
      accent: '#b4e9d6',
      neutral: '#2a2e37',
      isDark: false,
    },
    fantasy: {
      name: 'Fantasy',
      base100: '#ffffff',
      primary: '#6e0b75',
      secondary: '#d926a9',
      accent: '#1f2937',
      neutral: '#1f2937',
      isDark: false,
    },
    wireframe: {
      name: 'Wireframe',
      base100: '#ffffff',
      primary: '#b8b8b8',
      secondary: '#b8b8b8',
      accent: '#b8b8b8',
      neutral: '#b8b8b8',
      isDark: false,
    },
    black: {
      name: 'Black',
      base100: '#000000',
      primary: '#373737',
      secondary: '#373737',
      accent: '#373737',
      neutral: '#373737',
      isDark: true,
    },
    luxury: {
      name: 'Luxury',
      base100: '#ffffff',
      primary: '#d1b000',
      secondary: '#1b1b1b',
      accent: '#d1b000',
      neutral: '#1b1b1b',
      isDark: false,
    },
    dracula: {
      name: 'Dracula',
      base100: '#282a36',
      primary: '#ff79c6',
      secondary: '#bd93f9',
      accent: '#ffb86c',
      neutral: '#414558',
      isDark: true,
    },
    cmyk: {
      name: 'CMYK',
      base100: '#ffffff',
      primary: '#45AEEE',
      secondary: '#E8488A',
      accent: '#FFF232',
      neutral: '#1a1a1a',
      isDark: false,
    },
    autumn: {
      name: 'Autumn',
      base100: '#f1f1f1',
      primary: '#8c0327',
      secondary: '#d85251',
      accent: '#d59b6a',
      neutral: '#2b2b2b',
      isDark: false,
    },
    business: {
      name: 'Business',
      base100: '#ffffff',
      primary: '#1c4e80',
      secondary: '#7c909a',
      accent: '#ea6947',
      neutral: '#2a323c',
      isDark: false,
    },
    acid: {
      name: 'Acid',
      base100: '#fafafa',
      primary: '#ff00f4',
      secondary: '#ff7400',
      accent: '#ffed00',
      neutral: '#191a3f',
      isDark: false,
    },
    lemonade: {
      name: 'Lemonade',
      base100: '#ffffff',
      primary: '#519903',
      secondary: '#e9e92f',
      accent: '#bf95f9',
      neutral: '#1f2937',
      isDark: false,
    },
    night: {
      name: 'Night',
      base100: '#0a0e27',
      primary: '#38bdf8',
      secondary: '#818cf8',
      accent: '#f471b5',
      neutral: '#1e293b',
      isDark: true,
    },
    coffee: {
      name: 'Coffee',
      base100: '#20161f',
      primary: '#db924b',
      secondary: '#6f4a3d',
      accent: '#db924b',
      neutral: '#120d0f',
      isDark: true,
    },
    winter: {
      name: 'Winter',
      base100: '#ffffff',
      primary: '#047aed',
      secondary: '#7dd3fc',
      accent: '#f000b8',
      neutral: '#1e293b',
      isDark: false,
    },
    dim: {
      name: 'Dim',
      base100: '#2a323c',
      primary: '#9edbf9',
      secondary: '#b893f8',
      accent: '#f5c391',
      neutral: '#1e2a35',
      isDark: true,
    },
    nord: {
      name: 'Nord',
      base100: '#eceff4',
      primary: '#5e81ac',
      secondary: '#81a1c1',
      accent: '#88c0d0',
      neutral: '#4c566a',
      isDark: false,
    },
    sunset: {
      name: 'Sunset',
      base100: '#1a1b28',
      primary: '#f27405',
      secondary: '#f2b705',
      accent: '#f24405',
      neutral: '#221b2e',
      isDark: true,
    },
  };

  businessForm = this.fb.group({
    businessBrand: ['', [Validators.required, Validators.pattern(FormUtils.businessPattern)]],
    logoFile: [null as File | null],
    existingLogoUrl: [null as string | null],
    daisyTheme: ['light', Validators.required],
    baseFontSize: ['md', Validators.required],
    fontFamily: ['sans-serif', Validators.required],
    carouselImages: this.fb.array<File | null>([]),
    existingCarouselImageUrls: this.fb.array<FormControl<string | null>>([])
  });

  private formSubscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.daisyThemes = this.customizationService.getDaisyThemes();
    this.loadGoogleFonts();

    this.formSubscription.add(
      this.businessForm.get('fontFamily')?.valueChanges.subscribe(fontFamily => {
        if (fontFamily) {
          this.loadGoogleFontDynamically(fontFamily);
        }
      })
    );

    this.loadGoogleFontDynamically(this.businessForm.get('fontFamily')?.value || 'sans-serif');

    this.businessId = this.authService.user()?.businessId || null;
    if (this.businessId) {
      this.loadExistingCustomization(this.businessId);
    } else {
      this.isLoadingInitial.set(false);
    }
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  get carouselImages(): FormArray<FormControl<File | null>> {
    return this.businessForm.get('carouselImages') as FormArray<FormControl<File | null>>;
  }

  get existingCarouselImageUrls(): FormArray<FormControl<string | null>> {
    return this.businessForm.get('existingCarouselImageUrls') as FormArray<FormControl<string | null>>;
  }
  showSuccessModal(): boolean {
    return this.showSuccessModalValue();
  }

  toggleThemeDropdown() {
    this.isThemeDropdownOpen.update((value) => !value);
  }

  selectTheme(theme: DaisyTheme) {
    this.businessForm.patchValue({ daisyTheme: theme.name });
    this.isThemeDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.theme-dropdown-container')) {
      this.isThemeDropdownOpen.set(false);
    }
  }

  getThemeColors(themeName: string): ThemeColors | null {
    return this.themeColors[themeName] || null;
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.businessForm.patchValue({ logoFile: file, existingLogoUrl: null });

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.businessForm.patchValue({ logoFile: null });
      
      this.logoPreviewUrl = this.businessForm.get('existingLogoUrl')?.value ?? null;
    }
  }

  onCarouselImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.carouselImages.push(new FormControl(file));

        const reader = new FileReader();
        reader.onload = () => {
          this.carouselImagePreviews.push({ file: file, url: reader.result, isExisting: false });
        };
        reader.readAsDataURL(file);
      }
      input.value = '';
    }
  }

  removeCarouselImage(index: number, isExisting: boolean): void {
    if (isExisting) {
      const existingUrl = this.carouselImagePreviews[index].url as string;
      const urlIndex = this.existingCarouselImageUrls.controls.findIndex(control => control.value === existingUrl);
      if (urlIndex !== -1) {
        this.existingCarouselImageUrls.removeAt(urlIndex);
      }
    } else {
      const newFileIndex = this.carouselImages.controls.findIndex(control => control.value === this.carouselImagePreviews[index].file);
      if (newFileIndex !== -1) {
        this.carouselImages.removeAt(newFileIndex);
      }
    }
    this.carouselImagePreviews.splice(index, 1);
  }

  loadGoogleFonts(): void {
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${this.googleFontsApiKey}`;
    this.http.get<{ items: GoogleFont[] }>(url).subscribe({
      next: response => {
        console.log('Fuentes de Google cargadas:', response.items);
        this.googleFonts = response.items;
        this.filteredGoogleFonts = this.googleFonts.slice(0, 50);
      },
      error: error => {
        console.error('Error al cargar Google Fonts:', error);
      }
    });
  }

  onFontSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (searchTerm.length > 2) {
      this.filteredGoogleFonts = this.googleFonts.filter(font =>
        font.family.toLowerCase().includes(searchTerm)
      ).slice(0, 50);
    } else {
      this.filteredGoogleFonts = this.googleFonts.slice(0, 50);
    }
  }

  loadGoogleFontDynamically(fontFamily: string): void {
    if (fontFamily && !['sans-serif', 'serif', 'monospace'].includes(fontFamily.toLowerCase())) {
      const linkId = `google-font-${fontFamily.replace(/\s/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }

  onSubmitBusinessForm() {
    Object.keys(this.businessForm.controls).forEach((controlName) => {
      const control = this.businessForm.get(controlName);
      control?.markAsTouched();
    });

    if (this.businessForm.invalid) {
      console.error('Formulario de negocio inválido');
      return;
    }

    if (!this.businessId) {
      console.error('Business ID no disponible para guardar/actualizar la personalización.');
      return;
    }

    this.isSaving.set(true);

    const formValues = this.businessForm.getRawValue();

    const newCarouselFilesToUpload: File[] = this.carouselImages.controls
      .map(control => control.value)
      .filter((file): file is File => file !== null);

    this.showSuccessModalValue.set(false);

    const customizationDataForService = {
      businessName: formValues.businessBrand || '',
      daisyTheme: formValues.daisyTheme || 'light',
      baseFontSize: formValues.baseFontSize || 'md',
      fontFamily: formValues.fontFamily || 'sans-serif',
      existingCarouselUrls: formValues.existingCarouselImageUrls.filter(url => url !== null) as string[]
    };

    let operation$: Observable<any>;

    if (this.isCustomizationExisting) {
      operation$ = this.customizationService.updateCustomization(
        this.businessId,
        customizationDataForService,
        formValues.logoFile,
        formValues.existingLogoUrl,
        newCarouselFilesToUpload,
        customizationDataForService.existingCarouselUrls
      );
    } else {
      operation$ = this.customizationService.saveCustomization(
        customizationDataForService,
        formValues.logoFile,
        newCarouselFilesToUpload
      );
    }


    operation$.pipe(
      catchError(error => {
        console.error('Error al guardar/actualizar personalización:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSaving.set(false);
        if (!this.isCustomizationExisting && this.businessId) {
            this.loadExistingCustomization(this.businessId); 
        }
      })
    ).subscribe((response: any) => {
      if (response) {
        console.log('Personalización guardada/actualizada con éxito:', response);
        this.showSuccessModalValue.set(true);
        this.isCustomizationExisting = true;

        setTimeout(() => {
          this.showSuccessModalValue.set(false); 
          this.router.navigate(['']); 
        }, 2000);
      }
    });
  }

  loadExistingCustomization(businessId: string): void {
    this.isLoadingInitial.set(true);
    
    if (!businessId) {
      console.warn('No businessId proporcionado para cargar la personalización.');
      this.isCustomizationExisting = false; 
      this.isLoadingInitial.set(false);
      return;
    }

    this.customizationService.getCustomization(businessId).subscribe({
      next: (data: CustomizationPayload) => {
        this.businessForm.patchValue({
          businessBrand: data.brand,
          daisyTheme: this.daisyThemes.find(theme => theme.id === data.themeId)?.name || 'light',
          baseFontSize: this.mapNumberToBaseFontSize(data.fontSize),
          fontFamily: data.font,
          existingLogoUrl: data.logo,
          logoFile: null
        });

        if (data.logo) {
          this.logoPreviewUrl = data.logo;
        } else {
          this.logoPreviewUrl = null;
        }

        this.carouselImages.clear();
        this.existingCarouselImageUrls.clear();
        this.carouselImagePreviews = [];

        data.imageCarousel.forEach(url => {
          this.existingCarouselImageUrls.push(new FormControl(url));
          this.carouselImagePreviews.push({ file: null, url: url, isExisting: true });
        });

        this.loadGoogleFontDynamically(data.font);
        this.isCustomizationExisting = true; 
        this.isLoadingInitial.set(false);
      },
      error: (error) => {
        console.warn(`No se encontró personalización para el businessId ${businessId}. Procediendo con formulario vacío para creación o configuración inicial.`);
        this.businessForm.reset({
          businessBrand: '',
          logoFile: null,
          existingLogoUrl: null,
          daisyTheme: 'light',
          baseFontSize: 'md',
          fontFamily: 'sans-serif',
          carouselImages: [],
          existingCarouselImageUrls: []
        });
        this.logoPreviewUrl = null;
        this.carouselImagePreviews = [];
        this.loadGoogleFontDynamically('sans-serif'); 
        this.isCustomizationExisting = false;
        this.isLoadingInitial.set(false); 
      }
    });
  }

  private mapNumberToBaseFontSize(fontSize: number): string {
    switch (fontSize) {
      case 14: return 'sm';
      case 16: return 'md';
      case 18: return 'lg';
      case 20: return 'xl';
      default: return 'md';
    }
  }

  showCurrentFontMessage(): boolean {
    const currentFont = this.businessForm.get('fontFamily')?.value;
    if (!currentFont) {
      return false;
    }
    return !['sans-serif', 'serif', 'monospace'].includes(currentFont.toLowerCase()) &&
      !this.filteredGoogleFonts.some(f => f.family === currentFont);
  }

  getFontSize(baseSize: string | null | undefined, element: 'h1' | 'h2' | 'p' | 'button' | 'footer'): string {
    if (!baseSize) return '16px';

    const sizes: { [key: string]: { h1: string, h2: string, p: string, button: string, footer: string } } = {
      'sm': { h1: '2rem', h2: '1.5rem', p: '0.875rem', button: '0.875rem', footer: '0.75rem' },
      'md': { h1: '2.25rem', h2: '1.75rem', p: '1rem', button: '1rem', footer: '0.875rem' },
      'lg': { h1: '2.5rem', h2: '2rem', p: '1.125rem', button: '1.125rem', footer: '1rem' },
      'xl': { h1: '2.75rem', h2: '2.25rem', p: '1.25rem', button: '1.25rem', footer: '1.125rem' },
    };
    return sizes[baseSize]?.[element] || '16px';
  }
}