import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { getLevels, Level } from '../../enums/level';
import { NoteService } from '../../service/note.service';
import { ToastrService } from 'ngx-toastr';
import { Note } from '../../interface/note';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title = 'Add Note';
  @Input() show = false;
  @Input() note?: Note; // For edit mode
  @Output() closeModalEvent = new EventEmitter<void>();

  levels = getLevels();
  createNoteForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private noteService = inject(NoteService);
  private toastrService = inject(ToastrService);

  ngOnInit(): void {
    this.initializeForm();

    // If note is provided, we're in edit mode
    if (this.note) {
      this.isEditMode = true;
      this.patchFormWithNote(this.note);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the form with validators
   */
  private initializeForm(): void {
    this.createNoteForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      level: [Level.MEDIUM, Validators.required],
    });
  }

  /**
   * Patch form with existing note data for editing
   */
  private patchFormWithNote(note: Note): void {
    this.createNoteForm.patchValue({
      title: note.title,
      description: note.description,
      level: note.level,
    });
  }

  /**
   * Handle form submission (create or update)
   */
  onSubmit(): void {
    if (this.createNoteForm.invalid) {
      this.markFormAsTouched();
      this.toastrService.warning('Please fill all required fields correctly');
      return;
    }

    if (this.isSubmitting) {
      return; // Prevent double submission
    }

    this.isSubmitting = true;
    const formValue = this.createNoteForm.value;

    if (this.isEditMode && this.note?.id) {
      this.updateNote(formValue);
    } else {
      this.createNote(formValue);
    }
  }

  /**
   * Create a new note
   */
  private createNote(formValue: any): void {
    const newNote: Note = {
      title: formValue.title,
      description: formValue.description,
      level: formValue.level,
    };

    this.noteService
      .createNote(newNote)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.success('Note created successfully!');
          this.resetAndClose();
        },
        error: (err) => {
          this.toastrService.error(err.message || 'Failed to create note');
          this.isSubmitting = false;
        },
      });
  }

  /**
   * Update an existing note
   */
  private updateNote(formValue: any): void {
    console.log('note to be updated', formValue);
    const updatedNote: Note = {
      ...this.note!,
      title: formValue.title,
      description: formValue.description,
      level: formValue.level,
    };

    this.noteService
      .updateNote(updatedNote)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.success('Note updated successfully!');
          this.resetAndClose();
        },
        error: (err) => {
          this.toastrService.error(err.message || 'Failed to update note');
          this.isSubmitting = false;
        },
      });
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.resetAndClose();
  }

  /**
   * Reset form and close modal
   */
  private resetAndClose(): void {
    this.createNoteForm.reset();
    this.isSubmitting = false;
    this.show = false;
    this.closeModalEvent.emit();
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormAsTouched(): void {
    Object.keys(this.createNoteForm.controls).forEach((key) => {
      this.createNoteForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Check if a form field has errors and is touched
   */
  hasError(fieldName: string): boolean {
    const field = this.createNoteForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.createNoteForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${fieldName} must be at least ${minLength} characters`;
    }

    return '';
  }
}
