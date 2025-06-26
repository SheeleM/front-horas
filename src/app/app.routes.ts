import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { ListarUsuariosComponent } from './listar-usuarios/listar-usuarios.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { MaestroTurnoComponent } from './maestro-turno/maestro-turno.component';
import { RegistroTurnoComponent } from './registro-turno/registro-turno.component';
import { RegistroHorasComponent } from './registro-horas/registro-horas.component';
import { authGuard } from './core/guards/auth.guard';
import { MaestroHoraLegalComponent } from './maestro-hora-legal/maestro-hora-legal.component';
import { rolesGuard } from './core/guards/roles.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recovery', component: RecuperarPasswordComponent },


  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'listarUsuario', component: ListarUsuariosComponent },
      {
        path: 'maestroTurno',
        component: MaestroTurnoComponent,
       // canActivate: [rolesGuard],
       // data: { roles: ['admin', 'INGENIERO'] },
      },
      { path: 'RegistroTurno', component: RegistroTurnoComponent },
      { path: 'registrohora', component: RegistroHorasComponent },
      { path: 'maestroHoraLegal', component: MaestroHoraLegalComponent },
    ],
  },
];
