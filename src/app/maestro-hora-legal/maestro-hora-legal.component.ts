import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MaestroHoraExtraLegalService } from './services/maestroLegal.service';
import Swal from 'sweetalert2';

export interface MaestroHoraLegal {
  id: number;
  codigoHoraExtra: string;
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  horaInicio2: string;
  horaFin2: string;
  domingo?: boolean;
  festivo?: boolean;
}

export interface GetMaestroHoraLegal {
  id: number;
  codigoHoraExtra: string;
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  horaInicio2: string;
  horaFin2: string;
}

@Component({
  selector: 'app-maestro-hora-legal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './maestro-hora-legal.component.html',
  styleUrl: './maestro-hora-legal.component.css'
})
export class MaestroHoraLegalComponent implements OnInit {
  editandoTurno: boolean = false;
  editandoId: number | null = null;
  horaLegalForm!: FormGroup;
  maestroLista: GetMaestroHoraLegal[] = [];
  dataSource = new MatTableDataSource<GetMaestroHoraLegal>([]);

  displayedColumns: string[] = [
    'codigoHoraExtra',
    'descripcion',
    'horaInicio',
    'horaFin',
    'horaInicio2',
    'horaFin2',
    'esDomingo',
    'esFestivo',
    'acciones'
  ];

  constructor(private maestroHoraLegalService: MaestroHoraExtraLegalService) {
    this.horaLegalForm = new FormGroup({
      codigoHoraExtra: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', [Validators.required]),
      horaInicio: new FormControl('', [Validators.required]),
      horaFin: new FormControl('', [Validators.required]),
      horaInicio2: new FormControl(''),
      horaFin2: new FormControl(''),
      esFestivo:new FormControl(false),
      esDomingo: new FormControl(false)
    });

    // Suscribirse a los cambios del formulario
    this.horaLegalForm.valueChanges.subscribe(() => {
      this.horaLegalForm.markAllAsTouched();
    });
  }

  ngOnInit(): void {
    this.listarHorasLegales();
    console.log('Componente inicializado'); // Debug
  }

  // Actualiza el método listarHorasLegales para asegurarse de que los datos se mapeen correctamente
  listarHorasLegales(): void {
    this.maestroHoraLegalService.ListarHorasLegal().subscribe({
      next: (data: any) => {
        console.log('Datos recibidos del backend:', data);
        
        // Transformar los datos antes de asignarlos
        const transformedData = Array.isArray(data) ? data : (data?.data || []);
        
        // Asegurar que cada registro tenga todas las propiedades necesarias
        this.dataSource.data = transformedData.map((item: any) => ({
          ...item,
          horaInicio: this.extraerHora(item.horaInicio),
          horaFin: this.extraerHora(item.horaFin),
          horaInicio2: this.extraerHora(item.horaInicio2),
          horaFin2: this.extraerHora(item.horaFin2),
          festivo: !!item.festivo,
          domingo: !!item.domingo
        }));

        console.log('Datos procesados:', this.dataSource.data);
      },
      error: (err) => {
        console.error('Error al listar horas legales:', err);
        this.dataSource.data = [];
      }
    });
  }

  private extraerHora(valor: string): string {
    if (!valor) return '';
    // Si el valor es tipo "2025-12-27T14:00:00", extrae "14:00"
    if (valor.includes('T')) {
      return valor.split('T')[1]?.substring(0, 5) || '';
    }
    // Si el valor ya tiene segundos (HH:mm:ss), quítalos
    if (valor.length === 8) {
      return valor.substring(0, 5);
    }
    return valor;
  }
  
  onSubmit(): void {
    if (this.horaLegalForm.valid) {
      const formValue = this.horaLegalForm.value;
      
      const formatHora = (hora: string) => {
        if (!hora) return null;
        // Asegurarse de que solo devuelva HH:mm
        return hora.substring(0, 5);
      };

      const datos = {
        codigoHoraExtra: formValue.codigoHoraExtra,
        descripcion: formValue.descripcion,
        horaInicio: formatHora(formValue.horaInicio),
        horaFin: formatHora(formValue.horaFin),
        horaInicio2: formatHora(formValue.horaInicio2),
        horaFin2: formatHora(formValue.horaFin2),
        esFestivo: !!formValue.esFestivo,
        esDomingo: !!formValue.esDomingo
      };

      console.log('Datos a enviar:', datos);

      if (this.editandoTurno && this.editandoId) {
        // Actualizar registro existente
        this.maestroHoraLegalService.actualizarMaestroHoraLegal(this.editandoId, datos)
          .subscribe({
            next: (response) => {
              console.log('Respuesta de actualización:', response);
              Swal.fire({
                icon: 'success',
                title: '¡Actualización exitosa!',
                text: 'El tipo de hora legal fue actualizado correctamente.',
                confirmButtonColor: '#3085d6'
              });
              this.listarHorasLegales();
              this.horaLegalForm.reset();
              this.editandoTurno = false;
              this.editandoId = null;
            },
            error: (error) => {
              console.error('Error al actualizar:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.error?.message || 'No se pudo actualizar el tipo de hora legal.',
                confirmButtonColor: '#dc3545'
              });
            }
          });
      } else {
        // Crear nuevo registro
        this.maestroHoraLegalService.crearMaestroHoraLegal(datos)
          .subscribe({
            next: (response) => {
              console.log('Respuesta de creación:', response);
              Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'El tipo de hora legal fue registrado correctamente.',
                confirmButtonColor: '#3085d6'
              });
              this.listarHorasLegales();
              this.horaLegalForm.reset();
            },
            error: (error) => {
              console.error('Error al crear:', error);
              let errorMessage = 'No se pudo registrar el tipo de hora legal.';
              
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#dc3545'
              });
            }
          });
      }
    } else {
      this.horaLegalForm.markAllAsTouched();
      setTimeout(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obligatorios',
          text: 'Por favor, completa todos los campos requeridos.',
          confirmButtonColor: '#fbc02d'
        });
      }, 0);
    }
  }

  editarHoraExtra(element: any) {
    this.editandoTurno = true;
    this.editandoId = element.id;
    
    // Actualizar el formulario con los datos existentes
    this.horaLegalForm.patchValue({
      codigoHoraExtra: element.codigoHoraExtra,
      descripcion: element.descripcion,
      horaInicio: this.extraerHora(element.horaInicio),
      horaFin: this.extraerHora(element.horaFin),
      horaInicio2: this.extraerHora(element.horaInicio2),
      horaFin2: this.extraerHora(element.horaFin2),
      esFestivo: !!element.esFestivo,
      esDomingo: !!element.esDomingo
    });

    // Marcar los campos como "touched" para activar las validaciones
    Object.keys(this.horaLegalForm.controls).forEach(key => {
      const control = this.horaLegalForm.get(key);
      control?.markAsTouched();
    });
  }

  cancelarEdicion() {
    this.editandoTurno = false;
    this.editandoId = null;
    this.horaLegalForm.reset();
  }

  eliminarHoraExtra(element: any) {
    // Confirma antes de eliminar
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro de tipo de hora legal.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        const id = element.id;
        if (!id) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar el registro a eliminar.',
            confirmButtonColor: '#dc3545'
          });
          return;
        }
        
        this.maestroHoraLegalService.deleteMaestroHoraLegal(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El tipo de hora legal fue eliminado correctamente.',
              confirmButtonColor: '#3085d6'
            });
            this.listarHorasLegales(); // Actualiza la tabla automáticamente
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el tipo de hora legal.',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  // Getters para validaciones
  get codHoraLegal() {
    const control = this.horaLegalForm.get('codigoHoraExtra');
    return control?.invalid && control?.touched;
  }

  get descripcionInvalid() {
    const control = this.horaLegalForm.get('descripcion');
    return control?.invalid && control?.touched;
  }

  get horaInicioInvalid() {
    const control = this.horaLegalForm.get('horaInicio');
    return control?.invalid && control?.touched;
  }

  get horaFinInvalid() {
    const control = this.horaLegalForm.get('horaFin');
    return control?.invalid && control?.touched;
  }

  get horaInicio2Invalid() {
    const control = this.horaLegalForm.get('horaInicio2');
    return control?.invalid && control?.touched;
  }

  get horaFin2Invalid() {
    const control = this.horaLegalForm.get('horaFin2');
    return control?.invalid && control?.touched;
  }
}