import { Component, input, output } from '@angular/core';

export interface GameResultConfig {
  gameWon: boolean;
  currentAttempt: number;
  maxAttempts: number;
  targetCharacter: any;
  characterType: string; // 'personaje', 'campeón', etc.
  theme: {
    primaryBg: string;
    secondaryBg: string;
    textColor: string;
    borderColor: string;
    icon: string;
    winIcon: string;
    loseIcon: string;
  };
}

export interface CharacterField {
  key: string;
  label: string;
  icon: string;
  value: any;
  formatter?: (value: any) => string;
}

@Component({
  selector: 'app-game-result',
  standalone: true,
  imports: [],
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.css']
})
export class GameResultComponent {
  // Inputs
  config = input.required<GameResultConfig>();
  characterFields = input.required<CharacterField[]>();
  getCharacterImageUrl = input.required<(characterName: string) => string>();

  // Outputs
  playAgain = output<void>();

  getResultIcon(): string {
    return this.config().gameWon ? this.config().theme.winIcon : this.config().theme.loseIcon;
  }

  getResultTitle(): string {
    return this.config().gameWon ? '¡Felicidades! ¡Ganaste!' : '¡Game Over!';
  }

  getResultTitleClass(): string {
    return this.config().gameWon ? 'text-yellow-300' : 'text-red-200';
  }

  getFormattedValue(field: CharacterField): string {
    if (field.formatter) {
      return field.formatter(field.value);
    }
    return field.value?.toString() || 'N/A';
  }

  onPlayAgain(): void {
    this.playAgain.emit();
  }
} 