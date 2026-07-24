import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  msg = '';

  constructor(private api: ApiService, private router: Router) {}

  login() {
    this.msg = '';
    if (!this.email.trim() || !this.password.trim()) {
      this.msg = 'Debes ingresar correo y contraseña';
      return;
    }

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        const code = err?.error?.error;

        if (err?.status === 401 || code === 'invalid_credentials') {
          this.msg = 'Contraseña incorrecta o credenciales inválidas';
          return;
        }

        this.msg = 'No se pudo iniciar sesión. Intenta nuevamente.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }
}
