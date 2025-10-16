import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CellTemplateDirective } from '../../shared/ui/data-table/cell-template.directive';
import { ColumnDef } from '../../shared/ui/data-table/column.model';
import { TranslationService } from '../../core/services/translation.service';
import { UsersService, Person } from '../../core/services/users.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [DataTableComponent, CellTemplateDirective, ButtonComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  private router = inject(Router);
  private tService = inject(TranslationService);
  private users = inject(UsersService);

  t = (key: string, params?: any) => this.tService.t(key, params);

  columns: ColumnDef<Person>[] = [
    { key: 'name', header: this.t('table.columns.name') },
    { key: 'job', header: this.t('table.columns.job'), align: 'end' },
    { key: 'active', header: this.t('table.columns.active'), align: 'end' },
    { key: 'actions', header: this.t('table.columns.actions'), align: 'end' }
  ];

  data: Person[] = [];
  pageIndex = 0;
  pageSize = 10;
  hasMore: boolean | null = null;
  loading = false;

  ngOnInit() { this.fetch(); }

  fetch() {
    this.loading = true;
    this.users.list(this.pageIndex, this.pageSize).subscribe({
      next: res => {
        console.log('USERS ->', res.items);
        this.data = res.items;
        this.hasMore = res.hasMore;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onPageChange(ev: { pageIndex: number; pageSize: number }) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.fetch();
  }

  onEdit(row: Person) {
    console.log('EDIT', row);
    // TODO: modal/route stb.
  }

  onDelete(row: Person) {
    console.log('DELETE', row);
    // TODO: megerősítő párbeszéd, API hívás stb.
  }

  onCreate() {
    console.log('Create clicked');
    this.router.navigate(['/create']);
  }

}
