import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AxiosService } from '../axios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface Turno {
  id?: number;
  nombre: string;
  codigo: string;
  diaInicio: string;
  horaInicio: string;
  diaFin: string;
  horaFin: string;
}


@Component({
  selector: 'app-maestro-turno',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './maestro-turno.component.html',
  styleUrl: './maestro-turno.component.css'
})
export class MaestroTurnoComponent implements OnInit{
  turnoForm!: FormGroup;
  turnos: Turno[] = [];
  editandoTurno: boolean = false;
  turnoEditId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private axiosService: AxiosService,
    private router: Router
  ) {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.turnoForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      diaInicio: ['', Validators.required],
      horaInicio: ['', [Validators.required]],
      diaFin: ['', Validators.required],
       horaFin: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  async cargarTurnos() {
    try {
      const response = await this.axiosService.get('/turno');
      this.turnos = response.data;
    } catch (error) {
      this.mostrarError('No se pudieron cargar los turnos');
    }
  }

  // Método para crear un nuevo turno
  async crearTurno(): Promise<void> {

    
    console.log("Datos antes de enviarhhhhhhhhhhhhhhhhhhh:", this.turnoForm.value);

    if (!this.turnoForm.valid) {
      this.markFormGroupTouched(this.turnoForm);
      return;
    }

    const turnoData = {
      ...this.turnoForm.value,
    };

    if (turnoData.horaInicio) {
      const [horas, minutos] = turnoData.horaInicio.split(':');
      const horaInicio = new Date();
      horaInicio.setHours(parseInt(horas), parseInt(minutos), 0);
      turnoData.horaInicio = horaInicio.toISOString();
    }
    
    if (turnoData.horaFin) {
      const [horas, minutos] = turnoData.horaFin.split(':');
      const horaFin = new Date();
      horaFin.setHours(parseInt(horas), parseInt(minutos), 0);
      turnoData.horaFin = horaFin.toISOString();
    }
    try {
      console.log("TRYYYYYYYYYY:", turnoData);

      const response = await this.axiosService.post('/turno', turnoData);
      this.mostrarExito('Turno creado correctamente');
      this.resetForm();
      this.cargarTurnos();
    } catch (error) {
      console.log("TRYYYYYYYYYY:", turnoData);

      console.error('Error al crear turno:', error);
      this.mostrarError('No se pudo crear el turno');
      console.log("Datos antes de enviarjjjjjjjjjjj:",...this.turnoForm.value);

    }
  }

  // Método para actualizar un turno existente
  async actualizarTurno(): Promise<void> {
    if (!this.turnoForm.valid || this.turnoEditId === null) {
      this.markFormGroupTouched(this.turnoForm);
      return;
    }

    const turnoData = this.turnoForm.value;

    try {
      const response = await this.axiosService.put(`/turno/${this.turnoEditId}`, turnoData);
      this.mostrarExito('Turno actualizado correctamente');
      this.resetForm();
      this.cargarTurnos();
    } catch (error) {
      this.mostrarError('No se pudo actualizar el turno');
    }
  }


  onSubmit(): void {
    if (this.editandoTurno) {
      this.actualizarTurno();
    } else {
      this.crearTurno();
    }
  }

  editarTurno(turno: Turno): void {
    if (!turno || turno.id === undefined) {
      console.error('Turno inválido o sin ID');
      return;
    }

    this.turnoForm.patchValue({
      nombre: turno.nombre || '',
      codigo: turno.codigo || '',
      diaInicio: turno.diaInicio || '',
      horaInicio: turno.horaInicio || '',
      diaFin: turno.diaFin || '',
      horaFin: turno.horaFin || ''
    });

    this.editandoTurno = true;
    this.turnoEditId = turno.id;

    console.log('Editando turno:', turno);
    console.log('ID del turno en edición:', this.turnoEditId);
  }

  async eliminarTurno(id: number): Promise<void> {
    if (id === undefined || id === null) {
      console.error('ID de turno inválido');
      return;
    }

    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await this.axiosService.delete(`/turno/${id}`);
        this.mostrarExito('El turno ha sido eliminado correctamente');
        this.cargarTurnos();
      }
    } catch (error) {
      console.error('Error al eliminar turno:', error);
      this.mostrarError('No se pudo eliminar el turno');
    }
  }

  cancelarEdicion(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.turnoForm.reset();
    this.editandoTurno = false;
    this.turnoEditId = null;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Métodos para mostrar notificaciones
  private mostrarExito(mensaje: string): void {
    Swal.fire({
      title: 'Éxito',
      text: mensaje,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  }

  private mostrarError(mensaje: string): void {
    Swal.fire({
      title: 'Error',
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }

  forgotSecurityAnswer(): void {
    Swal.fire({
      title: '¿Olvidaste tu respuesta de seguridad?',
      text: 'Por favor comunícate con el administrador del sistema para restablecer tu cuenta',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }
 
  get fullnameInvalid() {
    const control = this.turnoForm.get('nombre');
    return control?.invalid && control?.touched;
  }

  get codigoInvalid() {
    const control = this.turnoForm.get('codigo');
    return control?.invalid && control?.touched;
  }

  get horaInicioInvalid() {
    const control = this.turnoForm.get('horaInicio');
    return control?.invalid && control?.touched;
  }

  get horaFinInvalid() {
    const control = this.turnoForm.get('horaFin');
    return control?.invalid && control?.touched;
  }

  get diaInicioInvalid() {
    const control = this.turnoForm.get('diaInicio');
    return control?.invalid && control?.touched;
  }

  get diaFinInvalid() {
    const control = this.turnoForm.get('diaFin');
    return control?.invalid && control?.touched;
  }
}
