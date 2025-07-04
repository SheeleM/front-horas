import { RecuperarPasswordService } from './services/recuperar-password.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent implements OnInit {
  recuperarForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  securityQuestion: string = '';
  loadingQuestion = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private recuperarPasswordService: RecuperarPasswordService
  ) {
    this.recuperarForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.minLength(5)]],
      securityAnswer: ['', [Validators.required, Validators.minLength(3)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.recuperarForm.get('cedula')?.valueChanges.subscribe(value => {

      if (value && value.length >= 5) {
        this.loadSecurityQuestion(value);
      } else {
        this.securityQuestion = '';
      }
    });
  }

  async loadSecurityQuestion(cedula: string) {
    this.loadingQuestion = true;
    this.securityQuestion = 'Cargando pregunta...';

    try {
      this.recuperarPasswordService.getByCedula(cedula).subscribe((data: any) => {
        if (data.success) {
          this.securityQuestion = data.question || '¿Cuál es tu pregunta de seguridad?';
        } else {
          this.securityQuestion = 'No se encontró pregunta para esta cédula';
        }
      });
    } catch (error) {
      console.error('Error al cargar pregunta de seguridad:', error);
      this.securityQuestion = 'Error al cargar la pregunta';
    } finally {
      this.loadingQuestion = false;
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (!this.recuperarForm.valid) {
      this.markFormGroupTouched(this.recuperarForm);
      return;
    }

    this.loading = true;

    const data = {
      cedula: Number(this.recuperarForm.get('cedula')?.value),
      respuestaSeguridad: this.recuperarForm.get('securityAnswer')?.value,
      newPassword: this.recuperarForm.get('newPassword')?.value
    };

    this.recuperarPasswordService.recuperarPassword(data).subscribe({
      next: (response: any) => {
        if (!response || !response.success) {
          Swal.fire({
            title: 'Error',
            text: response?.message || 'Error en la recuperación de contraseña',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          this.loading = false;
          return;
        }
        Swal.fire({
          title: 'Éxito',
          text: 'Tu contraseña ha sido actualizada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/login']);
        });
        this.loading = false;
      },
      error: (error) => {
        let errorMessage = 'Ocurrió un error al procesar tu solicitud';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  forgotSecurityAnswer(): void {
    Swal.fire({
      title: '¿Olvidaste tu respuesta de seguridad?',
      text: 'Por favor comunícate con el administrador del sistema para restablecer tu cuenta',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  // Getters para validaciones
  get cedulaInvalid() {
    const control = this.recuperarForm.get('cedula');
    return control?.invalid && control?.touched;
  }

  get securityAnswerInvalid() {
    const control = this.recuperarForm.get('securityAnswer');
    return control?.invalid && control?.touched;
  }

  get newPasswordInvalid() {
    const control = this.recuperarForm.get('newPassword');
    return control?.invalid && control?.touched;
  }

  get confirmPasswordInvalid() {
    const control = this.recuperarForm.get('confirmPassword');
    return (control?.invalid || this.recuperarForm.hasError('mismatch')) && control?.touched;
  }

  get passwordErrorMessage() {
    const control = this.recuperarForm.get('newPassword');
    if (control?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (control?.hasError('pattern')) {
      return 'La contraseña debe contener al menos una letra, un número y un carácter especial';
    }
    return '';
  }
}