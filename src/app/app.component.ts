import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';

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
  isModalOpen = true;
  isSaving = false;
  levels = getLevels();
  addNoteFlag = false;
  createNoteForm!: FormGroup;
  note: Note = {
    title: '',
    description: '',
    createdAt: new Date(),
    level: Level.HIGH,
  };

  noteService = inject(NoteService);
  toasterService = inject(ToastrService);

  appState$ = this.noteService.notesObs$;

  @ViewChild('modalComponent') modalComponent!: ModalComponent;

  constructor(private modalService: ModalService, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.createNoteForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      level: [this.levels[0], Validators.required],
    });
  }

  onSubmit() {
    console.log('onSubmit CALLED!!');
  }

  getNotesData() {}

  onLevelChange(event: any) {
    console.log('level change ', event);
  }

  openAddNoteModal() {
    this.addNoteFlag = false;
    setTimeout(() => (this.addNoteFlag = true));
  }
  ngOnDestroy(): void {}
}
