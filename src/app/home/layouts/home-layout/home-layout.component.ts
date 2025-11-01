import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/app-navbar/navbar.component';

@Component({
  selector: 'app-store-front-layout',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './home-layout.component.html',
})
export class HomeLayoutComponent {}
