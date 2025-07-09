import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  isSidebarOpen = false;
  private themeService = inject(ThemeService);

  get colorMode() {
    return this.themeService.getColorMode();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleColorMode() {
    this.themeService.toggleColorMode();
  }
}
