import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import zxcvbn from 'zxcvbn';

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

  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = '';
  niveaux = ['DEBUTANT', 'INTERMEDIAIRE', 'EXPERT']; // Based on backend enum
  filieres = ['Informatique', 'Génie Civil', 'Génie Électromécanique', 'Management', 'TIC'];
  
  documentFileName = '';
  documentFileError = '';

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
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      typeUtilisateur: ['ETUDIANT', Validators.required],

      // Step 2: Profile - Etudiant
      niveau: ['DEBUTANT'],
      filiere: [''],
      diplome: [''],
      photo: [''],
      
      // Step 2: Profile - Alumni
      anneePromotion: [null],
      domaine: [''],
      disponibleMentorat: [false],
      entrepriseActuelle: [''],

      // Step 2: Profile - Entreprise
      nomEntreprise: [''],
      registreCommerce: [''],
      secteurActivite: [''],
      siteWeb: [''],
      descriptionEntreprise: [''],
      documentJustificatif: ['']
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength(value || '');
    });
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthColor = '';
      return;
    }

    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    const result = zxcvbn(password);
    this.passwordStrength = result.score; // 0 to 4
    
    let criteriaMet = [hasLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    // Adjust score based on strict criteria
    if (criteriaMet < 3) this.passwordStrength = Math.min(this.passwordStrength, 1);
    else if (criteriaMet < 5) this.passwordStrength = Math.min(this.passwordStrength, 2);
    else if (criteriaMet === 5 && this.passwordStrength < 3) this.passwordStrength = 3;

    // Use score to define how many segments to light up
    if (this.passwordStrength === 0) {
      this.passwordStrength = 1; // At least one segment active if typing
    }

    switch (this.passwordStrength) {
      case 1:
        this.passwordStrengthText = 'Faible';
        this.passwordStrengthColor = '#ff4d4f'; // red
        break;
      case 2:
        this.passwordStrengthText = 'Moyen';
        this.passwordStrengthColor = '#faad14'; // orange
        break;
      case 3:
        this.passwordStrengthText = 'Fort';
        this.passwordStrengthColor = '#52c41a'; // green
        break;
      case 4:
        this.passwordStrengthText = 'Très fort';
        this.passwordStrengthColor = '#2c7d0a'; // darker green
        break;
      default:
        this.passwordStrengthText = '';
        this.passwordStrengthColor = '';
    }
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
    const request: any = {
      nom: `${val.prenom} ${val.nom}`,
      email: val.email,
      password: val.password,
      role: val.typeUtilisateur,
      diplome: val.diplome,
      photo: val.photo
    };

    if (val.typeUtilisateur === 'ETUDIANT') {
      request.niveau = val.niveau;
      request.filiere = val.filiere;
    } else if (val.typeUtilisateur === 'ALUMNI') {
      request.anneePromotion = val.anneePromotion;
      request.domaine = val.domaine;
      request.disponibleMentorat = val.disponibleMentorat;
      request.entrepriseActuelle = val.entrepriseActuelle;
    } else if (val.typeUtilisateur === 'ENTREPRISE') {
      request.nomEntreprise = val.nomEntreprise;
      request.registreCommerce = val.registreCommerce;
      request.secteurActivite = val.secteurActivite;
      request.siteWeb = val.siteWeb;
      request.descriptionEntreprise = val.descriptionEntreprise;
      request.documentJustificatif = val.documentJustificatif;
    }

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/register-success'], { 
          queryParams: { email: val.email } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || "Une erreur est survenue lors de l'inscription.";
        this.currentStep = 1;
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

  onDocumentSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        this.documentFileError = 'Format non supporté. Utilisez PDF, JPG ou PNG.';
        this.documentFileName = '';
        this.registerForm.patchValue({ documentJustificatif: '' });
        return;
      }

      if (file.size > maxSize) {
        this.documentFileError = 'Le fichier ne doit pas dépasser 5 Mo.';
        this.documentFileName = '';
        this.registerForm.patchValue({ documentJustificatif: '' });
        return;
      }

      this.documentFileError = '';
      this.documentFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.registerForm.patchValue({ documentJustificatif: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  removeDocument(): void {
    this.documentFileName = '';
    this.documentFileError = '';
    this.registerForm.patchValue({ documentJustificatif: '' });
  }
}
