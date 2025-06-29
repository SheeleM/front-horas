import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AxiosService } from '../axios.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LoginService } from './services/Login.service';

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

  constructor(private formBuilder: FormBuilder, private axiosService: AxiosService,private router: Router,
    private loginServices:LoginService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      cedula: ['', Validators.required],
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

    const loginData = {
      ...this.loginForm.value,
      cedula: Number(this.loginForm.value.cedula)
    };
    this.loginServices.auth(loginData).subscribe({
      next: (data) => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        Swal.fire({
          title: 'Error en el inicio de sesión',
          text: 'Usuario o contraseña incorrectos.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }
}
