import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        const url = req.url;
        const isPublicAuthCall =
          url.includes('/api/auth/login') ||
          url.includes('/api/auth/register') ||
          url.includes('/api/auth/verify-2fa-login') ||
          url.includes('/api/auth/verify-email') ||
          url.includes('/api/auth/resend-verification-email');

        if (err.status === 401 && !isPublicAuthCall) {
          this.authService.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
