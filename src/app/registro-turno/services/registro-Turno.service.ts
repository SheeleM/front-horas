import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroTurnoService {

  constructor(  private http:HttpClient) { }

  getAllTurno(){
    return this.http.post(`${environment.url}turno/codigo`,{})
  }
}