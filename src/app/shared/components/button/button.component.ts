import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  /** Tamaño del botón */
  size = input.required<
    'small' | 'medium' | 'large' | 'square' | 'ultra-large' | 'ultra-large-minor-height'
  >();

  /** Variante del botón */
  variant = input.required<'primary' | 'secondary' | 'outline' | 'ghost'>();

  /** Estado del botón */
  disabled = input<boolean>();

  /** Estado de carga del botón */
  loading = input<boolean>(false);

  /** Color del botón */
  color = input.required<
    | 'default'
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'dark'
    | 'green'
    | 'red'
    | 'gray'
  >();

  /** Estado del botón */
  bgWhite = input<boolean>(false);
}
