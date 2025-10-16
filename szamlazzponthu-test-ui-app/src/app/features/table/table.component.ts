import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CellTemplateDirective } from '../../shared/ui/data-table/cell-template.directive';
import { ColumnDef } from '../../shared/ui/data-table/column.model';
import { TranslationService } from '../../core/services/translation.service';
import { UsersService, Person } from '../../core/services/users.service';
import { JobTypesService } from '../../core/services/jobtype.service';
import type { JobType } from '../../core/services/api/models';
import { catchError, finalize, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

type PersonView = Person & { jobLabel: string };

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
  private jobTypesSvc = inject(JobTypesService);

  t = (key: string, params?: any) => this.tService.t(key, params);

  columns: ColumnDef<PersonView>[] = [
    { key: 'name', header: this.t('table.columns.name') },
    { key: 'jobLabel', header: this.t('table.columns.job'), align: 'end' },
    { key: 'active', header: this.t('table.columns.active'), align: 'end' },
    { key: 'actions', header: this.t('table.columns.actions'), align: 'end' }
  ];

  private rawData: Person[] = [];
  data: PersonView[] = [];

  pageIndex = 0;
  pageSize = 10;
  hasMore: boolean | null = null;
  loading = false;

  private jobTypeMap = new Map<string, JobType>();

  private lang$ = toObservable(this.tService.currentLang);

  ngOnInit() {
    // 1) jobtype-ok betöltése és map építése
    this.jobTypesSvc.list().subscribe({
      next: list => {
        this.jobTypeMap = new Map(list.map(jt => [jt.code, jt]));
        this.recomputeData();
      },
      error: err => console.error('JobTypes load failed', err)
    });

    // 2) első fetch
    this.fetch();

    // 3) nyelvváltás → újracímkézés
    this.lang$.subscribe(() => this.recomputeData());
  }

  private getJobLabelByCode(code: string): string {
    const jt = this.jobTypeMap.get(code);
    if (!jt) return code || '';
    const lang = this.tService.currentLang();
    return lang === 'en' ? jt.labelEn : jt.labelHu;
  }

  private recomputeData() {
    // nyers → view model
    this.data = this.rawData.map(p => ({
      ...p,
      jobLabel: this.getJobLabelByCode(p.job)
    }));
  }

  fetch() {
    this.loading = true;
    this.users.list(this.pageIndex, this.pageSize).subscribe({
      next: res => {
        this.rawData = res.items;
        this.hasMore = res.hasMore;
        this.recomputeData();
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

  onEdit(row: PersonView) {
    this.router.navigate(['/edit', row.id], {
      state: { person: row }
    });
  }

  onDelete(row: PersonView) {
    const confirmed = confirm(`Biztosan törlöd: "${row.name}"?`);
    if (!confirmed) return;

    this.loading = true;

    this.users.delete(row.id).pipe(
      catchError(err => {
        console.error(err);
        alert('Hiba történt a törlés során.');
        return of(void 0);
      }),
      finalize(() => {
        this.users.list(this.pageIndex, this.pageSize).subscribe({
          next: res => {
            if (res.items.length === 0 && this.pageIndex > 0) {
              this.pageIndex--;
              this.fetch();
            } else {
              this.rawData = res.items;
              this.hasMore = res.hasMore;
              this.recomputeData();
              this.loading = false;
            }
          },
          error: err => {
            console.error(err);
            this.loading = false;
          }
        });
      })
    ).subscribe();
  }

  onCreate() {
    this.router.navigate(['/create']);
  }
}
