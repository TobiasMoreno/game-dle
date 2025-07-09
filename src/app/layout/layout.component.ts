import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  isSidebarOpen = false;
  private themeService = inject(ThemeService);

  get footerTheme() {
    return this.themeService.getFooterTheme();
  }

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
