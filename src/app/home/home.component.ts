import { Component } from '@angular/core';
import { SidebarLeftComponent } from '../components/sidebar-left/sidebar-left.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarLeftComponent,RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
