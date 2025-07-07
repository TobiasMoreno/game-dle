import { Injectable } from '@angular/core';
import { MusicControlsTheme } from '../../shared/components/music-controls/music-controls.component';
import { GuessInputTheme } from '../../shared/components/guess-input/guess-input.component';
import { GameBoardTheme } from '../../shared/components/game-board';
import { GameResultConfig } from '../../shared/components/game-result';
import { LoLCharacter } from './loldle-game.service';

@Injectable({ providedIn: 'root' })
export class LoldleThemeService {
  
  getMusicTheme(): MusicControlsTheme {
    return {
      buttonBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      buttonHoverBg: 'hover:from-yellow-400 hover:to-orange-400',
      buttonTextColor: 'text-white',
      volumeTextColor: '#1f2937',
      sliderBg: '#fef3c7',
      sliderThumbBg: '#c89b3c'
    };
  }

  getInputTheme(): GuessInputTheme {
    return {
      inputBg: '#f0e6d2',
      inputBorder: 'border-yellow-400',
      inputText: 'text-blue-900',
      inputPlaceholder: 'placeholder-yellow-600',
      dropdownBg: 'bg-yellow-50',
      dropdownBorder: 'border-yellow-400',
      dropdownItemHoverBg: 'hover:bg-yellow-200',
      buttonBg: 'bg-gradient-to-r from-orange-500 to-red-600',
      buttonText: 'text-white',
      buttonHoverBg: 'hover:from-orange-400 hover:to-red-500'
    };
  }

  getBoardTheme(): GameBoardTheme {
    return {
      headerBg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
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
    targetCharacter: LoLCharacter | null,
    characterType: string
  ): GameResultConfig {
    return {
      gameWon,
      currentAttempt,
      maxAttempts,
      targetCharacter,
      characterType,
      theme: {
        primaryBg: 'linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%)',
        secondaryBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        textColor: '#92400e',
        borderColor: '#f59e0b',
        icon: '⚔️',
        winIcon: '🏆',
        loseIcon: '💀'
      }
    };
  }
} 