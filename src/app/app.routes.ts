import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { ListarUsuariosComponent } from './listar-usuarios/listar-usuarios.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { MaestroTurnoComponent } from './maestro-turno/maestro-turno.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'listarUsuario', component: ListarUsuariosComponent },
    { path: 'recovery', component: RecuperarPasswordComponent },
    { path: 'maestroTurno', component: MaestroTurnoComponent }


];
