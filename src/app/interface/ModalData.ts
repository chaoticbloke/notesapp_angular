import { TemplateRef } from '@angular/core';

export interface ModalData {
  title: string;
  template: TemplateRef<any>;
  open: boolean;
}
