import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { authGuard, authMatchGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'productos', component: ProductosComponent, canActivate: [authGuard], canMatch: [authMatchGuard] },
	{ path: '**', redirectTo: 'login' }
];
