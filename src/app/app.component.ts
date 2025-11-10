import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  ActivatedRoute,
  Router,
  NavigationEnd,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NoteService } from './service/note.service';
import { NoteComponent } from './components/note/note.component';
import { ModalComponent } from './components/modal/modal.component';
import { Observable, filter, map, startWith, switchMap } from 'rxjs';
import { Note } from './interface/note';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NoteComponent,
    RouterLink,
    RouterLinkActive,
    ModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  addNoteFlag = false;
  noteService = inject(NoteService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  // Expose the main observable
  appState$ = this.noteService.notesObs$;

  // Filtered notes based on route
  filteredNotes$!: Observable<Note[]>;

  @ViewChild('modalComponent') modalComponent!: ModalComponent;
  ngOnInit(): void {
    this.router.events
      .pipe(
        // keep it to nav end, and run once on init
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        startWith(null),
        // 👇 walk down the *ActivatedRoute* tree, not Router
        map(() => {
          let r: ActivatedRoute = this.route;
          while (r.firstChild) r = r.firstChild;
          return r;
        }),
        switchMap((r) => r.paramMap)
      )
      .subscribe((pm) => {
        const priority = pm.get('priority') ?? 'all';
        console.log('priority from child:', priority);
        this.filteredNotes$ = this.noteService.filterNotesByPriority(priority);
      });
  }

  /**
   * Open add note modal
   */
  openAddNoteModal(): void {
    this.addNoteFlag = false;
    setTimeout(() => (this.addNoteFlag = true), 0);
  }

  /**
   * Handle modal close event
   */
  onModalClose(): void {
    this.addNoteFlag = false;
  }
}
