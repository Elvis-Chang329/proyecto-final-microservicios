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

  getProductos() {
    return this.http.get<any[]>(`${this.apiI}/productos`);
  }

  crearProducto(body: { nombre: string; stock: number }) {
    return this.http.post(`${this.apiI}/productos`, body);
  }
}
