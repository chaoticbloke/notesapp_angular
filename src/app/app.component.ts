import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from './service/modal.service';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NoteService } from './service/note.service';
import { Note } from './interface/note';
import { getLevels, Level } from './enums/level';
import { NoteComponent } from './components/note/note.component';
import { CustomHttpResponse } from './interface/custom-http-response';
import {
  catchError,
  map,
  Observable,
  startWith,
  of,
  BehaviorSubject,
  shareReplay,
} from 'rxjs';
import { AppState } from './interface/app-state';
import { DataState } from './enums/data-state';
import { ModalComponent } from './components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NoteComponent,
    ReactiveFormsModule,
    NoteComponent,
    RouterLink,
    RouterLinkActive,
    ModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  isAddModalOpen = false;
  noteTitle = 'this is model';
  noteDescription = 'model description';
  appState$!: Observable<AppState<CustomHttpResponse>>;
  isModalOpen = true;
  isSaving = false;

  notesBh$ = new BehaviorSubject<CustomHttpResponse | undefined>(undefined);
  levels = getLevels();
  activeTemplate!: TemplateRef<any>;
  createNoteForm!: FormGroup;
  note: Note = {
    title: '',
    description: '',
    createdAt: new Date(),
    level: Level.HIGH,
  };

  noteService = inject(NoteService);

  constructor(private modalService: ModalService, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.createNoteForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      level: [this.levels[0], Validators.required],
    });

    this.appState$ = this.noteService.notes$.pipe(
      map((response: CustomHttpResponse) => {
        this.notesBh$.next(response);
        return {
          dataState: DataState.LOADED,
          data: response,
          error: null,
        };
      }),
      startWith({ dataState: DataState.LOADING, data: null, error: null }),
      catchError((err) => {
        return of({ dataState: DataState.ERROR, error: err, data: null });
      })
    );
  }

  onSubmit() {
    console.log('onSubmit CALLED!!');
  }

  getNotesData() {}

  onLevelChange(event: any) {
    console.log('level change ', event);
  }

  @ViewChild('addnotesmodal') addNotesModal!: ElementRef;

  openAddModal() {
    const modalEl = this.addNotesModal.nativeElement;
    modalEl.classList.add('show');
    modalEl.classList.add('d-block');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.removeAttribute('aria-hidden');

    // optional: add backdrop if needed
    let backdrop = document.getElementById('modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'modal-backdrop';
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  closeAddModal() {
    const modalEl = this.addNotesModal.nativeElement;
    modalEl.classList.remove('show');
    modalEl.classList.remove('d-block');
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.removeAttribute('aria-modal');

    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      document.body.removeChild(backdrop);
    }
  }

  addNewNote() {
    const newNote = this.createNoteForm.value;

    this.appState$ = this.noteService.createNote(newNote).pipe(
      map((res: AppState<CustomHttpResponse>) => {
        const prev = this.notesBh$.value;

        const updated: CustomHttpResponse = {
          ...res.data!, // merge latest server data if needed
          ...prev,
          notes: [newNote, ...(prev?.notes ?? [])], // append new note
        };

        this.notesBh$.next(updated);
        this.createNoteForm.reset();
        this.closeAddModal();
        return { dataState: DataState.LOADED, data: updated };
      }),
      startWith({ dataState: DataState.LOADING }),
      shareReplay(1),
      catchError((error) => {
        return of({
          dataState: DataState.ERROR,
          error: error.message ?? 'Unknown error while adding note',
        } as AppState<CustomHttpResponse>);
      })
    );
  }

  ngOnDestroy(): void {}
}
