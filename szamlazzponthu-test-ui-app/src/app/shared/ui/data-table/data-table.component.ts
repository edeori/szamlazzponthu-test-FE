import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, inject, TemplateRef } from '@angular/core';
import { ColumnDef } from './column.model';
import { TranslationService } from '../../../core/services/translation.service';
import { CellTemplateDirective } from './cell-template.directive';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent<T> implements AfterContentInit {
  @Input() data: T[] = [];
  @Input() columns: ColumnDef<T>[] = [];
  @Input() pageSize = 10;
  @Input() pageIndex = 0;

  /** Ha meg van adva, kliens-oldali total (ismert elemszám). */
  @Input() length?: number;

  /** Szerver-oldali lapozás kapcsoló (total lehet ismeretlen). */
  @Input() serverPaging = false;

  /** Szerver-oldali lapozásnál: van-e következő oldal (total nélkül). */
  @Input() hasMore: boolean | null = null;

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();

  @ContentChildren(CellTemplateDirective) templates!: QueryList<CellTemplateDirective>;
  private templateMap = new Map<string, TemplateRef<any>>();

  // i18n
  private i18n = inject(TranslationService);
  t = (key: string, params?: Record<string, string | number>) => {
    this.i18n.currentLang();
    return this.i18n.t(key, params);
  };

  ngAfterContentInit(): void {
    this.templateMap.clear();
    this.templates.forEach(d => this.templateMap.set(d.name, d.tpl));
  }

  get pageData(): T[] {
    if (this.usesServerPaging) return this.data; // szerver küldi az aktuális oldalt
    const start = this.pageIndex * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  }

  get total(): number { return this.length ?? this.data.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get usesServerPaging(): boolean {
    return this.serverPaging || typeof this.length === 'number';
  }

  setPageSize(value: string | number) {
    const size = Number(value);
    this.pageSize = size;
    this.pageIndex = 0;
    this.emitOrRecalc();
  }

  prev() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.emitOrRecalc();
    }
  }

  next() {
    // kliens-lapozás: total alapján
    if (!this.usesServerPaging) {
      if ((this.pageIndex + 1) < this.totalPages) {
        this.pageIndex++;
        // kliensnél nincs emit (helyben lapoz)
      }
      return;
    }
    // szerver-lapozás: hasMore alapján
    if (this.hasMore !== false) {
      this.pageIndex++;
      this.emitOrRecalc();
    }
  }

  goTo(index: number) { if (index >= 0 && index < this.totalPages) { this.pageIndex = index; this.emitOrRecalc(); } }

  onPageSizeChange(e: Event) {
    const target = e.target as HTMLSelectElement | null;
    const val = target ? Number(target.value) : this.pageSize;
    this.pageSize = val;
    this.pageIndex = 0;
    this.emitOrRecalc();
  }

  private emitOrRecalc() {
    if (this.usesServerPaging) {
      this.pageChange.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    }
  }

  getTemplateForKey(col: ColumnDef<T>): TemplateRef<any> | null {
    return this.templateMap.get(String(col.key)) ?? null;
  }

  cellValue(row: T, col: ColumnDef<T>, rowIndex: number) {
    if (col.cell) return col.cell(row, rowIndex);
    const k = col.key as keyof T;
    // @ts-ignore
    return row?.[k] ?? '';
  }
  textAlign(col: ColumnDef): string {
    switch (col.align) { case 'center': return 'center'; case 'end': return 'right'; default: return 'left'; }
  }

  getTemplateFor(colKey: string) {
    return this.templateMap.get(colKey);
  }

  nextDisabled(): boolean {
    if (!this.usesServerPaging) {
      return (this.pageIndex + 1) >= this.totalPages;
    }
    return this.hasMore === false; // szerver mód
  }
}
