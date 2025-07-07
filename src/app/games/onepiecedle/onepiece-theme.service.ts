import { Injectable } from '@angular/core';
import { MusicControlsTheme } from '../../shared/components/music-controls/music-controls.component';
import { GuessInputTheme } from '../../shared/components/guess-input/guess-input.component';
import { GameBoardTheme } from '../../shared/components/game-board';
import { GameResultConfig } from '../../shared/components/game-result';
import { OnePieceCharacter } from './onepiece-game.service';

@Injectable({ providedIn: 'root' })
export class OnePieceThemeService {
  
  getMusicTheme(): MusicControlsTheme {
    return {
      buttonBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      buttonHoverBg: 'hover:from-yellow-400 hover:to-orange-400',
      buttonTextColor: 'text-black',
      volumeTextColor: '#1f2937',
      sliderBg: '#fef3c7',
      sliderThumbBg: '#f59e0b'
    };
  }

  getInputTheme(): GuessInputTheme {
    return {
      inputBg: '#fff7ed',
      inputBorder: 'border-orange-300',
      inputText: 'text-orange-700',
      inputPlaceholder: 'placeholder-orange-400',
      dropdownBg: 'bg-orange-50',
      dropdownBorder: 'border-orange-300',
      dropdownItemHoverBg: 'hover:bg-orange-200',
      buttonBg: 'bg-red-500',
      buttonText: 'text-white',
      buttonHoverBg: 'hover:bg-red-600'
    };
  }

  getBoardTheme(): GameBoardTheme {
    return {
      headerBg: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      headerText: 'text-white',
      cellTheme: {
        correctBg: 'bg-green-500',
        partialBg: 'bg-yellow-400',
        incorrectBg: 'bg-red-500',
        correctText: 'text-white',
        partialText: 'text-white',
        incorrectText: 'text-white',
        imageOverlayBg: 'bg-black bg-opacity-50',
        imageOverlayText: 'text-white'
      }
    };
  }

  getGameResultConfig(
    gameWon: boolean,
    currentAttempt: number,
    maxAttempts: number,
    targetCharacter: OnePieceCharacter | null,
    characterType: string
  ): GameResultConfig {
    return {
      gameWon,
      currentAttempt,
      maxAttempts,
      targetCharacter,
      characterType,
      theme: {
        primaryBg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        secondaryBg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        textColor: '#c2410c',
        borderColor: '#f59e0b',
        icon: '🏴‍☠️',
        winIcon: '🏆',
        loseIcon: '💀'
      }
    };
  }
} 