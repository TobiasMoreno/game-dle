import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { SupportDialogService } from '../../services/support-dialog.service';

@Component({
  selector: 'app-support-dialog',
  imports: [],
  templateUrl: './support-dialog.component.html',
  styleUrl: './support-dialog.component.css'
})
export class SupportDialogComponent {
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('supportDialog');
  readonly support = inject(SupportDialogService);
  readonly copyStatus = signal<'idle' | 'copied' | 'error'>('idle');

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      const shouldOpen = this.support.isOpen();

      if (!dialog) {
        return;
      }

      if (shouldOpen && !dialog.open) {
        this.copyStatus.set('idle');
        dialog.showModal();
      } else if (!shouldOpen && dialog.open) {
        dialog.close();
      }
    });
  }

  closeFromBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) {
      this.support.close();
    }
  }

  async copyAlias(): Promise<void> {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(this.support.alias);
      this.copyStatus.set('copied');
    } catch {
      this.copyStatus.set('error');
    }
  }
}
