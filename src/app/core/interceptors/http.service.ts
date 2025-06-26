import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../../login/services/Login.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers = req.headers;
    const token = this.loginService.getAccessToken()?.access_token;

    // Rutas públicas (sin token)
    const publicEndpoints = [ '/preguntas', '/auth/login'];
    const isPublicEndpoint = publicEndpoints.some(path => req.url.includes(path));

    if (!isPublicEndpoint && token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const reqClor = req.clone({ headers });

    return next.handle(reqClor).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (token) {
            localStorage.clear();
            this.router.navigateByUrl('/login');
          }
        }

        if (error.status === 406) {
          localStorage.clear();
          this.router.navigateByUrl('/login');
        }

        if (error.status === 404) {
          this.router.navigateByUrl('**');
        }

        if (error.status === 410) {
          this.router.navigateByUrl('/login');
        }

        return throwError(error);
      })
    );
  }
}
