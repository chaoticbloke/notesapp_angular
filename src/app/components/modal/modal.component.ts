import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppState } from '../../interface/app-state';
import { CustomHttpResponse } from '../../interface/custom-http-response';
import { Observable } from 'rxjs/internal/Observable';
import { getLevels } from '../../enums/level';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  shareReplay,
  startWith,
} from 'rxjs';
import { NoteService } from '../../service/note.service';
import { DataState } from '../../enums/data-state';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModalComponent {
  @Input() title: string = 'Default Modal Heading.';
  @Input() show = false;

  levels = getLevels();
  fb = inject(FormBuilder);
  noteService = inject(NoteService);
  toastrService = inject(ToastrService);
  createNoteForm!: FormGroup;

  @Input() appState = this.noteService.notesObs$;
  @Output() closeModalEvent = new EventEmitter<any>();

  constructor() {
    console.log('constructor value received in Modal are ', this.show);
    this.createNoteForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      level: [this.levels[0], Validators.required],
    });
  }
  /**
   * Handle modal open
   */
  private handleModalOpen(): void {
    console.log('handleModalOpen called!');
    const modal = document.getElementById('modal-id');
    if (modal) {
      if (this.show) {
        modal.style.display = 'block';
        modal.classList.add('show'); // optional if using Bootstrap modal styles
      } else {
        modal.style.display = 'none';
        modal.classList.remove('show');
      }
    }
  }

  /**
   * Handle modal close
   */
  closeModal(): void {
    this.show = false;
    this.closeModalEvent.emit(this.appState);
  }

  addNewNote() {
    console.log('add note called in modal comp');
    const note = this.createNoteForm.value;
    console.log('note in modal', note);
    this.noteService.createNote(note).subscribe({
      next: () => {
        this.toastrService.success('Note added successfully!');
        this.createNoteForm.reset();
        this.closeModal();
      },
      error: (err) => {
        this.toastrService.error(err.message || 'Failed to add note');
      },
    });
  }
}
