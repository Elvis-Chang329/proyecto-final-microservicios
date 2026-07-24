import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { authGuard, authMatchGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent, canActivate: [guestGuard] },
	{ path: 'registro', component: RegistroComponent, canActivate: [guestGuard] },
	{ path: 'productos', component: ProductosComponent, canActivate: [authGuard], canMatch: [authMatchGuard] },
	{ path: '**', redirectTo: 'login' }
];
