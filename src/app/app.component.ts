import { Component } from '@angular/core';
import { Router, NavigationEnd,RouterOutlet } from '@angular/router';
import { SidebarLeftComponent } from "./components/sidebar-left/sidebar-left.component";
import { SidebarRightComponent } from "./components/sidebar-right/sidebar-right.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,RouterOutlet,SidebarLeftComponent, SidebarRightComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-horas-extra';
  showSidebars = true; // Variable para controlar la visibilidad de los sidebars
  private noSidebarRoutes = ['/login', '/registro', '/recovery',"/"]; // Rutas sin sidebar

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSidebars = !this.noSidebarRoutes.includes(event.url);
      }
    });
  }
}
