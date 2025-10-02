import { Routes } from '@angular/router';
import { NoteComponent } from './components/note/note.component';

export const routes: Routes = [
  {
    path: 'notes/:priority',
    component: NoteComponent,
  },
  {
    path: 'add',
    component: NoteComponent,
  },
  {
    path: '',
    redirectTo: 'notes/all',
    pathMatch: 'full', // default route
  },
  {
    path: '**',
    redirectTo: 'notes/all',
    pathMatch: 'full',
  },
];
