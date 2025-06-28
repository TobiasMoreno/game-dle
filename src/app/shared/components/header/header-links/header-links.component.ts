import { Component } from '@angular/core';

@Component({
  selector: 'app-header-links',
  imports: [],
  templateUrl: './header-links.component.html',
  styleUrl: './header-links.component.scss',
})
export class HeaderLinksComponent {
  isDropdownOpen = false;

  toggleDropdown(event: Event): void {
    event.preventDefault();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    console.log('Cerrar sesión');
    this.isDropdownOpen = false;
  }
}
