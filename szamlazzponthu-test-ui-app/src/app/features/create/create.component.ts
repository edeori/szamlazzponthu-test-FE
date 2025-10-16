import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InputComponent } from '../../shared/ui/input/input.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TranslationService } from '../../core/services/translation.service';
import { UsersService } from '../../core/services/users.service';

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
  private users = inject(UsersService);

  t = (key: string, params?: any) => this.tService.t(key, params);

  isSubmitting = false;
  serverError: string | null = null;

  form = {
    lastname: '',
    firstname: '',
    address: '',
    telephone: '',
    job: ''
  };

  onSubmit(f: NgForm) {
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.serverError = null;
    this.isSubmitting = true;

    this.users.create({
      firstname: this.form.firstname,
      lastname: this.form.lastname,
      address: this.form.address,
      telephone: this.form.telephone,
      job: this.form.job,
      active: true
    }).subscribe({
      next: (_created) => {
        this.router.navigate(['/table']);
      },
      error: (err) => {
        console.error(err);
        this.serverError = this.t('errors.createFailed') ?? 'Hiba történt a létrehozás közben.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }


  onCancel() {
    console.log('Mégsem');
    this.router.navigate(['/table']);
  }
}
