import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalData } from '../interface/ModalData';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private templates = new Map<string, TemplateRef<any>>();

  private modalState = new BehaviorSubject<ModalData>({
    title: '',
    template: null!,
    open: false,
  });
  modalState$ = this.modalState.asObservable();

  constructor() {}

  open(key: string, title: string) {
    const template = this.templates.get(key);
    if (template) {
      this.modalState.next({ open: true, template, title });
    } else {
      console.warn(`No template registered for key: ${key}`);
    }
  }
  close(title: string, template: TemplateRef<any>) {
    this.modalState.next({ open: false, template, title });
  }

  registerTemplate(key: string, template: any) {
    this.templates.set(key, template);
  }
}
