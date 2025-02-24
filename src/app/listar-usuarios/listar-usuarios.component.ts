import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AxiosService } from '../axios.service';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: number;
  fullname: string;
  cedula: number;
  estado: string;
  rol: number;
}

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './listar-usuarios.component.html',
  styleUrl: './listar-usuarios.component.css'
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];

  constructor(private axiosService: AxiosService) {} // Inyecta el servicio

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  async obtenerUsuarios() {
    try {
      const response = await this.axiosService.get<Usuario[]>('/user'); 
      this.usuarios = response.data;
      console.log(response)
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  }

  eliminarUsuario(id: number): void {
    this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
  }
}
