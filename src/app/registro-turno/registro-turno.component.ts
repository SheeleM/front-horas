import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup,ReactiveFormsModule } from '@angular/forms';
import { AxiosService } from '../axios.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipInput, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-registro-turno',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,MatFormFieldModule,MatChipsModule,MatAutocompleteModule],
  templateUrl: './registro-turno.component.html',
  styleUrl: './registro-turno.component.css'
})
export class RegistroTurnoComponent implements OnInit {
  AsignacionTurnoForm!: FormGroup;
  selectedIngenieros: string[] = [];
  ingenieroCtrl = new FormControl('');
  ingenieros: string[] = ['Sulay Gisela', 'Duvan', 'Nakari', 'Camilo', 'Andrea'];
  filteredIngenieros: Observable<string[]>;
  
  @ViewChild('ingenieroInput') ingenieroInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder) {
    this.AsignacionTurnoForm = this.fb.group({
      month: ['']
    });
    
    this.filteredIngenieros = this.ingenieroCtrl.valueChanges.pipe(
      startWith(null),
      map((ingeniero: string | null) => {
        if (!ingeniero) {
          return this.ingenieros.filter(ing => !this.selectedIngenieros.includes(ing));
        }
        const filterValue = ingeniero.toLowerCase();
        return this.ingenieros.filter(ing => 
          ing.toLowerCase().includes(filterValue) && 
          !this.selectedIngenieros.includes(ing)
        );
      })
    );
  }

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  remove(ingeniero: string): void {
    const index = this.selectedIngenieros.indexOf(ingeniero);
    if (index >= 0) {
      this.selectedIngenieros.splice(index, 1);
      // Actualizar filtro después de remover
      this.ingenieroCtrl.updateValueAndValidity();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.selectedIngenieros.includes(value)) {
      this.selectedIngenieros.push(value);
    }
    // Limpiar input después de selección
    this.ingenieroInput.nativeElement.value = '';
    this.ingenieroCtrl.setValue(null);
  }
}
