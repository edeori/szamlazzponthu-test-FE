import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InputComponent } from '../../shared/ui/input/input.component';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TranslationService } from '../../core/services/translation.service';
import { UsersService } from '../../core/services/users.service';
import { JobTypesService, UiSelectOption } from '../../core/services/jobtype.service';
import type { JobType } from '../../core/services/api/models';
import { combineLatest, map } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent, DropdownComponent],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  private router = inject(Router);
  private tService = inject(TranslationService);
  private users = inject(UsersService);
  private jobTypesSvc = inject(JobTypesService);

  t = (key: string, params?: any) => this.tService.t(key, params);

  isSubmitting = false;
  serverError: string | null = null;

  jobTypes$ = this.jobTypesSvc.list();
  lang$ = toObservable(this.tService.currentLang);
  jobOptions$ = combineLatest([this.jobTypes$, this.lang$]).pipe(
    map(([rows, lang]) =>
      rows.map<UiSelectOption>((jt: JobType) => ({
        value: jt.code,
        label: lang === 'en' ? jt.labelEn : jt.labelHu
      }))
    )
  );

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

  getJobLabel(j: JobType): string {
    return this.tService.currentLang() === 'en' ? j.labelEn : j.labelHu;
  }

  trackByCode = (_: number, j: JobType) => j.code;

  onCancel() {
    this.router.navigate(['/table']);
  }
}
