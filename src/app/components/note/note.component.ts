import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';
import { Note } from '../../interface/note';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { NoteService } from '../../service/note.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteComponent implements OnDestroy {
  @Input() note?: Note;

  editable = false;
  isDeleting = false;
  private destroy$ = new Subject<void>();
  private noteService = inject(NoteService);
  private toastr = inject(ToastrService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Open edit modal for the note
   */
  editNote(note?: Note): void {
    console.log('edit note clicked');
    if (!note) {
      this.toastr.error('Invalid note');
      return;
    }

    this.note = note;
    this.editable = false;
    // Use setTimeout to allow Angular to destroy and recreate the modal component
    setTimeout(() => {
      this.editable = true;
      this.changeDetectorRef.detectChanges(); // Force change detection
    });
  }

  /**
   * Delete note with confirmation
   */
  deleteNote(note?: Note): void {
    if (!note?.id) {
      this.toastr.error('Invalid note');
      return;
    }

    // Optional: Add confirmation dialog
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    if (this.isDeleting) {
      return; // Prevent multiple delete requests
    }

    this.isDeleting = true;

    this.noteService
      .deleteNote(note.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Note deleted successfully');
          this.isDeleting = false;
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to delete note');
          this.isDeleting = false;
        },
      });
  }

  /**
   * Handle modal close event
   */
  handleCloseModal(event: any): void {
    this.editable = false;
  }
}
