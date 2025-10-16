import { Component, Input, SimpleChanges, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '../../shared/ui/input/input.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TranslationService } from '../../core/services/translation.service';
import { UsersService } from '../../core/services/users.service';
import { Usr } from '../../core/services/api/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  private tService = inject(TranslationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private users = inject(UsersService);

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

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    console.log('Edit id=', id);

    // 1) próbáljuk meg a navigation state-et (gyors UI)
    const fromState = (history.state?.person as { id: number; name?: string; job?: string; active?: boolean }) || null;
    if (fromState && fromState.id === id) {
      // ha a listából jöttünk, legalább az azonnali kitöltés:
      const [firstname = '', lastname = ''] = (fromState.name ?? '').split(' ');
      this.form = {
        ...this.form,
        id,
        firstname,
        lastname,
        job: fromState.job ?? '',
        active: fromState.active ?? true,
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
        this.router.navigate(['/']); // vagy vissza a listára
      }
    });
  }

  onSubmit() {
    // módosítás mentése
    console.log('Módosítás:', this.form);
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
    console.log('Mégsem');
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
