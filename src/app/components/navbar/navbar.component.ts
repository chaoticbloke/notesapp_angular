import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  modalService = inject(ModalService);
  createNewNote() {
    this.modalService.open('createNote', 'New Note');
  }
}
