import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = atob(normalized);
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const isValidToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  const cleanToken = token.trim();
  if (!cleanToken || cleanToken === 'null' || cleanToken === 'undefined') {
    return false;
  }

  // Basic JWT shape validation to avoid passing placeholder strings as token.
  if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(cleanToken)) {
    return false;
  }

  const payload = decodeJwtPayload(cleanToken);
  if (!payload) {
    return false;
  }

  const exp = payload['exp'];
  if (typeof exp === 'number') {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (exp <= nowInSeconds) {
      return false;
    }
  }

  return true;
};

const hasAccess = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (!isValidToken(token)) {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }
  return true;
};

const isGuest = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (isValidToken(token)) {
    router.navigate(['/productos']);
    return false;
  }

  localStorage.removeItem('token');
  return true;
};

export const authGuard: CanActivateFn = () => hasAccess();

export const authMatchGuard: CanMatchFn = () => hasAccess();

export const guestGuard: CanActivateFn = () => isGuest();
