export type CellRenderer<T> = (row: T, rowIndex: number) => string | number | null | undefined;

export interface ColumnDef<T = any> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'start' | 'center' | 'end';
  cell?: CellRenderer<T>;
  templateKey?: string;
}
