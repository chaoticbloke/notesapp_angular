import {
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
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomHttpResponse } from '../../interface/custom-http-response';
import { AppState } from '../../interface/app-state';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss',
})
export class NoteComponent implements OnInit {
  @Input() note?: Note;
  @Input() appState$!: Observable<AppState<CustomHttpResponse>>;
  editable = false;
  constructor() {}
  ngOnInit(): void {}
  editNote(note?: any) {
    this.editable = false;
    setTimeout(() => (this.editable = true));
  }
  deleteNote(note: any) {
    console.log(note);
  }
  handleCloseModal(event: boolean) {
    console.log('handleCloseModal :', event, this.editable);
  }
}
