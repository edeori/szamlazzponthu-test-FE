import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/table', pathMatch: 'full' },

  { path: 'table',  loadComponent: () => import('./features/table/table.component').then(c => c.TableComponent) },
  { path: 'edit/:id', loadComponent: () => import('./features/edit/edit.component').then(m => m.EditComponent) },
  { path: 'create', loadComponent: () => import('./features/create/create.component').then(c => c.CreateComponent) },

  { path: '**', redirectTo: '/table' }
];
