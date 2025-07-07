import { Injectable } from '@angular/core';
import { GameColumn, GameRow } from '../../shared/components/game-board';
import { CharacterField } from '../../shared/components/game-result';
import { OnePieceCharacter } from './onepiece-game.service';
import { ComparisonStatus } from '../../shared/components/game-cell/game-cell.component';
import { CompareStatus } from './onepiece-game.service';

@Injectable({ providedIn: 'root' })
export class OnePieceConfigService {
  
  getBoardColumns(): GameColumn[] {
    return [
      {
        key: 'name',
        label: 'Nombre',
        icon: '👤',
        width: 'w-20',
        height: 'h-20',
        type: 'image',
      },
      {
        key: 'genero',
        label: 'Género',
        icon: '⚧',
        width: 'w-24',
        height: 'h-24',
        type: 'text',
      },
      {
        key: 'afiliacion',
        label: 'Afiliación',
        icon: '🏴',
        width: 'w-24',
        height: 'h-24',
        type: 'text',
      },
      {
        key: 'fruta_del_diablo',
        label: 'Fruta',
        icon: '🍎',
        width: 'w-24',
        height: 'h-24',
        type: 'text',
      },
      {
        key: 'hakis',
        label: 'Hakis',
        icon: '⚡',
        width: 'w-24',
        height: 'h-24',
        type: 'text',
      },
      {
        key: 'ultima_recompensa',
        label: 'Recompensa',
        icon: '💰',
        width: 'w-24',
        height: 'h-24',
        type: 'numeric',
      },
      {
        key: 'altura',
        label: 'Altura',
        icon: '📏',
        width: 'w-24',
        height: 'h-24',
        type: 'numeric',
      },
      {
        key: 'origen',
        label: 'Origen',
        icon: '🗺️',
        width: 'w-24',
        height: 'h-24',
        type: 'text',
      },
      {
        key: 'primer_arco',
        label: 'Primer Arco',
        icon: '📚',
        width: 'w-24',
        height: 'h-24',
        type: 'numeric',
      },
    ];
  }

  getCharacterFields(targetCharacter: OnePieceCharacter | null, getFormattedValue: (field: string, value: any) => string): CharacterField[] {
    if (!targetCharacter) return [];
    
    return [
      {
        key: 'nombre',
        label: 'Nombre',
        icon: '👤',
        value: targetCharacter.nombre,
      },
      {
        key: 'genero',
        label: 'Género',
        icon: '⚧',
        value: targetCharacter.genero || 'N/A',
      },
      {
        key: 'afiliacion',
        label: 'Afiliación',
        icon: '🏴',
        value: targetCharacter.afiliacion || 'N/A',
      },
      {
        key: 'fruta_del_diablo',
        label: 'Fruta',
        icon: '🍎',
        value: targetCharacter.fruta_del_diablo || 'N/A',
      },
      {
        key: 'hakis',
        label: 'Hakis',
        icon: '⚡',
        value: targetCharacter.hakis?.join(', ') || 'N/A',
      },
      {
        key: 'ultima_recompensa',
        label: 'Última recompensa',
        icon: '💰',
        value: targetCharacter.ultima_recompensa,
        formatter: (value: any) => getFormattedValue('ultima_recompensa', value),
      },
      {
        key: 'altura',
        label: 'Altura',
        icon: '📏',
        value: targetCharacter.altura,
        formatter: (value: any) => getFormattedValue('altura', value),
      },
      {
        key: 'origen',
        label: 'Origen',
        icon: '🗺️',
        value: targetCharacter.origen || 'N/A',
      },
    ];
  }

  mapStatus(status: CompareStatus): ComparisonStatus {
    switch (status) {
      case 'correct':
        return 'correct';
      case 'partial':
        return 'partial';
      case 'wrong':
        return 'incorrect';
      default:
        return 'incorrect';
    }
  }
} 