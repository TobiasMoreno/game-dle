import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-lol-game-shell',
  imports: [RouterLink, FooterComponent],
  templateUrl: './lol-game-shell.component.html',
})
export class LolGameShellComponent {
  title = input.required<string>();
  instructions = input.required<string>();
  score = input(0);
  rounds = input(0);
}
