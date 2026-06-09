import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';
import { homeRouteForRole } from '../utils/role-home.util';

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
    return this.router.createUrlTree(homeRouteForRole(this.authService.getRole()));
  }
}

@Injectable({ providedIn: 'root' })
export class EntrepriseGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.getRole() === 'ENTREPRISE') return true;
    return this.router.createUrlTree(homeRouteForRole(this.authService.getRole()));
  }
}

@Injectable({ providedIn: 'root' })
export class StudentGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const role = this.authService.getRole();
    if (role === 'ETUDIANT' || role === 'ALUMNI' || role === 'ENTREPRISE' || role === 'ADMIN') return true;
    return this.router.createUrlTree(homeRouteForRole(role));
  }
}

/** Student/alumni job discovery — enterprise users use /entreprise/jobs instead. */
@Injectable({ providedIn: 'root' })
export class StudentJobsGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const role = this.authService.getRole();
    if (role === 'ENTREPRISE') {
      return this.router.createUrlTree(['/entreprise/jobs/all']);
    }
    if (role === 'ETUDIANT' || role === 'ALUMNI' || role === 'ADMIN') return true;
    return this.router.createUrlTree(homeRouteForRole(role));
  }
}

/** Redirects `/` inside the main shell to the correct home for the logged-in role. */
@Injectable({ providedIn: 'root' })
export class RoleHomeRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): UrlTree {
    return this.router.createUrlTree(homeRouteForRole(this.authService.getRole()));
  }
}

/** Sends unknown routes to login (guest) or role home (authenticated). */
@Injectable({ providedIn: 'root' })
export class FallbackRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): UrlTree {
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }
    return this.router.createUrlTree(homeRouteForRole(this.authService.getRole()));
  }
}
