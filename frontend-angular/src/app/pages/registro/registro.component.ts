import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  email = '';
  password = '';
  confirmPassword = '';
  role = 'lector';
  message = '';
  messageType: 'success' | 'error' = 'error';

  constructor(private api: ApiService, private router: Router) {}

  register() {
    this.message = '';

    if (!this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.messageType = 'error';
      this.message = 'Completa todos los campos para crear el usuario.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.messageType = 'error';
      this.message = 'Las contraseñas no coinciden.';
      return;
    }

    this.api.registerUser({ email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => {
        this.messageType = 'success';
        this.message = 'Usuario creado con éxito. Ya puedes iniciar sesión.';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        const code = err?.error?.error;

        if (err?.status === 409 || code === 'email_exists') {
          this.messageType = 'error';
          this.message = 'Ese correo ya está registrado.';
          return;
        }

        this.messageType = 'error';
        this.message = 'No se pudo crear el usuario. Intenta nuevamente.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}