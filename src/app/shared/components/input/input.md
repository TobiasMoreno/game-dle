# Input Generic Component

## Descripción

El componente `InputGenericComponent` es un campo de entrada versátil y reutilizable que implementa `ControlValueAccessor`. Diseñado para ser altamente configurable, soporta iconos tanto a la izquierda como a la derecha, un botón de limpieza opcional, validación de errores, y estados de password toggle. Sigue la metodología BEM para CSS y está completamente integrado con Reactive Forms.

## Instalación

Este componente es standalone y forma parte del sistema de diseño del proyecto. Para usarlo, solo necesitas importarlo en tu módulo o componente:

```typescript
import { InputGenericComponent } from "@shared/components/input-generic/input-generic.component";
```

## API

### Inputs

| Nombre          | Tipo              | Default | Descripción                                                    |
|-----------------|-------------------|---------|----------------------------------------------------------------|
| label           | `string`          | `''`    | Etiqueta del input                                            |
| type            | `string`          | `'text'`| Tipo de input (text, password, email, etc)                    |
| placeholder     | `string`          | `''`    | Placeholder del input                                         |
| leftImageUrl    | `string`          | -       | URL del ícono izquierdo (opcional)                           |
| rightImageUrl   | `string`          | -       | URL del ícono derecho (opcional)                             |
| showClearButton | `boolean`         | `false` | Muestra/oculta el botón de limpieza                          |
| errors          | `ValidationErrors | null`   | Errores de validación del formulario                         |
| backgroundColor | `string`          | -       | Color de fondo personalizado para el input (opcional)        |

### Outputs

| Nombre         | Tipo                | Descripción                                      |
|----------------|---------------------|--------------------------------------------------|
| rightIconClick | `EventEmitter<void>`| Emite cuando se hace click en el ícono derecho |

### Métodos

| Nombre         | Descripción                                     |
|----------------|-------------------------------------------------|
| clearInput()   | Limpia el contenido del input                   |
| onInputChange()| Maneja los cambios en el valor del input        |
| onTouch()      | Marca el control como tocado para validaciones  |

## Ejemplo de Uso

```typescript
@Component({
  template: `
    <form [formGroup]="exampleForm">
      <app-input-generic
        label="Contraseña"
        [type]="showPassword ? 'text' : 'password'"
        placeholder="Ingrese contraseña"
        rightImageUrl="/assets/img/eye.svg"
        [showClearButton]="true"
        [errors]="exampleForm.get('password')?.errors"
        formControlName="password"
        (rightIconClick)="togglePassword()">
      </app-input-generic>

      <!-- Ejemplo con color de fondo personalizado -->
      <app-input-generic
        label="Email con fondo personalizado"
        type="email"
        placeholder="Ingrese su email"
        backgroundColor="#f0f8ff"
        [errors]="exampleForm.get('email')?.errors"
        formControlName="email">
      </app-input-generic>
    </form>
  `
})
export class ExampleComponent {
  exampleForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]]
  });
}
```

## Variables SCSS

```scss
$color-primary: #2e2473;
$color-error: #dc2626;
$color-border: #e5e7eb;
$color-text: #1f2937;
$border-radius: 6px;
$transition-duration: 0.2s;

.input-container {
  &:has(.input-container__input:focus) {
    border-color: $color-primary;
  }
}
```

## Mensajes de Error

El componente muestra automáticamente mensajes de error para las siguientes validaciones:
- required: "Este campo es requerido"
- email: "Email inválido"
- minlength: "Mínimo X caracteres"

## Accesibilidad

- Implementa `aria-label` para los iconos
- Asocia labels con inputs usando IDs
- Soporta navegación por teclado
- Indica estados de error con `aria-invalid`

## Internacionalización

Los mensajes de error y placeholders pueden ser internacionalizados usando ngx-translate:

```html
<app-input-generic
  [placeholder]="'GENERIC_INPUT.PLACEHOLDER' | translate"
  ...>
</app-input-generic>
```