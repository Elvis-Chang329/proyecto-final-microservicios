import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  nombre = '';
  stock = 0;
  msg = '';
  toastMsg = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.api.getProductos().subscribe({
      next: (data) => (this.productos = data),
      error: () => (this.msg = 'error_cargando_productos')
    });
  }

  crear() {
    this.msg = '';
    this.api.crearProducto({ nombre: this.nombre, stock: Number(this.stock) }).subscribe({
      next: () => {
        this.nombre = '';
        this.stock = 0;
        this.cargar();
        this.showToast('Producto creado');
      },
      error: (err) => (this.msg = err?.error?.error || 'create_error')
    });
  }

  showToast(message: string) {
    this.toastMsg = message;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMsg = '';
    }, 2200);
  }

  verProducto(producto: { nombre: string }) {
    this.showToast(`Producto: ${producto.nombre}`);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
