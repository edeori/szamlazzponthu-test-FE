import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../shared/ui/input/input.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TranslationService } from '../../core/services/translation.service';

export interface Person {
  id: string;
  lastname: string;
  firstname: string;
  address: string;
  phone: string;
  occupation: string;
  active: boolean;
}

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnChanges {
  private tService = inject(TranslationService);
  t = (key: string, params?: any) => this.tService.t(key, params);

  @Input() person?: Person;

  form: Person = {
    id: '',
    lastname: '',
    firstname: '',
    address: '',
    phone: '',
    occupation: '',
    active: true,
  };

  ngOnChanges(): void {
    const p = this.person ?? ({} as Partial<Person>);

    this.form = {
      id: p.id ?? '',
      lastname: p.lastname ?? '',
      firstname: p.firstname ?? '',
      address: p.address ?? '',
      phone: p.phone ?? '',
      occupation: p.occupation ?? '',
      active: p.active ?? true,
    };
  }


  onSubmit() {
    // módosítás mentése
    console.log('Módosítás:', this.form);
    // példa:
    // this.api.updatePerson(this.form.id, this.form).subscribe(...)
  }

  onCancel() {
    console.log('Mégsem');
    // visszanavigálás vagy form reset:
    // this.router.navigate(['../']);
    // vagy:
    // this.form = { ...this.form, ...this.person! };
  }

  onDelete() {
    if (!this.form.id) return;
    const sure = confirm('Biztosan törlöd ezt a személyt?');
    if (!sure) return;

    console.log('Törlés:', this.form.id);
    // példa:
    // this.api.deletePerson(this.form.id).subscribe(...)
  }
}
