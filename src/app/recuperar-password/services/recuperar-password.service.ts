import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecuperarPasswordService {

  constructor(  private http:HttpClient) { }

  getByCedula(cedula:string){
    return this.http.get(`${environment.url}user/security-question/cedula=${cedula}`)
  }

  updatePassword(data:any){
    return this.http.patch(`${environment.url}user/update-password`,data)
  }

  recuperarPassword(data: any) {
    return this.http.post(`${environment.url}user/recover`, data);
  }

}
