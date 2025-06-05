import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lregistroHoraService } from './services/registroHora.service';
import Swal from 'sweetalert2';

// Interface actualizada para coincidir con la respuesta del backend
export interface HoraExtra {
  idHoraExtra: number;
  fecha: string;
  ticket: string;
  horaInicio: string;
  horaFin: string;
  cantidadHoras: number;
  tipoHoraExtraId: number;
  usuarioE: number;
  turno: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  tipoHoraExtra?: {
    id: number;
    codigoHoraExtra: string;
    descripcion: string;
    horaInicio: string;
    horaFin: string;
    horaInicio2: string;
    horaFin2: string;
    creado: string | null;
    actualizado: string;
  };
  usuario?: {
    id: number;
    fullname: string;
    cedula: number;
    respuestaSeguridad: string;
    password: string;
    estado: boolean;
    deleteAt: string | null;
  };
  usuarioTurno?: {
    idUsuarioTurno: number;
    turnoFK: number;
    usuarioFK: number;
    fechaInicio: string;
    fechaFin: string;
    creado: string;
    actualizado: string;
    userTurno: {
      id: number;
      fullname: string;
      cedula: number;
      respuestaSeguridad: string;
      password: string;
      estado: boolean;
      deleteAt: string | null;
    };
    turno: {
      idTurno: number;
      nombre: string;
      codigo: string;
      horaInicio: string;
      horaFin: string;
      diaInicio: string;
      diaFin: string;
      cread: string;
      actualizado: string;
    };
  };
  // Propiedades computadas para la tabla
  //estado?: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'; // ✅ NUEVO: Estados definidos

  tipoHora?: string;
  tiempo?: string;
}

export interface UpdateHoraExtraDto {
  idUsuarioTurno: number;
  fecha?: string;
  ticket?: string;
  horaInicio?: string;
  horaFin?: string;
}

@Component({
  selector: 'app-registro-horas',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './registro-horas.component.html',
  styleUrl: './registro-horas.component.css'
})
export class RegistroHorasComponent {
  registroHoraForm!: FormGroup;
  editandoTurno: boolean = false;
  horasExtras: HoraExtra[] = [];
  
  // ✅ CORREGIDO: Inicializar dataSource correctamente
  dataSource = new MatTableDataSource<HoraExtra>();
  displayedColumns: string[] = ['fecha', 'turno', 'ticket', 'horaInicio', 'horaFin', 'tiempo', 'tipoHora', 'estado', 'acciones'];
  editandoId: number | null = null;

    // ✅ NUEVAS PROPIEDADES
  esAdministrador: boolean = false;
  usuarioActual: any = null;
  estadosDisponibles = [
    { valor: 'PENDIENTE', texto: 'Pendiente', clase: 'badge-warning' },
    { valor: 'APROBADA', texto: 'Aprobada', clase: 'badge-success' },
    { valor: 'RECHAZADA', texto: 'Rechazada', clase: 'badge-danger' }
  ];

  constructor(private registroHoraService: lregistroHoraService) {
    this.registroHoraForm = new FormGroup({
      ticket: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      horaInicio: new FormControl('', [Validators.required]),
      horaFin: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.cargarHorasExtras();
    this.cargarInformacionUsuario(); // ✅ Cargar información del usuario
  }

  cargarHorasExtras(): void {
    console.log('Cargando horas extras...');
    this.registroHoraService.obtenerHorasExtras().subscribe({
      next: (horasExtras: any[]) => {
        console.log('Datos recibidos del servicio:', horasExtras);
        
        // ✅ CORREGIDO: Mapeo completo de los datos
        this.horasExtras = horasExtras.map(hora => ({
          ...hora,
          // Propiedades computadas para la tabla
        //  estado: 'Pendiente',
        estado: hora.estado || 'PENDIENTE',

          tipoHora: hora.tipoHoraExtra?.descripcion || 'No asignado',
          tiempo: this.calcularTiempoTrabajado(hora.horaInicio, hora.horaFin),
          // Formatear las horas si es necesario
          horaInicio: this.formatearHoraParaMostrar(hora.horaInicio),
          horaFin: this.formatearHoraParaMostrar(hora.horaFin)
        }));
        
        // ✅ CRÍTICO: Actualizar el dataSource de la tabla
        this.dataSource.data = this.horasExtras;
        
        console.log('Horas extras procesadas:', this.horasExtras);
        console.log('DataSource actualizado:', this.dataSource.data);
      },
      error: (err) => {
        console.error('Error al cargar horas extras:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las horas extras'
        });
      }
    });
  }

  // ✅ NUEVO: Método para calcular tiempo trabajado
  calcularTiempoTrabajado(horaInicio: string, horaFin: string): string {
    if (!horaInicio || !horaFin) return '0:00';
    
    try {
      // Convertir horas a minutos
      const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
      const [finHoras, finMinutos] = horaFin.split(':').map(Number);
      
      const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos;
      const finTotalMinutos = finHoras * 60 + finMinutos;
      
      let diferenciaMinutos = finTotalMinutos - inicioTotalMinutos;
      
      // Manejar casos donde la hora fin es del día siguiente
      if (diferenciaMinutos < 0) {
        diferenciaMinutos += 24 * 60; // Agregar 24 horas en minutos
      }
      
      const horas = Math.floor(diferenciaMinutos / 60);
      const minutos = diferenciaMinutos % 60;
      
      return `${horas}:${minutos.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculando tiempo:', error);
      return '0:00';
    }
  }

  // ✅ MEJORADO: Método para formatear horas
  formatearHoraParaMostrar(hora: string): string {
    if (!hora) return '';
    
    // Si la hora viene en formato "HH:mm:ss", extraer solo "HH:mm"
    if (hora.includes(':')) {
      const partes = hora.split(':');
      if (partes.length >= 2) {
        return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
      }
    }
    
    // Si viene en formato de 4 dígitos como "0800"
    if (hora.length === 4 && /^\d{4}$/.test(hora)) {
      return `${hora.substring(0, 2)}:${hora.substring(2, 4)}`;
    }
    
    return hora;
  }

  onSubmit(): void {
    if (this.registroHoraForm.invalid) {
      this.registroHoraForm.markAllAsTouched();
      return;
    }

    const data = this.registroHoraForm.value;
    console.log('Enviando datos:', data);

    if (this.editandoTurno && this.editandoId) {
      // Modo edición
      this.registroHoraService.actualizarHoraExtra(this.editandoId, data).subscribe({
        next: (res) => {
          this.registroHoraForm.reset();
          this.editandoTurno = false;
          this.editandoId = null;
          Swal.fire({
            icon: 'success',
            title: 'Hora extra actualizada',
            text: 'La hora extra se actualizó correctamente.'
          });
          this.cargarHorasExtras(); // ✅ Recargar datos
        },
        error: (err) => {
          console.error('Error al actualizar hora extra', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la hora extra.'
          });
        }
      });
    } else {
      // Modo creación
      this.registroHoraService.crearHoraExtra(data).subscribe({
        next: (res) => {
          console.log('Hora extra creada:', res);
          this.registroHoraForm.reset();
          Swal.fire({
            icon: 'success',
            title: 'Hora extra registrada',
            text: 'La hora extra se registró correctamente.'
          });
          this.cargarHorasExtras(); // ✅ Recargar datos
        },
        error: (err) => {
          console.error('Error al registrar hora extra', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar la hora extra. Intenta nuevamente.'
          });
        }
      });
    }
  }

  // ✅ SOLUCIÓN ÓPTIMA: Solo agregar este método a tu componente
convertirFechaParaInput(fecha: string): string {
  if (!fecha) return '';
  
  // Si la fecha viene en formato ISO del backend (2025-05-29T05:00:00.000Z)
  if (fecha.includes('T')) {
    return fecha.split('T')[0]; // Retorna solo "2025-05-29"
  }
  
  return fecha;
}
  // ✅ NUEVO: Método para editar
  editarHoraExtra(element: HoraExtra): void {
    this.editandoTurno = true;
    this.editandoId = element.idHoraExtra;
    
    // Llenar el formulario con los datos existentes
    this.registroHoraForm.patchValue({
      ticket: element.ticket,
     // fecha: element.fecha,
      fecha: this.convertirFechaParaInput(element.fecha),
      horaInicio: element.horaInicio,
      horaFin: element.horaFin
    });
  }

  // ✅ NUEVO: Método para eliminar
  eliminarHoraExtra(element: HoraExtra): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.registroHoraService.eliminarHoraExtra(element.idHoraExtra).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La hora extra ha sido eliminada', 'success');
            this.cargarHorasExtras(); // Recargar datos
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar la hora extra', 'error');
          }
        });
      }
    });
  }

  // ✅ NUEVO: Método para cancelar edición
  cancelarEdicion(): void {
    this.editandoTurno = false;
    this.editandoId = null;
    this.registroHoraForm.reset();
  }

  // Getters para validación
  get ticketInvalid() {
    const control = this.registroHoraForm.get('ticket');
    return control?.invalid && control?.touched;
  }

  get fechaInvalid() {
    const control = this.registroHoraForm.get('fecha');
    return control?.invalid && control?.touched;
  }

  get horaInicioInvalid() {
    const control = this.registroHoraForm.get('horaInicio');
    return control?.invalid && control?.touched;
  }

  get horaFinInvalid() {
    const control = this.registroHoraForm.get('horaFin');
    return control?.invalid && control?.touched;
  }

   // ✅ NUEVO: Cargar información del usuario desde localStorage
  cargarInformacionUsuario(): void {
    try {
      const userData = JSON.parse(localStorage.getItem('users') || '{}');
      
      if (userData && Object.keys(userData).length > 0) {
        this.usuarioActual = userData;
        this.esAdministrador = this.verificarEsAdministrador(userData.rol);
        console.log('Usuario actual:', this.usuarioActual);
        console.log('Es administrador:', this.esAdministrador);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

   // ✅ NUEVO: Verificar si es administrador
  verificarEsAdministrador(rolUsuario: string): boolean {
    const rolesAdmin = ['ADMINISTRADOR', 'ADMIN', 'administrador', 'admin'];
    return rolesAdmin.includes(rolUsuario);
  }

  
  // ✅ NUEVO: Obtener clase CSS del estado
  obtenerClaseEstado(estado: string): string {
    const estadoEncontrado = this.estadosDisponibles.find(e => e.valor === estado);
    return estadoEncontrado?.clase || 'badge-secondary';
  }

    // ✅ NUEVO: Verificar permisos para editar
  puedeEditarHoraExtra(horaExtra: HoraExtra): boolean {
    if (!this.esAdministrador) {
      return horaExtra.usuarioE === this.usuarioActual?.id && horaExtra.estado === 'PENDIENTE';
    }
    return true;
  }


  // ✅ MÉTODO CRÍTICO CORREGIDO: Actualización inmediata del estado
  cambiarEstadoHoraExtra(horaExtra: HoraExtra, nuevoEstado: string): void {
    if (!this.esAdministrador) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin permisos',
        text: 'Solo los administradores pueden cambiar el estado'
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar cambio?',
      text: `¿Cambiar estado a ${nuevoEstado}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ SOLUCIÓN 1: Actualización optimista (inmediata en la UI)
        const indice = this.horasExtras.findIndex(h => h.idHoraExtra === horaExtra.idHoraExtra);
        if (indice !== -1 && (nuevoEstado === 'PENDIENTE' || nuevoEstado === 'APROBADA' || nuevoEstado === 'RECHAZADA')) {
          this.horasExtras[indice].estado = nuevoEstado as 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
          this.dataSource.data = [...this.horasExtras]; // Forzar actualización
        }

        this.registroHoraService.cambiarEstadoHoraExtra(horaExtra.idHoraExtra, nuevoEstado).subscribe({
          next: (response) => {
            console.log('Respuesta del backend:', response);
            Swal.fire('Actualizado', `Estado cambiado a ${nuevoEstado}`, 'success');
            
            // ✅ SOLUCIÓN 2: Recargar datos del backend para confirmar
            setTimeout(() => {
              this.cargarHorasExtras();
            }, 500);
          },
          error: (err) => {
            console.error('Error:', err);
            // ✅ ROLLBACK: Revertir cambio optimista si hay error
            if (indice !== -1) {
              this.horasExtras[indice].estado = horaExtra.estado;
              this.dataSource.data = [...this.horasExtras];
            }
            Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
          }
        });
      }
    });
  }

}