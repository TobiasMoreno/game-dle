import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
  input,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface GuessSuggestion {
  nombre: string;
  img_url?: string;
}

export interface GuessInputTheme {
  inputBg?: string;
  inputBorder?: string;
  inputText?: string;
  inputPlaceholder?: string;
  dropdownBg?: string;
  dropdownBorder?: string;
  dropdownItemHoverBg?: string;
  buttonBg?: string;
  buttonText?: string;
  buttonHoverBg?: string;
}

@Component({
  selector: 'app-guess-input',
  imports: [FormsModule],
  template: `
    <div class="relative w-full max-w-md mx-auto mt-2 ">
      <div class="flex space-x-2 w-full ">
        <input
          #inputEl
          type="text"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [class]="'flex-1 px-4 py-3 rounded-t-lg rounded-b-none text-center focus:z-30 focus:outline-none focus:ring-2 font-medium border-2 rounded-lg' +
            (theme().inputBorder || 'border-black') + ' ' +
            (theme().inputText || 'text-gray-700') + ' ' +
            (theme().inputPlaceholder || 'placeholder-gray-400') + ' ' +
            (theme().inputBg ? '' : 'bg-gray-50')"
          [style.background]="theme().inputBg || null"
          [(ngModel)]="inputValue"
          (input)="onInput($event)"
          (keyup.enter)="onSubmit()"
          (focus)="showDropdown = true"
          (blur)="onBlur()"
          autocomplete="off"
        />
        <button
          (click)="onSubmit()"
          [disabled]="!inputValue.trim() || disabled()"
          [class]="'px-6 py-3 rounded-lg font-bold ' +
            (theme().buttonBg || 'bg-blue-600') + ' ' +
            (theme().buttonText || 'text-white') + ' ' +
            (theme().buttonHoverBg || 'hover:bg-blue-700') + ' disabled:bg-gray-300 disabled:cursor-not-allowed'"
        >
          Adivinar
        </button>
      </div>
      @if (showDropdown && filteredSuggestions.length > 0) {
        <ul class="autocomplete-dropdown w-full rounded-b-lg shadow-md z-20 absolute left-0 top-full max-h-60 overflow-y-auto"
          [class]="(theme().dropdownBg || 'bg-white') + ' ' + (theme().dropdownBorder || 'border-x-2 border-b-2 border-gray-300')">
          @for (suggestion of filteredSuggestions; track suggestion.nombre) {
            <li
              (mousedown)="onSelectSuggestion(suggestion)"
              class="px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center autocomplete-item font-medium border-b last:border-b-0"
              [class]="(theme().dropdownItemHoverBg || 'hover:bg-blue-100') + ' ' + (theme().dropdownBorder || 'border-gray-200') + ' px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center autocomplete-item font-medium border-b last:border-b-0'"
            >
              @if (suggestion.img_url) {
                <div
                  class="w-8 h-8 rounded-full mr-3 border-2 flex items-center justify-center"
                  [class]="theme().inputBorder || 'border-blue-300'"
                  [style.background]="theme().inputBg || null"
                >
                  <img
                    [src]="suggestion.img_url"
                    [alt]="suggestion.nombre"
                    class="w-full h-full rounded-full object-cover"
                  />
                </div>
              }
              <span class="flex-1">{{ suggestion.nombre }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .autocomplete-dropdown {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        animation: fadeIn 0.15s;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      input:disabled {
        background: #f3f4f6;
        color: #9ca3af;
      }
      button:disabled {
        opacity: 0.7;
      }
    `,
  ],
})
export class GuessInputComponent implements OnInit {
  placeholder = input<string>('Escribe tu respuesta...');
  disabled = input<boolean>(false);
  suggestions = input<GuessSuggestion[]>([]);
  value = input<string>('');
  theme = input<GuessInputTheme>({});
  valueChange = output<string>();
  submit = output<void>();
  selectSuggestion = output<GuessSuggestion>();

  @ViewChild('inputEl', { static: true }) inputEl!: ElementRef<HTMLInputElement>;

  inputValue = '';
  showDropdown = false;
  filteredSuggestions: GuessSuggestion[] = [];
  private blurTimeout: any;
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.inputValue = this.value();
    this.filterSuggestions();
    this.destroyRef.onDestroy(() => clearTimeout(this.blurTimeout));
  }

  onInput(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.inputValue);
    this.filterSuggestions();
    this.showDropdown = true;
  }

  onSubmit() {
    this.submit.emit();
    this.showDropdown = false;
  }

  onSelectSuggestion(suggestion: GuessSuggestion) {
    this.inputValue = suggestion.nombre;
    this.valueChange.emit(this.inputValue);
    this.selectSuggestion.emit(suggestion);
    this.showDropdown = false;
    setTimeout(() => this.inputEl?.nativeElement.blur(), 0);
  }

  onBlur() {
    this.blurTimeout = setTimeout(() => {
      this.showDropdown = false;
    }, 120);
  }

  filterSuggestions() {
    const val = this.inputValue.trim().toLowerCase();
    if (!val) {
      this.filteredSuggestions = this.suggestions().slice(0, 10);
      return;
    }
    this.filteredSuggestions = this.suggestions()
      .filter((s: GuessSuggestion) => s.nombre.toLowerCase().includes(val))
      .slice(0, 10);
  }
}
