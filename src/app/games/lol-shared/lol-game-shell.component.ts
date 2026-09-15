import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GameEditorialContentComponent } from '../../shared/components/game-editorial-content/game-editorial-content.component';

@Component({
  selector: 'app-lol-game-shell',
  imports: [RouterLink, FooterComponent, GameEditorialContentComponent],
  templateUrl: './lol-game-shell.component.html',
})
export class LolGameShellComponent {
  gameId = input.required<string>();
  title = input.required<string>();
  instructions = input.required<string>();
  score = input(0);
  rounds = input(0);
}
