import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lregistroHoraService } from './services/registroHora.service';
import Swal from 'sweetalert2';

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
    MatNativeDateModule
  ],
  templateUrl: './registro-horas.component.html',
  styleUrl: './registro-horas.component.css'
})
export class RegistroHorasComponent {
  registroHoraForm!: FormGroup;
  editandoTurno: boolean = false;
  constructor(private registroHoraService: lregistroHoraService){
    this.registroHoraForm = new FormGroup({
      ticket: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      horaInicio: new FormControl('', [Validators.required]),
      horaFin: new FormControl('', [Validators.required])
      // Eliminados diaInicio y diaFin porque no existen en el HTML
    });
  }

  onSubmit(): void {
    if (this.registroHoraForm.invalid) {
      this.registroHoraForm.markAllAsTouched();
      return;
    }
    const data = this.registroHoraForm.value;
    // No agregar userId, el backend lo toma de la sesión o JWT
    this.registroHoraService.crearHoraExtra(data).subscribe({
      next: (res) => {
        this.registroHoraForm.reset();
        Swal.fire({
          icon: 'success',
          title: 'Hora extra registrada',
          text: 'La hora extra se registró correctamente.'
        });
        // Opcional: recargar la tabla de horas extras
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
}
