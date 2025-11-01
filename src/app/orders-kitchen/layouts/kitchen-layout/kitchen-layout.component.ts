import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/app-navbar/navbar.component';

@Component({
  selector: 'app-kitchen-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './kitchen-layout.component.html',
})
export class KitchenLayoutComponent {}
