import { MatTableModule } from '@angular/material/table';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, map, startWith } from 'rxjs';
import { RegistroTurnoService } from './services/registro-Turno.service';

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
    MatTableModule
  ],
  templateUrl: './registro-turno.component.html',
  styleUrls: ['./registro-turno.component.css']
})
export class RegistroTurnoComponent implements OnInit {
  AsignacionTurnoForm!: FormGroup;
  ingenieroCtrl = new FormControl('');
  fechaSeleccionada = new FormControl();
  selectedIngenieros: string[] = [];
  ingenieros: string[] = ['Sulay Gisela', 'Duvan', 'Nakari', 'Carlos Quiros'];
  filteredIngenieros!: Observable<string[]>;
  editandoTurno: boolean = false;

  codigo:any[] = [];

  @ViewChild('ingenieroInput') ingenieroInput!: ElementRef<HTMLInputElement>;
  @ViewChild('picker') datepicker!: MatDatepicker<Date>;

  constructor(private fb: FormBuilder, private registroTurnoService:RegistroTurnoService) {
    this.registroTurnoService.getAllTurno().subscribe((data:any)=>{
      this.codigo = data
      console.log('data--->',data);
    })
  }

  ngOnInit(): void {
    this.AsignacionTurnoForm = this.fb.group({
      mes: [''],
      fechaInicio: [''],
      fechaFin: [''],
      turno: [''],
      periodo: ['']
    });

    this.filteredIngenieros = this.ingenieroCtrl.valueChanges.pipe(
      startWith(null),
      map((name: string | null) =>
        name ? this._filter(name) : this.ingenieros.filter(i => !this.selectedIngenieros.includes(i))
      )
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.ingenieros.filter(ing =>
      ing.toLowerCase().includes(filterValue) && !this.selectedIngenieros.includes(ing)
    );
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.selectedIngenieros.includes(value)) {
      this.selectedIngenieros.push(value);
    }
    this.ingenieroInput.nativeElement.value = '';
    this.ingenieroCtrl.setValue(null);
  }

  remove(ingeniero: string): void {
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
     // this.actualizarTurno();
    } else {
     // this.crearTurno();
    }
  }


}
