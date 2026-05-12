import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  currentStep = 1;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  niveaux = ['DEBUTANT', 'INTERMEDIAIRE', 'EXPERT']; // Based on backend enum
  filieres = ['Informatique', 'Génie Civil', 'Génie Électromécanique', 'Management', 'TIC'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      // Step 1: Identity
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      typeUtilisateur: ['ETUDIANT', Validators.required], // Rattachement

      // Step 2: Profile
      niveau: ['DEBUTANT', Validators.required],
      filiere: ['', Validators.required],
      diplome: [''],
      photo: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      // Validate Step 1 fields manually if needed, or check group
      const step1Fields = ['prenom', 'nom', 'email', 'password', 'confirmPassword', 'acceptTerms', 'typeUtilisateur'];
      let isValid = true;
      step1Fields.forEach(f => {
        const ctrl = this.registerForm.get(f);
        ctrl?.markAsTouched();
        if (ctrl?.invalid) isValid = false;
      });
      if (this.registerForm.hasError('mismatch')) isValid = false;

      if (isValid) this.currentStep = 2;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const val = this.registerForm.value;
    const request = {
      nom: `${val.prenom} ${val.nom}`, // Combine prenom and nom
      email: val.email,
      password: val.password,
      niveau: val.niveau,
      filiere: val.filiere,
      diplome: val.diplome,
      photo: val.photo
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigation vers la page de succès au lieu de changer currentStep
        this.router.navigate(['/register-success'], { 
          queryParams: { email: val.email } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || "Une erreur est survenue lors de l'inscription.";
        this.currentStep = 1; // Go back to fix errors
      }
    });
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.registerForm.patchValue({ photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
