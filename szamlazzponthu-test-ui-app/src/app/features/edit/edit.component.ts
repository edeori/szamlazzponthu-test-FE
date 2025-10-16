import { Component, Input, SimpleChanges, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '../../shared/ui/input/input.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TranslationService } from '../../core/services/translation.service';
import { UsersService } from '../../core/services/users.service';
import { JobTypesService } from '../../core/services/jobtype.service';
import { Usr, JobType } from '../../core/services/api/models';
import { catchError, finalize, of, combineLatest, map } from 'rxjs';
import { DropdownComponent, UiSelectOption } from '../../shared/ui/dropdown/dropdown.component';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent, DropdownComponent],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  private tService = inject(TranslationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private users = inject(UsersService);
  private jobTypesSvc = inject(JobTypesService);

  t = (key: string, params?: any) => this.tService.t(key, params);

  @Input() person?: Usr;

  loading = false;
  saving = false;

  form: Usr = {
    id: 0,
    lastname: '',
    firstname: '',
    address: '',
    telephone: '',
    job: '',
    active: true,
  };

  jobTypes$ = this.jobTypesSvc.list();
  lang$ = toObservable(this.tService.currentLang);
  jobOptions$ = combineLatest([this.jobTypes$, this.lang$]).pipe(
    map(([rows, lang]) =>
      rows.map<UiSelectOption>((jt: JobType) => ({
        value: jt.code,
        label: lang === 'en' ? jt.labelEn : jt.labelHu,
      }))
    )
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 0);

    const fromState = (history.state?.person as Partial<Usr> | null) ?? null;
    if (fromState?.id === id) {
      this.form = {
        ...this.form,
        id,
        firstname: fromState.firstname ?? this.form.firstname,
        lastname: fromState.lastname ?? this.form.lastname,
        address: fromState.address ?? this.form.address,
        telephone: fromState.telephone ?? this.form.telephone,
        job: fromState.job ?? this.form.job,
        active: fromState.active ?? this.form.active,
      };
    }

    this.loading = true;
    this.users.getById(id).subscribe({
      next: detail => {
        this.form = detail;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        alert('Nem sikerült betölteni a felhasználót.');
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit() {
    // módosítás mentése
    if (!this.form.id) return;
    this.saving = true;

    this.users.update(this.form.id, this.form).pipe(
      catchError(err => {
        console.error(err);
        alert('A mentés nem sikerült.');
        return of(null);
      }),
      finalize(() => { this.saving = false; })
    ).subscribe(updated => {
      if (!updated) return;
      this.router.navigate(['/table']);
      //alert('Sikeresen mentve.');
      this.form = updated; // friss adatok visszatöltése
    });
  }

  onCancel() {
    this.router.navigate(['/table']);
  }

  onDelete() {
    if (!this.form.id) return;
    const sure = confirm('Biztosan törlöd ezt a személyt?');
    if (!sure) return;

    this.loading = true;

    this.users.delete(this.form.id).pipe(
      catchError(err => {
        console.error(err);
        alert('Hiba történt a törlés során.');
        return of(void 0);
      }),
      finalize(() => {
        this.router.navigate(['/table']);
      })
    ).subscribe();
  }
}
