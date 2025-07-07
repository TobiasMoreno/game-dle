import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  input,
  output,
  OnChanges,
  SimpleChanges,
  HostListener
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
  templateUrl: './guess-input.component.html',
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
export class GuessInputComponent implements OnInit, OnChanges {
  placeholder = input<string>('Escribe tu respuesta...');
  disabled = input<boolean>(false);
  suggestions = input<GuessSuggestion[]>([]);
  value = input<string>('');
  theme = input<GuessInputTheme>({});
  valueChange = output<string>();
  submit = output<void>();
  selectSuggestion = output<GuessSuggestion>();

  @ViewChild('inputEl', { static: true }) inputEl!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownEl') dropdownEl?: ElementRef<HTMLUListElement>;

  inputValue = '';
  showDropdown = false;
  filteredSuggestions: GuessSuggestion[] = [];

  ngOnInit() {
    this.inputValue = this.value();
    this.filterSuggestions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !changes['value'].firstChange) {
      this.inputValue = this.value();
      this.filterSuggestions();
    }
  }

  onInput(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.inputValue);
    this.filterSuggestions();
    this.showDropdown = true;
  }

  onSubmit() {
    if (this.filteredSuggestions.length > 0) {
      this.onSelectSuggestion(this.filteredSuggestions[0], false);
    }
    this.submit.emit();
    this.showDropdown = false;
  }

  onSelectSuggestion(suggestion: GuessSuggestion, blurInput: boolean = true) {
    this.inputValue = suggestion.nombre;
    this.valueChange.emit(this.inputValue);
    this.selectSuggestion.emit(suggestion);
    this.showDropdown = false;
    if (blurInput) {
      setTimeout(() => this.inputEl?.nativeElement.blur(), 0);
    }
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

  onFocus() {
    this.showDropdown = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const input = this.inputEl?.nativeElement;
    const dropdown = this.dropdownEl?.nativeElement;
    if (
      input &&
      !input.contains(event.target as Node) &&
      (!dropdown || !dropdown.contains(event.target as Node))
    ) {
      this.showDropdown = false;
    }
  }
}
