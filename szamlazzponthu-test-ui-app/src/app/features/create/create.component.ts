import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../shared/ui/input/input.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  private router = inject(Router);
  private tService = inject(TranslationService);
  t = (key: string, params?: any) => this.tService.t(key, params);

  form = {
    lastname: '',
    firstname: '',
    address: '',
    phone: '',
    occupation: ''
  };

  onSubmit() {
    console.log('Létrehozás:', this.form);
    // Itt jöhet majd a service hívás, pl. this.api.createPerson(this.form)
  }

  onCancel() {
    // Itt lehet resetelni vagy navigálni vissza
    console.log('Mégsem');
    this.router.navigate(['/table']);
  }
}
