import { Component } from '@angular/core';
import { HeaderLinksComponent } from "./header-links/header-links.component";

@Component({
  selector: 'app-header',
  imports: [HeaderLinksComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
