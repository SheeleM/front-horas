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
  styleUrl: './listar-usuarios.component.css'
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  usuariosOriginales: Record<number, Usuario> = {};

  constructor(private axiosService: AxiosService) { }

  ngOnInit(): void {
    this.obtenerRoles().then(() => {
      this.obtenerUsuarios();
    });
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
        if (usuario.rol) {
          console.log(usuario.rol.idRol)
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



  // Método para detectar cambios en el estado
  detectarCambiosEstado(usuario: Usuario) {
    const original = this.usuariosOriginales[usuario.id];
    usuario.cambiosEstado = usuario.estado !== original.estado;
    this.actualizarEstadoCambiosPendientes(usuario);
  }

  // Método para detectar cambios en el rol
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