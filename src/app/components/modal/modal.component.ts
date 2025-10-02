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
import { BehaviorSubject } from 'rxjs';

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
  @Input() appState!: Observable<AppState<CustomHttpResponse>>;

  @Output() closeModalEvent = new EventEmitter<boolean>(false);
  levels = getLevels();
  fb = inject(FormBuilder);
  createNoteForm!: FormGroup;
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
    this.closeModalEvent.emit(true);
  }

  addNewNote() {
    console.log('addnewNote called in modal');
  }
}
