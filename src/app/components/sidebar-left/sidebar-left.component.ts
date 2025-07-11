import { LoginService } from './../../login/services/Login.service';
import { CommonModule  } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginComponent } from '../../login/login.component';

@Component({
  selector: 'app-sidebar-left',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar-left.component.html',
  styleUrl: './sidebar-left.component.css'
})
export class SidebarLeftComponent implements OnInit {
data:any 

  constructor(private router: Router, private login: LoginService){
    this.data = JSON.parse(localStorage.getItem('users') || ({} as any));
    const rol = this.data.rol; // Ej: "admin", "consultor"
  }

  menuItems = {
    favoritos: [
      { title: 'Gestión de turnos', icon: 'fa-circle', link: '/gestion-turnos' },
      { title: 'Horas extras', icon: 'fa-circle', link: '/horas-extras' }
    ],
    tableros: [
      { title: 'Gestión de turnos', icon: 'fa-calendar', link: '/gestion-turnos', active: true },
      { title: 'Promación de turnos', icon: 'fa-calendar-check', link: '/promacion-turnos' },
      { title: 'Horas extras', icon: 'fa-folder', link: '/horas-extras' }
    ]
  };

  item = [
    { title: ' Maestro turno', icon: 'fa-calendar', link: '/maestroTurno' , roles:['admin'] },
  ]
    
  ngOnInit(): void {
    // Obtener el rol del usuario desde el localStorage
    const userData = localStorage.getItem('users');
    if (userData) {
      const parsedData = JSON.parse(userData);

    }
    console.log("usuariooo en sidebar",userData)
  }

  navigateToPage() {
    this.router.navigate(['/maestroTurno']); // Ajusta la ruta según sea necesario
  }

  logout(): void {
  this.login.logout();
  this.router.navigate(['/login']);
}


}
