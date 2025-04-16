import { MatTableModule } from '@angular/material/table';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, map, startWith } from 'rxjs';
import { RegistroTurnoService } from './services/registro-Turno.service';
import Swal from 'sweetalert2';

export interface Ingeniero {
  fullname: string;
  id: number;
}

export interface CreateUsuarioTurnoDto {
  mes:string;
  turnoFK: number;
  usuarioFK: number;
  fechaInicio: Date;
  fechaFin: Date;
}

@Component({
  selector: 'app-registro-turno',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './registro-turno.component.html',
  styleUrls: ['./registro-turno.component.css'],
})


export class RegistroTurnoComponent implements OnInit {
  turnosPaginados = [
    {
      idTurno: 1,
      nombre: 'Carlos Pérez',
      fechaInicio: '2025-04-01',
      fechaFin: '2025-04-07',
      turno: 'Turno A',
      dias: 'Lunes a Viernes',
    },
    {
      idTurno: 2,
      nombre: 'Ana Martínez',
      fechaInicio: '2025-04-08',
      fechaFin: '2025-04-14',
      turno: 'Turno B',
      dias: 'Martes a Sábado',
    },
    {
      idTurno: 3,
      nombre: 'Luis Gómez',
      fechaInicio: '2025-04-15',
      fechaFin: '2025-04-21',
      turno: 'Turno C',
      dias: 'Miércoles a Domingo',
    },
  ];

  trackByTurno(index: number, item: any) {
    return item.idTurno;
  }

  AsignacionTurnoForm!: FormGroup;
  fechaSeleccionada = new FormControl();
  editandoTurno: boolean = false;
  codigo: any[] = [];
  idturno: any[] = [];
  id: any[] = [];
  selectedIngenieros: Ingeniero[] = []; // guarda el objeto completo o solo los IDs si prefieres




  Ingenieros: Ingeniero[] = []; // Cambiado a any[] para almacenar los datos del servicio
  ingenieroCtrl = new FormControl<string | Ingeniero>('');
  filteredIngenieros!: Observable<Ingeniero[]>;

  @ViewChild('ingenieroInput') ingenieroInput!: ElementRef<HTMLInputElement>;
  @ViewChild('picker') datepicker!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private registroTurnoService: RegistroTurnoService
  ) {
    this.registroTurnoService.getAllTurno().subscribe((data: any) => {
      this.codigo = data;
      console.log('data--->', data);
    });

    this.registroTurnoService
      .getAllUsuarios()
      .subscribe((data: Ingeniero[]) => {
        this.Ingenieros = data;
        console.log('dataEnginerio--->', data);

        this.filteredIngenieros = this.ingenieroCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const nombre =
              typeof value === 'string' ? value : value?.fullname ?? '';
            return this.Ingenieros.filter((i: Ingeniero) =>
              i.fullname.toLowerCase().includes(nombre.toLowerCase())
            );
          })
        );
      });
  }

  inicializarFormulario(): void {
    this.AsignacionTurnoForm = this.fb.group({
      mes: ['', Validators.required],
      turno: ['', Validators.required],
      ingenierosAsignados: [[], Validators.required], // 👈 Este es nuevo
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required]
        });
  }

  ngOnInit(): void {
    this.AsignacionTurnoForm = this.fb.group({
      mes: [''],
      fechaInicio: [''],
      fechaFin: [''],
      turno: [''],
      periodo: [''],
    });
  }

  private _filter(value: string): Ingeniero[] {
    const filterValue = value.toLowerCase();
    return this.Ingenieros.filter(
      (ing) =>
        ing.fullname.toLowerCase().includes(filterValue) &&
      //  !this.selectedIngenieros.includes(ing.fullname)
      !this.selectedIngenieros.some(sel => sel.id ===ing.id)
    );
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    //const value = event.option.viewValue;
    const selectedIng: Ingeniero = event.option.value; // Recibimos el objeto completo

    if (!this.selectedIngenieros.some(ing =>ing.id === selectedIng.id)) {
      this.selectedIngenieros.push(selectedIng);
    }
    this.ingenieroInput.nativeElement.value = '';
    this.ingenieroCtrl.setValue(null);
  }

  remove(ingeniero: Ingeniero): void {
    const index = this.selectedIngenieros.indexOf(ingeniero);
    if (index >= 0) {
      this.selectedIngenieros.splice(index, 1);
    }
  }

  agregar(): void {
    console.log('Ingenieros:', this.selectedIngenieros);
    console.log('Form data:', this.AsignacionTurnoForm.value);
  }
  onSubmit(): void {
    if (this.editandoTurno) {
     //  this.actualizarTurnoUsuario();
    } else {
    this.guardarTurno();
    console.log("entro al guardar turno")
    }
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
  resetForm(): void {
    this.AsignacionTurnoForm.reset();
    //this.editandoTurno = false;
    //this.turnoEditId = null;
  }

  guardarTurno() {
    try {
      // Verificar que haya ingenieros seleccionados
      if (this.selectedIngenieros.length === 0) {
        console.error("No hay ingenieros seleccionados");
        Swal.fire({
          title: 'Error',
          text: 'Debes seleccionar al menos un ingeniero',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
  
      // Verificar que los campos obligatorios estén completos
      if (this.AsignacionTurnoForm.invalid) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor completa todos los campos requeridos',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
  
      // Obtener los valores comunes del formulario
      const mes = this.AsignacionTurnoForm.value.mes;
      const turnoFK = this.AsignacionTurnoForm.value.turno;
      const fechaInicio = this.AsignacionTurnoForm.value.fechaInicio;
      const fechaFin = this.AsignacionTurnoForm.value.fechaFin;
  
      // Contador para rastrear las operaciones completadas
      let completedOperations = 0;
      let erroredOperations = 0;
      const totalOperations = this.selectedIngenieros.length;
  
      // Para cada ingeniero seleccionado, crear un registro de turno
      this.selectedIngenieros.forEach(ingeniero => {
        const nuevoTurno: CreateUsuarioTurnoDto = {
          mes: mes,
          turnoFK: turnoFK,
          usuarioFK: ingeniero.id, // Usar el ID del ingeniero actual
          fechaInicio: fechaInicio,
          fechaFin: fechaFin
        };
        
        console.log('Creando turno para:', ingeniero.fullname, 'con ID:', ingeniero.id);
        
        this.registroTurnoService.crearUsuarioTurno(nuevoTurno).subscribe({
          next: (res) => {
            console.log(`Turno creado para ${ingeniero.fullname}:`, res);
            completedOperations++;
            
            // Verificar si todas las operaciones se han completado
            if (completedOperations + erroredOperations === totalOperations) {
              if (erroredOperations === 0) {
                // Todos los turnos se crearon con éxito
                this.mostrarExito(`Se han guardado exitosamente ${completedOperations} turnos`);
                this.resetForm();
                this.selectedIngenieros = [];
              } else {
                // Algunos turnos fallaron
                Swal.fire({
                  title: 'Parcialmente completado',
                  text: `Se han guardado ${completedOperations} turnos, pero fallaron ${erroredOperations}`,
                  icon: 'warning',
                  confirmButtonText: 'Aceptar'
                });
              }
            }
          },
          error: (err) => {
            console.error(`Error al crear turno para ${ingeniero.fullname}:`, err);
            erroredOperations++;
            
            // Verificar si todas las operaciones se han completado o fallado
            if (completedOperations + erroredOperations === totalOperations) {
              if (erroredOperations === totalOperations) {
                // Todos los turnos fallaron
                Swal.fire({
                  title: 'Error',
                  text: 'No se pudo guardar ningún turno',
                  icon: 'error',
                  confirmButtonText: 'Aceptar'
                });
              } else {
                // Algunos turnos fallaron
                Swal.fire({
                  title: 'Parcialmente completado',
                  text: `Se han guardado ${completedOperations} turnos, pero fallaron ${erroredOperations}`,
                  icon: 'warning',
                  confirmButtonText: 'Aceptar'
                });
              }
            }
          }
        });
      });
    } catch (error) {
      console.error('Error inesperado al guardar turnos:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error inesperado al guardar los turnos',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}

