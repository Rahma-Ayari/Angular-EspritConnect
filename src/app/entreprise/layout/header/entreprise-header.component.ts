import { Component } from '@angular/core';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-entreprise-header',
  templateUrl: './entreprise-header.component.html',
  styleUrls: ['./entreprise-header.component.css']
})
export class EntrepriseHeaderComponent {
  
  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}
