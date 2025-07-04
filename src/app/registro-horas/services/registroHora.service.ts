import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltrosHorasExtra } from '../registro-horas.component';

// Interface para las horas extra
interface HoraExtra {
  idHoraExtra: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ticket: string;
  cantidadHoras: number;
  tipoDeHora: string;
  fechaCreacion: string;
  estado?: string;
}

// Interface para crear hora extra
interface CreateHoraExtraDto {
  ticket: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}


// Update the interface to match the backend DTO
export interface UpdateHoraExtraDto {
  idUsuarioTurno: number;
  fecha?: string;
  ticket?: string;
  horaInicio?: string;
  horaFin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class lregistroHoraService {

  private readonly apiUrl = `${environment.url}horas-extras`;

  constructor(private http: HttpClient) { }

  /**
   * Crea una nueva hora extra
   * @param data Datos de la hora extra a crear
   * @returns Observable con la respuesta del servidor
   */
  crearHoraExtra(data: CreateHoraExtraDto): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Obtiene todas las horas extra del usuario autenticado
   * @returns Observable con el array de horas extra
   *//*
  obtenerHorasExtras(): Observable<HoraExtra[]> {
    return this.http.get<HoraExtra[]>(this.apiUrl);
  }*/
// 3. ACTUALIZAR EL SERVICIO obtenerHorasExtras()
obtenerHorasExtras(filtros: FiltrosHorasExtra): Observable<HoraExtra[]> {
  let params = new HttpParams()
    .set('fechaDesde', filtros.fechaDesde)
    .set('fechaHasta', filtros.fechaHasta);

  // Convert array of states to comma-separated string
  if (filtros.estado && filtros.estado.length > 0) {
    params = params.set('estados', filtros.estado.join(','));
  }


  return this.http.get<HoraExtra[]>(this.apiUrl, { params });
}
  /**
   * Obtiene una hora extra específica por ID
   * @param id ID de la hora extra
   * @returns Observable con la hora extra
   */
  obtenerHoraExtraPorId(id: number): Observable<HoraExtra> {
    return this.http.get<HoraExtra>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza una hora extra existente
   * @param id ID de la hora extra a actualizar
   * @param data Datos actualizados
   * @returns Observable con la respuesta del servidor
   
  actualizarHoraExtra(id: number, data: Partial<CreateHoraExtraDto>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

*/

  actualizarHoraExtra(id: number, data: UpdateHoraExtraDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Elimina una hora extra
   * @param id ID de la hora extra a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarHoraExtra(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene horas extra filtradas por fecha
   * @param fechaInicio Fecha de inicio del filtro
   * @param fechaFin Fecha de fin del filtro
   * @returns Observable con el array de horas extra filtradas
   */
  obtenerHorasExtrasPorFecha(fechaInicio: string, fechaFin: string): Observable<HoraExtra[]> {
    return this.http.get<HoraExtra[]>(`${this.apiUrl}fecha`, {
      params: {
        fechaInicio,
        fechaFin
      }
    });
  }

    // ✅ NUEVO: Método para cambiar estado de hora extra
  cambiarEstadoHoraExtra(idHoraExtra: number, nuevoEstado: string): Observable<any> {
    const url = `${this.apiUrl}/${idHoraExtra}/estado`;
    return this.http.patch(url, { estado: nuevoEstado });
  }

    // ✅ UTILITY: Método estático para obtener datos del usuario desde localStorage
  static obtenerUsuarioActual(): any {
    try {
      return JSON.parse(localStorage.getItem('users') || '{}');
    } catch (error) {
      console.error('Error al obtener usuario desde localStorage:', error);
      return {};
    }
  }

    // ✅ UTILITY: Método estático para verificar si es administrador
  static esAdministrador(): boolean {
    const usuario = this.obtenerUsuarioActual();
    const rolesAdmin = ['ADMINISTRADOR', 'ADMIN', 'administrador', 'admin'];
    return rolesAdmin.includes(usuario.rol);
  }
}