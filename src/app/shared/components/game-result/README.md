# GameResultComponent - Componente Genérico de Resultado

## Descripción

El `GameResultComponent` es un componente reutilizable que muestra el resultado final de cualquier juego de personajes (One Piece DLE, LoL DLE, etc.). Proporciona una interfaz consistente y personalizable para mostrar si el jugador ganó o perdió, junto con la información del personaje objetivo.

## Características

- ✅ **Reutilizable**: Funciona con cualquier juego de personajes
- ✅ **Personalizable**: Temas visuales configurables
- ✅ **Flexible**: Campos de personaje dinámicos
- ✅ **Animado**: Efectos visuales suaves
- ✅ **Responsive**: Se adapta a diferentes tamaños de pantalla

## Uso Básico

```typescript
// En el componente del juego
import { GameResultComponent, GameResultConfig, CharacterField } from '../../shared/components/game-result';

@Component({
  imports: [GameResultComponent],
  // ...
})
export class MiJuegoComponent {
  
  getGameResultConfig(): GameResultConfig {
    return {
      gameWon: this.gameWon,
      currentAttempt: this.currentAttempt,
      maxAttempts: this.maxAttempts,
      targetCharacter: this.targetCharacter,
      characterType: 'personaje', // o 'campeón', etc.
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

  getCharacterFields(): CharacterField[] {
    return [
      {
        key: 'nombre',
        label: 'Nombre',
        icon: '👤',
        value: this.targetCharacter.nombre
      },
      {
        key: 'poder',
        label: 'Poder',
        icon: '⚡',
        value: this.targetCharacter.poder,
        formatter: (value) => this.formatPower(value)
      }
    ];
  }

  onPlayAgain(): void {
    // Lógica para reiniciar el juego
  }
}
```

```html
<!-- En el template -->
<app-game-result
  [config]="getGameResultConfig()"
  [characterFields]="getCharacterFields()"
  [getCharacterImageUrl]="getCharacterImageUrl.bind(this)"
  (playAgain)="onPlayAgain()">
</app-game-result>
```

## Interfaces

### GameResultConfig
```typescript
interface GameResultConfig {
  gameWon: boolean;           // Si el jugador ganó
  currentAttempt: number;     // Intentos realizados
  maxAttempts: number;        // Máximo de intentos
  targetCharacter: any;       // Personaje objetivo
  characterType: string;      // Tipo de personaje ('personaje', 'campeón', etc.)
  theme: {
    primaryBg: string;        // Fondo del header
    secondaryBg: string;      // Fondo de la tarjeta
    textColor: string;        // Color del texto
    borderColor: string;      // Color del borde
    icon: string;            // Icono del juego
    winIcon: string;         // Icono de victoria
    loseIcon: string;        // Icono de derrota
  };
}
```

### CharacterField
```typescript
interface CharacterField {
  key: string;                    // Clave única del campo
  label: string;                  // Etiqueta mostrada
  icon: string;                   // Icono del campo
  value: any;                     // Valor del campo
  formatter?: (value: any) => string; // Función de formateo opcional
}
```

## Temas Predefinidos

### One Piece Theme
```typescript
{
  primaryBg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
  secondaryBg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
  textColor: '#c2410c',
  borderColor: '#f59e0b',
  icon: '🏴‍☠️',
  winIcon: '🏆',
  loseIcon: '💀'
}
```

### LoL Theme
```typescript
{
  primaryBg: 'linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%)',
  secondaryBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  textColor: '#92400e',
  borderColor: '#f59e0b',
  icon: '⚔️',
  winIcon: '🏆',
  loseIcon: '💀'
}
```

## Eventos

### playAgain
Se emite cuando el usuario hace clic en "Jugar de nuevo".

```typescript
(playAgain)="onPlayAgain()"
```

## Personalización Avanzada

### Campos con Formateo Personalizado
```typescript
{
  key: 'recompensa',
  label: 'Recompensa',
  icon: '💰',
  value: character.recompensa,
  formatter: (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return value.toString();
  }
}
```

### Campos con Arrays
```typescript
{
  key: 'habilidades',
  label: 'Habilidades',
  icon: '⚡',
  value: character.habilidades?.join(', ') || 'N/A'
}
```

## Beneficios

1. **Consistencia**: Todos los juegos muestran el resultado de la misma manera
2. **Mantenibilidad**: Cambios en el diseño se aplican a todos los juegos
3. **Reutilización**: No hay que reescribir el código de resultado
4. **Flexibilidad**: Cada juego puede personalizar su tema y campos
5. **Escalabilidad**: Fácil agregar nuevos juegos

## Ejemplo Completo

Ver el archivo `onepiecedle.component.ts` para un ejemplo completo de implementación. 