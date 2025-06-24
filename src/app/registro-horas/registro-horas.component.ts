import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule, // ✅ Agregar esta línea
} from '@angular/forms';
import { lregistroHoraService } from './services/registroHora.service';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
  esFestivo?: boolean;
  esDomingo?: boolean;
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

interface Estado {
  valor: string;
  nombre: string;
  clase: string;
}
// ✅ NUEVA: Interface para filtros
export interface FiltrosHorasExtra {
  fechaDesde: string;
  fechaHasta: string;
  estado?: string[];
  //mesSeleccionado?:string;
}
@Component({
  selector: 'app-registro-horas',
  standalone: true,
  imports: [
    MatSelectModule, // Esto incluye mat-option automáticamente
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    MatSlideToggleModule,
    
  ],
  templateUrl: './registro-horas.component.html',
  styleUrl: './registro-horas.component.css',
})
export class RegistroHorasComponent {
  @ViewChild('allSelected') allSelected!: MatOption;

  registroHoraForm!: FormGroup;
  editandoTurno: boolean = false;
  horasExtras: HoraExtra[] = [];
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroEstado: string = '';
  datosOriginales: any[] = []; // Para guardar los datos sin filtrar

  cargaInicialCompleta: boolean = false;

  filtrosForm: FormGroup = new FormGroup({
  mesSeleccionado: new FormControl(''), // 👈 nuevo
  estados: new FormControl([]),
});


  estadosDisponibles: Estado[] = [
    { valor: 'PENDIENTE', nombre: 'Pendiente', clase: 'badge-warning' },
    { valor: 'APROBADA', nombre: 'Aprobada', clase: 'badge-success' },
    { valor: 'RECHAZADA', nombre: 'Rechazada', clase: 'badge-danger' },
  ];
  toppings = new FormControl('');

  toppingList: string[] = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

  getEstadosSeleccionados(): string {
    const estadosSeleccionados: string[] =
      this.filtrosForm.get('estados')?.value || [];

    if (!estadosSeleccionados || estadosSeleccionados.length === 0) {
      return 'Seleccionar estados';
    }

    if (estadosSeleccionados.length === this.estadosDisponibles.length) {
      return 'Todos los estados';
    }

    if (estadosSeleccionados.length === 1) {
      const estado = this.estadosDisponibles.find(
        (e) => e.valor === estadosSeleccionados[0]
      );
      return estado?.nombre || estadosSeleccionados[0];
    }

    return `${estadosSeleccionados.length} estados seleccionados`;
  }

  // ✅ MÉTODO PARA VERIFICAR SI TODOS ESTÁN SELECCIONADOS
  isAllSelected(): boolean {
    const estadosSeleccionados = this.filtrosForm.get('estados')?.value || [];
    return estadosSeleccionados.length === this.estadosDisponibles.length;
  }

  estado: string = '';

  // ✅ CORREGIDO: Inicializar dataSource correctamente
  dataSource = new MatTableDataSource<HoraExtra>();
  displayedColumns: string[] = [
  'ingeniero',
  'fecha',
  'turno',
  'ticket',
  'horaInicio',
  'horaFin',
  'tiempo',
  'tipoHora',
  'esFestivo',  // ✅ NUEVA COLUMNA
  'esDomingo',  // ✅ NUEVA COLUMNA
  'estado',
  'acciones',
  ];
  editandoId: number | null = null;

  // ✅ NUEVAS PROPIEDADES
  esAdministrador: boolean = false;
  usuarioActual: any = null;

  constructor(private registroHoraService: lregistroHoraService) {
    this.registroHoraForm = new FormGroup({
      ticket: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      horaInicio: new FormControl('', [Validators.required]),
      horaFin: new FormControl('', [Validators.required]),
      esFestivo: new FormControl(false), // Inicializar con valor booleano
      esDomingo: new FormControl(false)  // Inicializar con valor booleano
    });
  }

  ngOnInit(): void {
    // Elimina o comenta la siguiente línea si no tienes authService:
    // const usuarioActual = this.authService.getUsuarioActual();
    // this.esAdministrador = usuarioActual?.rol === 'ADMIN' || usuarioActual?.rol === 'ADMINISTRADOR';
    // console.log('Usuario actual:', usuarioActual);
    // console.log('Es administrador:', this.esAdministrador);

    // ✅ Cargar información del usuario desde localStorage
    this.cargarInformacionUsuario();
    console.log('Usuario cargado:', this.usuarioActual);
    console.log('Es administrador:', this.esAdministrador);

    this.cargarHorasExtras();
  }

  // ✅ CORREGIR: Método cargarHorasExtras mejorado
  cargarHorasExtras(): void {
  //  const fechaDesde = this.filtrosForm.get('fechaDesde')?.value;
   // const fechaHasta = this.filtrosForm.get('fechaHasta')?.value;

 
    // ✅ OBTENER ESTADOS SELECCIONADOS CORRECTAMENTE
  const mesSeleccionado = this.filtrosForm.get('mesSeleccionado')?.value;

/*
if (!mesSeleccionado) {
  Swal.fire({
    icon: 'warning',
    title: 'Mes requerido',
    text: 'Por favor selecciona un mes.',
  });
  return;
}
*/

  const [anio, mes] = mesSeleccionado.split('-').map(Number);
  const fechaDesde = new Date(anio, mes - 1, 1);
  const fechaHasta = new Date(anio, mes, 0); // Último día del mes

  const estadosFormValue = this.filtrosForm.get('estados')?.value || [];
  const estadosSeleccionados = estadosFormValue.filter((estado: string) => estado !== 'todos');

  const filtros = {
    fechaDesde: fechaDesde.toISOString().split('T')[0],
    fechaHasta: fechaHasta.toISOString().split('T')[0],
    ...(estadosSeleccionados.length > 0 && { estado: estadosSeleccionados }),
  };


    this.registroHoraService.obtenerHorasExtras(filtros).subscribe({
      next: (horasExtras: any[]) => {
        console.log('Datos recibidos del servicio:', horasExtras);

        this.horasExtras = horasExtras.map((hora) => ({
          ...hora,
          estado: hora.estado || 'PENDIENTE',
          tipoHora: hora.tipoHoraExtra?.descripcion || 'No asignado',
          tiempo: this.calcularTiempoTrabajado(hora.horaInicio, hora.horaFin),
          horaInicio: this.formatearHoraParaMostrar(hora.horaInicio),
          horaFin: this.formatearHoraParaMostrar(hora.horaFin),
       esFestivo: Boolean(hora.esFestivo), // Convierte a boolean
        esDomingo: Boolean(hora.esDomingo)  // Convierte a boolean
        }));

        // Guardar datos originales
        this.datosOriginales = [...this.horasExtras];

        // Actualizar la tabla
        this.dataSource.data = this.horasExtras;

        this.cargaInicialCompleta = true;
        console.log('Horas extras procesadas:', this.horasExtras);
      },
      error: (err) => {
        console.error('Error al cargar horas extras:', err);

        let errorMessage = 'No se pudieron cargar las horas extras';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
      },
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
      this.registroHoraService
        .actualizarHoraExtra(this.editandoId, data)
        .subscribe({
          next: (res) => {
            this.registroHoraForm.reset();
            this.editandoTurno = false;
            this.editandoId = null;
            Swal.fire({
              icon: 'success',
              title: 'Hora extra actualizada',
              text: 'La hora extra se actualizó correctamente.',
            });
            this.cargarHorasExtras(); // ✅ Recargar datos
          },
          error: (err) => {
            let errorMessage = 'Error desconocido';
            if (err.error && err.error.message) {
              errorMessage = err.error.message;
            } else if (err.message) {
              errorMessage = err.message;
            } else if (typeof err.error === 'string') {
              errorMessage = err.error;
            }
            console.error('Error al actualizar hora extra', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
            });
          },
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
            text: 'La hora extra se registró correctamente.',
          });
          this.cargarHorasExtras(); // ✅ Recargar datos
        },
        error: (err) => {
          let errorMessage = 'Error desconocido';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          } else if (typeof err.error === 'string') {
            errorMessage = err.error;
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
          });
        },
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
    console.log('ENTRO A EDITAR HORA EXTRA XXX');

    this.editandoTurno = true;
    this.editandoId = element.idHoraExtra;

    // Llenar el formulario con los datos existentes
    this.registroHoraForm.patchValue({
      ticket: element.ticket,
      // fecha: element.fecha,
      fecha: this.convertirFechaParaInput(element.fecha),
      horaInicio: element.horaInicio,
      horaFin: element.horaFin,
      esFestivo: !!element.esFestivo,
      esDomingo: !!element.esDomingo
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.registroHoraService
          .eliminarHoraExtra(element.idHoraExtra)
          .subscribe({
            next: () => {
              Swal.fire(
                'Eliminado',
                'La hora extra ha sido eliminada',
                'success'
              );
              this.cargarHorasExtras(); // Recargar datos
            },
            error: (err) => {
              console.error('Error al eliminar:', err);
              Swal.fire('Error', 'No se pudo eliminar la hora extra', 'error');
            },
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
    get horaInicio2Invalid() {
    const control = this.registroHoraForm.get('horaInicio2');
    return control?.invalid && control?.touched;
  }

  get horaFin2Invalid() {
    const control = this.registroHoraForm.get('horaFin2');
    return control?.invalid && control?.touched;
  }

  
  get esFestivoInvalid() {
    const control = this.registroHoraForm.get('esFestivo');
    return control?.invalid && control?.touched;
  }

  get esDomingoInvalid() {
    const control = this.registroHoraForm.get('esDomingo');
    return control?.invalid && control?.touched;
  }

  // ✅ NUEVO: Cargar información del usuario desde localStorage
  cargarInformacionUsuario(): void {
    try {
      const userData = JSON.parse(localStorage.getItem('users') || '{}');
        console.log('Es administrador uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu:', this.esAdministrador);
        console.log('Usuario actual:', this.usuarioActual);

      if (userData && Object.keys(userData).length > 0) {
        this.usuarioActual = userData;
        this.esAdministrador = this.verificarEsAdministrador(userData.rol);
        console.log('Usuario actual:', this.usuarioActual);
        console.log('Es administrador uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu:', this.esAdministrador);
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
    const estadoEncontrado = this.estadosDisponibles.find(
      (e) => e.valor === estado
    );
    return estadoEncontrado?.clase || 'badge-secondary';
  }

  // ✅ NUEVO: Verificar permisos para editar
  puedeEditarHoraExtra(horaExtra: HoraExtra): boolean {
    if (!this.esAdministrador) {
      return (
        horaExtra.usuarioE === this.usuarioActual?.id &&
        horaExtra.estado === 'PENDIENTE'
      );
    }
    return true;
  }

  // ✅ MÉTODO CRÍTICO CORREGIDO: Actualización inmediata del estado
  cambiarEstadoHoraExtra(horaExtra: HoraExtra, nuevoEstado: string): void {
    if (!this.esAdministrador) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin permisos',
        text: 'Solo los administradores pueden cambiar el estado',
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar cambio?',
      text: `¿Cambiar estado a ${nuevoEstado}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ SOLUCIÓN 1: Actualización optimista (inmediata en la UI)
        const indice = this.horasExtras.findIndex(
          (h) => h.idHoraExtra === horaExtra.idHoraExtra
        );
        if (
          indice !== -1 &&
          (nuevoEstado === 'PENDIENTE' ||
            nuevoEstado === 'APROBADA' ||
            nuevoEstado === 'RECHAZADA')
        ) {
          this.horasExtras[indice].estado = nuevoEstado as
            | 'PENDIENTE'
            | 'APROBADA'
            | 'RECHAZADA';
          this.dataSource.data = [...this.horasExtras]; // Forzar actualización
        }

        this.registroHoraService
          .cambiarEstadoHoraExtra(horaExtra.idHoraExtra, nuevoEstado)
          .subscribe({
            next: (response) => {
              console.log('Respuesta del backend:', response);
              Swal.fire(
                'Actualizado',
                `Estado cambiado a ${nuevoEstado}`,
                'success'
              );

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
            },
          });
      }
    });
  }

  // ✅ MÉTODO PARA LIMPIAR FILTROS
  limpiarFiltros(): void {
    this.filtrosForm.patchValue({
      fechaDesde: '',
      fechaHasta: '',
      estados: [],
    });
    this.dataSource.data = [...this.datosOriginales];
  }
  // ✅ NUEVO: Toggle para "Todos los estados"
  toggleTodosLosEstados(): void {
    const estadosActuales = this.filtrosForm.get('estados')?.value || [];

    if (this.isAllSelected()) {
      // Si todos están seleccionados, deseleccionar todos
      this.filtrosForm.patchValue({ estados: [] });
    } else {
      // Si no todos están seleccionados, seleccionar todos
      const todosLosEstados = this.estadosDisponibles.map(
        (estado) => estado.valor
      );
      this.filtrosForm.patchValue({ estados: todosLosEstados });
    }
  }

  toggleIndividualEstado(): void {
    // Remover "todos" si existe cuando se selecciona uno individual
    const estadosActuales = this.filtrosForm.get('estados')?.value || [];
    const estadosSinTodos = estadosActuales.filter(
      (estado: string) => estado !== 'todos'
    );

    // Actualizar el FormControl sin "todos"
    setTimeout(() => {
      this.filtrosForm.patchValue({ estados: estadosSinTodos });
    }, 0);
  }

  ///BAJAR EXCEL

  exportarAExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Horas Extra');

    // Encabezados
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Ingeniero', key: 'ingeniero', width: 25 },
      { header: 'Turno', key: 'turno', width: 10 },
      { header: 'Hora Inicio', key: 'horaInicio', width: 12 },
      { header: 'Hora Fin', key: 'horaFin', width: 12 },
      { header: 'Tipo de Hora', key: 'tipoHora', width: 20 },
      { header: 'Tiempo', key: 'tiempo', width: 10 },

      { header: 'Ticket', key: 'ticket', width: 15 },

      { header: 'Estado', key: 'estado', width: 15 },
    ];

    // ✅ CORRECCIÓN PRINCIPAL: Obtener datos correctamente
    const data =
      this.dataSource.filteredData && this.dataSource.filteredData.length > 0
        ? this.dataSource.filteredData
        : this.dataSource.data;

    console.log('Datos para exportar:', data); // Para debugging

    // ✅ CORRECCIÓN: Verificar que hay datos antes de procesarlos
    if (!data || data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar.',
      });
      return;
    }

    // ✅ CORRECCIÓN: Mapear datos según tu interfaz HoraExtra
    data.forEach((row: HoraExtra) => {
      worksheet.addRow({
        fecha: row.fecha
          ? new Date(row.fecha).toLocaleDateString('es-ES')
          : 'N/A',
        ingeniero: row.usuario?.fullname || 'N/A',
        turno: row.usuarioTurno?.turno?.codigo || 'N/A',
        horaInicio: row.horaInicio || 'N/A',
        horaFin: row.horaFin || 'N/A',
        tipoHora: row.tipoHora || 'No asignado',
        tiempo: row.tiempo || '0:00',

        ticket: row.ticket || 'N/A',
        estado: row.estado || 'PENDIENTE',
      });
    });

    // ✅ MEJORA: Estilos para el encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };

    // ✅ MEJORA: Autoajustar el ancho de las columnas
    worksheet.columns.forEach((column) => {
      if (column.key) {
        const maxLength = Math.max(
          column.header?.length || 0,
          ...data.map((row) => {
            const value = row[column.key as keyof HoraExtra];
            return String(value || '').length;
          })
        );
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });

    // ✅ CORRECCIÓN: Mejor manejo de errores en la generación
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const fechaActual = new Date().toISOString().slice(0, 10);
        const nombreArchivo = `Horas_Extras_${fechaActual}.xlsx`;

        FileSaver.saveAs(blob, nombreArchivo);

        // ✅ CONFIRMACIÓN AL USUARIO
        Swal.fire({
          icon: 'success',
          title: 'Descarga exitosa',
          text: `Se descargó el archivo: ${nombreArchivo}`,
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error('Error al generar Excel:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el archivo Excel',
        });
      });
  }

  // Agregar este nuevo método para manejar los cambios en los toggles
  onToggleChange(controlName: 'esFestivo' | 'esDomingo', event: any): void {
    this.registroHoraForm.patchValue({
      [controlName]: event.checked
    });
    console.log(`${controlName} changed to:`, event.checked);
  }
}
