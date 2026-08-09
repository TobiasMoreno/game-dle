import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SupportDialogService {
  readonly alias = 'tobiassmoreno';
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
