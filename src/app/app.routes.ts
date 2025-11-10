import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'notes/:priority',
    loadComponent: () => import('./app.component').then((m) => m.AppComponent),
  },
  {
    path: '',
    redirectTo: 'notes/all',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'notes/all',
    pathMatch: 'full',
  },
];
