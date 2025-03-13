import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AxiosService } from '../axios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  turnoForm: FormGroup;
  turnos: Turno[] = [];

  constructor(
    private fb: FormBuilder,
    private axiosService: AxiosService,
    private router: Router
    // private turnosService: TurnosService
  ) {
    this.turnoForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      diaInicio: ['', Validators.required],
      horaInicio: ['', Validators.required],
      diaFin: ['', Validators.required],
      horaFin: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // this.cargarTurnos();
  }

  // async cargarTurnos(): void {
  //   this.turnosService.getTurnos().subscribe(data => {
  //     this.turnos = data;
  //   });
  // }

  agregarTurno(): void {
    if (this.turnoForm.valid) {
      const nuevoTurno: Turno = this.turnoForm.value;
      // this.turnosService.createTurno(nuevoTurno).subscribe(() => {
      //   this.cargarTurnos();
      //   this.turnoForm.reset();
      // });
    }
  }

  editarTurno(turno: Turno): void {
    this.turnoForm.setValue({
      nombre: turno.nombre,
      codigo: turno.codigo,
      diaInicio: turno.diaInicio,
      horaInicio: turno.horaInicio,
      diaFin: turno.diaFin,
      horaFin: turno.horaFin
    });
    console.log('Editar turno', turno);
  }

  eliminarTurno(id: number): void {
    // this.turnosService.deleteTurno(id).subscribe(() => {
    //   this.cargarTurnos();
    // });
  }

  // Getters for form validation
  get fullnameInvalid() {
    const control = this.turnoForm.get('nombre');
    return control?.invalid && control?.touched;
  }
}
