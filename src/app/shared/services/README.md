# Servicios Compartidos - Generalización de Juegos de Personajes

## Descripción

Este directorio contiene servicios que han sido generalizados para reducir la duplicación de código entre los diferentes juegos de personajes (One Piece DLE, LoL DLE, etc.).

## Servicios Principales

### GuessHandlerService

El `GuessHandlerService` es el servicio principal que generaliza la lógica de adivinación común entre juegos de personajes.

#### Funcionalidades:

1. **Validación de Intentos** (`validateGuess`)
   - Valida que el intento no esté vacío
   - Verifica que el personaje no haya sido adivinado antes
   - Busca el personaje en la lista de personajes disponibles
   - Retorna un resultado con información sobre la validez y el personaje encontrado

2. **Procesamiento de Resultados** (`processGuessResult`)
   - Determina si el jugador ganó, perdió o debe continuar
   - Maneja la lógica de intentos máximos
   - Retorna información estructurada sobre el estado del juego

3. **Actualización de Lista Filtrada** (`updateFilteredCharacters`)
   - Actualiza la lista de personajes filtrados después de cada intento
   - Excluye personajes ya adivinados
   - Utiliza el servicio específico del juego para el filtrado

#### Uso en los Componentes:

```typescript
// En el componente del juego
submitGuess(): void {
  // Validar el intento
  const validation = this.guessHandler.validateGuess(
    this.currentGuess,
    this.characters,
    this.guesses,
    this.gameService,
    'personaje' // o 'campeón' para LoL
  );

  if (!validation.isValid) {
    this.errorMessage = validation.errorMessage!;
    return;
  }

  // Procesar el resultado
  const result = this.guessHandler.processGuessResult(
    guessResult,
    this.currentAttempt,
    this.maxAttempts,
    this.targetCharacter!,
    guessedCharacter
  );

  // Manejar el resultado
  if (result.gameWon) {
    this.gameWon = true;
    this.completeGame(true, this.currentAttempt + 1, result.gameData);
  } else if (!result.shouldContinue) {
    this.completeGame(false, this.maxAttempts, result.gameData);
  } else {
    this.saveCurrentProgress();
  }
}
```

## Beneficios de la Generalización

1. **Reducción de Código Duplicado**: La lógica común de validación y procesamiento se centraliza en un solo lugar.

2. **Consistencia**: Todos los juegos de personajes manejan la adivinación de la misma manera.

3. **Mantenibilidad**: Los cambios en la lógica de adivinación solo necesitan hacerse en un lugar.

4. **Extensibilidad**: Agregar nuevos juegos de personajes es más fácil ya que pueden reutilizar la lógica existente.

5. **Tipado Seguro**: El servicio utiliza genéricos para mantener la seguridad de tipos.

## Interfaces

### BaseCharacter
```typescript
export interface BaseCharacter {
  id: number;
  nombre: string;
  [key: string]: any;
}
```

### GuessValidationResult
```typescript
export interface GuessValidationResult {
  isValid: boolean;
  errorMessage?: string;
  guessedCharacter?: BaseCharacter;
}
```

### GuessSubmissionResult
```typescript
export interface GuessSubmissionResult {
  gameWon: boolean;
  shouldContinue: boolean;
  gameData: any;
}
```

## Juegos que Utilizan el Servicio

- **One Piece DLE**: Utiliza `'personaje'` como tipo de personaje
- **LoL DLE**: Utiliza `'campeón'` como tipo de personaje

## Futuras Mejoras

1. **Mensajes de Error Personalizables**: Permitir que cada juego defina sus propios mensajes de error.
2. **Validaciones Específicas**: Agregar validaciones específicas por juego si es necesario.
3. **Métricas de Rendimiento**: Agregar métricas para medir el rendimiento de la adivinación. 