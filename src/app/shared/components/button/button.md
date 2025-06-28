# Button Component

## Descripción

El Button Component es un componente reutilizable y altamente personalizable que implementa diferentes variantes de botones siguiendo los principios de diseño del sistema. Utiliza la metodología BEM para su estructura SCSS y soporta múltiples estados, tamaños y colores.

## Instalación

El componente está disponible como parte del sistema de diseño. No requiere instalación adicional.

## API

### Inputs

| Nombre   | Tipo                                                               | Default   | Descripción             |
| -------- | ------------------------------------------------------------------ | --------- | ----------------------- |
| variant  | 'primary' \| 'secondary' \| 'outline' \| 'ghost'                   | 'primary' | Estilo visual del botón |
| size     | 'small' \| 'medium' \| 'large'                                     | 'medium'  | Tamaño del botón        |
| color    | 'default' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'dark' | 'default' | Color del botón         |
| disabled | boolean                                                            | false     | Estado deshabilitado    |
| loading  | boolean                                                            | false     | Estado de carga         |

## Uso

### Importación

```typescript
import { ButtonComponent } from "@shared/components/button/button.component";
```

### Ejemplos Básicos

#### Variantes

```html
<!-- Botón Primario -->
<app-button variant="primary"> Botón Primario </app-button>

<!-- Botón Secundario -->
<app-button variant="secondary"> Botón Secundario </app-button>

<!-- Botón Outline -->
<app-button variant="outline"> Botón Outline </app-button>

<!-- Botón Ghost -->
<app-button variant="ghost"> Botón Ghost </app-button>
```

#### Tamaños

```html
<!-- Pequeño -->
<app-button size="small"> Botón Pequeño </app-button>

<!-- Mediano (default) -->
<app-button size="medium"> Botón Mediano </app-button>

<!-- Grande -->
<app-button size="large"> Botón Grande </app-button>
```

#### Colores

```html
<!-- Default -->
<app-button color="default">Default</app-button>

<!-- Success -->
<app-button color="success">Success</app-button>

<!-- Error -->
<app-button color="error">Error</app-button>

<!-- Warning -->
<app-button color="warning">Warning</app-button>

<!-- Info -->
<app-button color="info">Info</app-button>
```

#### Estados

```html
<!-- Loading -->
<app-button [loading]="true"> Cargando... </app-button>

<!-- Disabled -->
<app-button [disabled]="true"> Deshabilitado </app-button>
```

## Estilos

### Variables SCSS

El componente utiliza las siguientes variables globales definidas en `_variables.scss`:

```scss
// Colores Base
$color-default: #2e2473;
$color-green: #00ce7e;
$color-red: #cb4141;
$color-dark: #1f2937;

// Estados
$color-default-hover: #6c69bf;
$color-default-press: #161041;
$color-default-disabled: rgba(46, 36, 115, 0.3);

// Otros
$radius-base: 4px;
$transition-base: 0.2s ease-in-out;
```

### Configuración de Tamaños

```scss
$btn-sizes: (
  "small": (
    padding: 4px 8px,
    font-size: 12px,
    spinner-size: 10px,
  ),
  "medium": (
    padding: 6px 16px,
    font-size: 14px,
    spinner-size: 10px,
  ),
  "large": (
    padding: 8px 30px,
    font-size: 16px,
    spinner-size: 10px,
  ),
);
```

## Metodología BEM

### Estructura de Clases

- Bloque: `.btn`
- Elementos:
  - `.btn__content`
  - `.btn__label`
  - `.btn__spinner`
- Modificadores:
  - `.btn--primary`
  - `.btn--secondary`
  - `.btn--outline`
  - `.btn--ghost`
  - `.btn--small`
  - `.btn--medium`
  - `.btn--large`
  - `.btn--loading`
  - `.btn--disabled`

## Accesibilidad

- Cursor `not-allowed` en estados deshabilitados
- Estados hover y focus bien definidos
- Contraste adecuado en todos los estados
- Soporte para lectores de pantalla mediante estados apropiados

## Internacionalización

El componente es compatible con ngx-translate:

```html
<app-button variant="primary"> {{ "BUTTON.SAVE" | translate }} </app-button>
```

## Mejores Prácticas

1. **Uso de Colores**

   - Utilizar siempre los colores del sistema definidos en variables
   - Evitar colores hardcodeados

2. **Tamaños**

   - Usar los tamaños predefinidos
   - Mantener consistencia en toda la aplicación

3. **Estados**

   - Siempre manejar estados disabled y loading
   - Proporcionar feedback visual en interacciones

4. **Rendimiento**
   - Usar la detección de cambios OnPush
   - Evitar cálculos innecesarios en el spinner

## Ejemplos Avanzados

### Botón con Loading State

```typescript
export class MyComponent {
  isLoading = false;

  async handleClick() {
    this.isLoading = true;
    try {
      await this.myService.saveData();
    } finally {
      this.isLoading = false;
    }
  }
}
```

```html
<app-button variant="primary" color="success" [loading]="isLoading" (click)="handleClick()"> {{ isLoading ? 'Guardando...' : 'Guardar' }} </app-button>
```
