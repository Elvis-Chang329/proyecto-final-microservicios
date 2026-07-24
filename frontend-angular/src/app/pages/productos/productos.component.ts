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
  editingId: number | null = null;
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
    const wasEditing = this.editingId !== null;

    const payload = { nombre: this.nombre.trim(), stock: Number(this.stock) };
    const request$ = this.editingId
      ? this.api.actualizarProducto(this.editingId, payload)
      : this.api.crearProducto(payload);

    request$.subscribe({
      next: () => {
        this.limpiarFormulario();
        this.cargar();
        this.showToast(wasEditing ? 'Producto actualizado' : 'Producto creado');
      },
      error: (err) => {
        const code = err?.error?.error;

        if (code === 'producto_not_found') {
          this.msg = 'El producto ya no existe.';
          return;
        }

        this.msg = this.editingId ? 'No se pudo actualizar el producto.' : 'No se pudo crear el producto.';
      }
    });
  }

  iniciarEdicion(producto: { id: number; nombre: string; stock: number }) {
    this.editingId = producto.id;
    this.nombre = producto.nombre;
    this.stock = Number(producto.stock || 0);
    this.msg = '';
    this.showToast(`Editando ${producto.nombre}`);
  }

  cancelarEdicion() {
    this.limpiarFormulario();
    this.msg = '';
  }

  eliminar(producto: { id: number; nombre: string }) {
    const confirmacion = confirm(`¿Eliminar ${producto.nombre}?`);
    if (!confirmacion) {
      return;
    }

    this.msg = '';
    this.api.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.cargar();
        if (this.editingId === producto.id) {
          this.limpiarFormulario();
        }
        this.showToast('Producto eliminado');
      },
      error: (err) => {
        const code = err?.error?.error;

        if (code === 'producto_not_found') {
          this.msg = 'El producto ya no existe.';
          return;
        }

        this.msg = 'No se pudo eliminar el producto.';
      }
    });
  }

  limpiarFormulario() {
    this.nombre = '';
    this.stock = 0;
    this.editingId = null;
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

  get formTitle(): string {
    return this.editingId ? 'Editar producto' : 'Crear producto';
  }

  get formHint(): string {
    return this.editingId ? 'Modifica nombre y stock, luego guarda los cambios.' : 'Registra un producto nuevo con su stock inicial.';
  }

  get stockEditState(): 'Sin stock' | 'Bajo' | 'Normal' | 'Alto' {
    const currentStock = Number(this.stock || 0);

    if (currentStock <= 0) {
      return 'Sin stock';
    }

    if (currentStock <= 5) {
      return 'Bajo';
    }

    if (currentStock <= 15) {
      return 'Normal';
    }

    return 'Alto';
  }

  get stockEditMessage(): string {
    const currentStock = Number(this.stock || 0);

    if (currentStock <= 0) {
      return 'Este producto está agotado.';
    }

    if (currentStock <= 5) {
      return 'Quedan pocas unidades y conviene reponer.';
    }

    if (currentStock <= 15) {
      return 'Nivel de stock saludable.';
    }

    return 'Stock alto y disponible.';
  }

  get needsRestock(): boolean {
    const currentStock = Number(this.stock || 0);
    return currentStock <= 5;
  }

  get stockEditProgress(): number {
    const currentStock = Number(this.stock || 0);
    return Math.max(0, Math.min(100, currentStock > 0 ? (currentStock / 20) * 100 : 0));
  }

  get submitLabel(): string {
    return this.editingId ? 'Guardar cambios' : 'Crear producto';
  }

  get isEditing(): boolean {
    return this.editingId !== null;
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
