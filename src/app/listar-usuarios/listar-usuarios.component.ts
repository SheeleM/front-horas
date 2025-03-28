import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AxiosService } from '../axios.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Rol {
  idRol: number;
  nombre: string;
}

interface Usuario {
  id: number;
  fullname: string;
  cedula: number;
  estado: boolean;
  rol: Rol;
  cambiosPendientes?: boolean;
  cambiosEstado?: boolean;
  cambiosRol?: boolean;
}

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.css']
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  usuariosOriginales: Record<number, Usuario> = {};
  mostrarContrasena: boolean = false;
  
  mostrarPopup = false;
  usuarioSeleccionado: Usuario | null = null;
  nuevaContrasena: string = '';
  //confirmasContrasena: string = '';

  constructor(private axiosService: AxiosService) {}

  abrirPopup(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.mostrarPopup = true;
    this.nuevaContrasena = '';
    //this.confirmasContrasena = '';
  }

  cerrarPopup() {
    this.mostrarPopup = false;
    this.nuevaContrasena = '';
    //this.confirmasContrasena = '';
    this.usuarioSeleccionado = null;
  }

  ngOnInit(): void {
    this.obtenerRoles().then(() => {
      this.obtenerUsuarios();
    });
  }


  
  async asignarContrasena() {
    console.log('lac edulaaaaaaaaaaaaaaaa',this.usuarioSeleccionado?.cedula)
    if (!this.usuarioSeleccionado) {
      Swal.fire('Error', 'No hay usuario seleccionado', 'error');
      return;
    }
    if (!this.nuevaContrasena.trim()) {
      Swal.fire('Error', 'La contraseña no puede estar vacía', 'error');
      return;
    }
    /*if (this.nuevaContrasena !== this.confirmasContrasena) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }*/
    try {
      // llamada al backend para cambiar la contraseña
      await this.axiosService.post(`/user/update-password-admin`, 
        {  cedula:this.usuarioSeleccionado.cedula,
          newPassword: this.nuevaContrasena 

        });
      
      Swal.fire(
        'Actualizado',
        `La contraseña del usuario ${this.usuarioSeleccionado.fullname} ha sido actualizada`,
        'success'
      );

      console.log(`Asignando contraseña al usuario: ${this.usuarioSeleccionado.fullname}`);
      this.cerrarPopup();
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      Swal.fire(
        'Error',
        'No se pudo actualizar la contraseña. Inténtalo de nuevo más tarde.',
        'error'
      );
    }
  }

  async obtenerRoles() {
    try {
      const response = await this.axiosService.get<Rol[]>('/rol');
      this.roles = response.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  }

  async obtenerUsuarios() {
    try {
      const response = await this.axiosService.get<Usuario[]>('/user');
      this.usuarios = response.data;
      this.usuarios.forEach(usuario => {
        if (usuario.rol && usuario.rol.idRol) {
          const matchedRole = this.roles.find(role => role.idRol === usuario.rol.idRol);
          if (matchedRole) {
            usuario.rol = matchedRole;
          }
        }
        // Guardar copia del estado original
        this.usuariosOriginales[usuario.id] = {
          ...usuario,
          rol: { ...usuario.rol }
        };
        usuario.cambiosPendientes = false;
        usuario.cambiosEstado = false;
        usuario.cambiosRol = false;
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  }

  detectarCambiosEstado(usuario: Usuario) {
    const original = this.usuariosOriginales[usuario.id];
    usuario.cambiosEstado = usuario.estado !== original.estado;
    this.actualizarEstadoCambiosPendientes(usuario);
  }

  detectarCambiosRol(usuario: Usuario) {
    const original = this.usuariosOriginales[usuario.id];
    usuario.cambiosRol = usuario.rol.idRol !== original.rol.idRol;
    this.actualizarEstadoCambiosPendientes(usuario);
  }

  actualizarEstadoCambiosPendientes(usuario: Usuario) {
    usuario.cambiosPendientes = usuario.cambiosEstado || usuario.cambiosRol;
  }

  async actualizarUsuario(usuario: Usuario) {
    if (!usuario.cambiosPendientes) {
      return;
    }

    try {
      const datosActualizados = {
        id: Number(usuario.id),
        estado: usuario.estado,
        rol: Number(usuario.rol.idRol),
      };

      console.log(datosActualizados);
      await this.axiosService.put(`/user`, datosActualizados);
      this.usuariosOriginales[usuario.id] = {
        ...usuario,
        rol: { ...usuario.rol }
      };

      usuario.cambiosPendientes = false;
      usuario.cambiosEstado = false;
      usuario.cambiosRol = false;

      Swal.fire(
        '¡Actualizado!',
        `El usuario ${usuario.fullname} ha sido actualizado correctamente.`,
        'success'
      );
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      Swal.fire(
        'Error',
        'No se pudo actualizar el usuario. Inténtalo de nuevo más tarde.',
        'error'
      );
    }
  }
}