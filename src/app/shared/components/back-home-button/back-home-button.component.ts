import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-home-button',
  imports: [],
  templateUrl: './back-home-button.component.html',
  styleUrl: './back-home-button.component.css',
})
export class BackHomeButtonComponent {
  background = input<string>('rgb(107 114 128)');
  textColor = input<string>('white');
  disabled = input<boolean>(false);

  private readonly router = inject(Router);

  goHome(): void {
    void this.router.navigate(['/home']);
  }
}
