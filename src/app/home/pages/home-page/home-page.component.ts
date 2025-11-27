import { Component, inject, signal} from '@angular/core';
import { CustomizationPayload, CustomizationService } from '../../../customization/services/customization.service';
import { AuthService } from '../../../auth/services/auth.service';


@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  private authService = inject(AuthService);
  private customizationService = inject(CustomizationService);

  isLoading = signal(true);
  businessData = signal<CustomizationPayload | null>(null);
  currentThemeName = signal('light');
  
  welcomePhrase = signal('Bienvenido a tu espacio de trabajo');

  ngOnInit() {
    const businessId = this.authService.user()?.businessId;

    if (businessId) {
      this.loadBusinessInfo(businessId);
    } else {
      this.isLoading.set(false);
    }
  }

  loadBusinessInfo(id: string) {
    this.customizationService.getCustomization(id).subscribe({
      next: (data) => {
        this.businessData.set(data);
        
        const themes = this.customizationService.getDaisyThemes();
        const foundTheme = themes.find(t => t.id === data.themeId);
        if (foundTheme) this.currentThemeName.set(foundTheme.name);

        if (data.font) this.loadGoogleFontDynamically(data.font);

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadGoogleFontDynamically(fontFamily: string): void {
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
}
