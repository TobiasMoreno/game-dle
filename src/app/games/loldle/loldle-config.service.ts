import { Injectable } from '@angular/core';
import { GameColumn, GameRow } from '../../shared/components/game-board';
import { CharacterField } from '../../shared/components/game-result';
import { LoLCharacter } from './loldle-game.service';
import { ComparisonStatus } from '../../shared/components/game-cell/game-cell.component';
import { CompareStatus as LoLCompareStatus } from './loldle-game.service';

@Injectable({ providedIn: 'root' })
export class LoldleConfigService {
  
  getBoardColumns(): GameColumn[] {
    return [
      { key: 'name', label: 'Nombre', icon: '👤', width: 'w-24', height: 'h-24', type: 'image' },
      { key: 'genero', label: 'Género', icon: '⚧', width: 'w-24', height: 'h-24', type: 'text' },
      { key: 'posicion', label: 'Posición', icon: '🎯', width: 'w-24', height: 'h-24', type: 'text' },
      { key: 'especie', label: 'Especie', icon: '🧬', width: 'w-24', height: 'h-24', type: 'text' },
      { key: 'recurso', label: 'Recurso', icon: '⚡', width: 'w-24', height: 'h-24', type: 'text' },
      { key: 'tipo_de_gama', label: 'Tipo', icon: '🗡️', width: 'w-24', height: 'h-24', type: 'text' },
      { key: 'region', label: 'Región', icon: '🗺️', width: 'w-24', height: 'h-24', type: 'text' },
      { key: 'anio_de_lanzamiento', label: 'Año', icon: '📅', width: 'w-24', height: 'h-24', type: 'numeric' }
    ];
  }

  getCharacterFields(targetCharacter: LoLCharacter | null, getFormattedValue: (field: string, value: any) => string): CharacterField[] {
    if (!targetCharacter) return [];
    
    return [
      {
        key: 'nombre',
        label: 'Nombre',
        icon: '👤',
        value: targetCharacter.nombre
      },
      {
        key: 'genero',
        label: 'Género',
        icon: '⚧',
        value: targetCharacter.genero || 'N/A'
      },
      {
        key: 'posicion',
        label: 'Posición',
        icon: '🎯',
        value: targetCharacter.posicion?.join(', ') || 'N/A'
      },
      {
        key: 'especie',
        label: 'Especie',
        icon: '🧬',
        value: targetCharacter.especie?.join(', ') || 'N/A'
      },
      {
        key: 'recurso',
        label: 'Recurso',
        icon: '⚡',
        value: targetCharacter.recurso?.join(', ') || 'N/A'
      },
      {
        key: 'tipo_de_gama',
        label: 'Tipo de Gama',
        icon: '🗡️',
        value: targetCharacter.tipo_de_gama?.join(', ') || 'N/A'
      },
      {
        key: 'region',
        label: 'Región',
        icon: '🗺️',
        value: targetCharacter.region?.join(', ') || 'N/A'
      },
      {
        key: 'anio_de_lanzamiento',
        label: 'Año de Lanzamiento',
        icon: '📅',
        value: targetCharacter.anio_de_lanzamiento,
        formatter: (value: any) => getFormattedValue('anio_de_lanzamiento', value)
      }
    ];
  }

  mapStatus(status: LoLCompareStatus): ComparisonStatus {
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