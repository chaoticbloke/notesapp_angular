import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Note } from '../../interface/note';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { BehaviorSubject, catchError, Observable, of, take } from 'rxjs';
import { CustomHttpResponse } from '../../interface/custom-http-response';
import { AppState } from '../../interface/app-state';
import { NoteService } from '../../service/note.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteComponent implements OnInit {
  @Input() note?: Note;
  @Input() appState$!: Observable<AppState<Note[]>>;
  noteService = inject(NoteService);
  editable = false;
  constructor(private toastr: ToastrService) {}
  ngOnInit(): void {}
  editNote(note?: any) {
    this.editable = false;
    setTimeout(() => (this.editable = true));
  }

  /**
   * deletes note
   * @param note
   * @returns
   */
  deleteNote(note?: Note): void {
    if (!note?.id) {
      this.toastr.error('Invalid note');
      return;
    }

    this.noteService
      .deleteNote(note.id)
      .pipe(
        take(1), // complete after one emission
        catchError((error) => {
          this.toastr.error('Failed to delete note. Please try again.');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res) {
          this.toastr.success('Note successfully deleted');
          //Update the UI
        }
      });
  }
  handleCloseModal(event: boolean) {
    console.log('handleCloseModal :', event, this.editable);
  }
}
