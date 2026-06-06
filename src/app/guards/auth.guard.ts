import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn()) return true;
    return this.router.createUrlTree(['/login']);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.getRole() === 'ADMIN') return true;
    return this.router.createUrlTree(['/dashboard']);
  }
}

@Injectable({ providedIn: 'root' })
export class EntrepriseGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.getRole() === 'ENTREPRISE') return true;
    return this.router.createUrlTree(['/dashboard']);
  }
}

@Injectable({ providedIn: 'root' })
export class StudentGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const role = this.authService.getRole();
    if (role === 'ETUDIANT' || role === 'ALUMNI') return true;
    if (role === 'ENTREPRISE') return this.router.createUrlTree(['/entreprise/dashboard']);
    if (role === 'ADMIN') return this.router.createUrlTree(['/admin']);
    return this.router.createUrlTree(['/dashboard']);
  }
}
