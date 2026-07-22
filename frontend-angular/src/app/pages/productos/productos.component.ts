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

  get totalProductos(): number {
    return this.productos.length;
  }

  get stockTotal(): number {
    return this.productos.reduce((total, producto) => total + Number(producto.stock || 0), 0);
  }

  get productosBajoStock(): number {
    return this.productos.filter((producto) => Number(producto.stock || 0) <= 5).length;
  }

  stockEstado(stock: number): 'Bajo' | 'Normal' | 'Alto' {
    if (stock <= 5) {
      return 'Bajo';
    }

    if (stock <= 15) {
      return 'Normal';
    }

    return 'Alto';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
