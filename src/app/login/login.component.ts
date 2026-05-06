import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
    // private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    // this.authService.login(email, password).subscribe({
    //   next: (response) => {
    //     localStorage.setItem('token', response.token);
    //     this.router.navigate(['/dashboard']);
    //   },
    //   error: (err) => {
    //     this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
    //     this.isLoading = false;
    //   }
    // });

    setTimeout(() => {
      this.isLoading = false;
      console.log('Login avec :', email, password);
    }, 1500);
  }

  loginWithGoogle(): void {
    // window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    console.log('Login Google');
  }

  loginWithLinkedIn(): void {
    // window.location.href = 'http://localhost:8080/oauth2/authorization/linkedin';
    console.log('Login LinkedIn');
  }
}