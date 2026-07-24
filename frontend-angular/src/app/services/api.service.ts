import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  apiU = environment.apiUsuarios;
  apiI = environment.apiInventario;

  constructor(private http: HttpClient) {}

  login(body: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.apiU}/auth/login`, body);
  }

  registerUser(body: { email: string; password: string; role?: string }) {
    return this.http.post<{ id: number; email: string; role: string }>(`${this.apiU}/auth/register`, body);
  }

  getProductos() {
    return this.http.get<any[]>(`${this.apiI}/productos`);
  }

  crearProducto(body: { nombre: string; stock: number }) {
    return this.http.post(`${this.apiI}/productos`, body);
  }

  actualizarProducto(id: number, body: { nombre: string; stock: number }) {
    return this.http.put(`${this.apiI}/productos/${id}`, body);
  }

  eliminarProducto(id: number) {
    return this.http.delete(`${this.apiI}/productos/${id}`);
  }
}
