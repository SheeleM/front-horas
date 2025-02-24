import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AxiosService } from '../axios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(private formBuilder: FormBuilder, private axiosService: AxiosService) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    
    if (this.loginForm.invalid) {
      return;
    }

    try {
      const response = await this.axiosService.post('/user', this.loginForm.value);
      const { token } = response.data;
      localStorage.setItem('token', token);
      Swal.fire({
        title: 'Inicio de sesión exitoso',
        text: 'Has iniciado sesión correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error en el inicio de sesión',
        text: 'No se pudo iniciar sesión. Por favor, verifica tus credenciales e intenta de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}
