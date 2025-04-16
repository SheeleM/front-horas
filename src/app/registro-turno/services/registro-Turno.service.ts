import { CreateUsuarioTurnoDto, RegistroTurnoComponent } from './../registro-turno.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Ingeniero } from '../registro-turno.component';

@Injectable({
  providedIn: 'root'
})
export class RegistroTurnoService {

  constructor(  private http:HttpClient) { }

  getAllTurno(){
    return this.http.post(`${environment.url}turno/codigo`,{})
  }

  getAllUsuarios(){
   /// return this.http.post(`${environment.url}user/fullname`,{})
   return this.http.post<Ingeniero[]>(`${environment.url}user/fullname`, {});

  }

  CreatedUsuarioTurno(){
    /// return this.http.post(`${environment.url}user/fullname`,{})
    return this.http.post<Ingeniero[]>(`${environment.url}usuario-turno`, {});
 
   }

   crearUsuarioTurno(dto: CreateUsuarioTurnoDto) {
    return this.http.post(`${environment.url}usuario-turno`, dto);
  }

  
}