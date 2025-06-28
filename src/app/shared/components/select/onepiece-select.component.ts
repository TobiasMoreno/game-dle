import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type OnePieceSelectOption = string | { label: string; value: any; icon?: string };

@Component({
  selector: 'onepiece-select',
  templateUrl: './onepiece-select.component.html',
  styleUrls: ['./onepiece-select.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OnePieceSelectComponent),
      multi: true
    }
  ]
})
export class OnePieceSelectComponent implements ControlValueAccessor {
  @Input() options: OnePieceSelectOption[] = [];
  @Input() placeholder: string = 'Selecciona una opción...';
  @Input() disabled: boolean = false;
  @Input() showIcons: boolean = false;
  @Input() dropdownClass: string = '';
  @Input() optionClass: string = '';

  @Output() select = new EventEmitter<any>();

  isOpen = false;
  selected: any = null;
  search: string = '';

  onChange = (_: any) => {};
  onTouched = () => {};

  get filteredOptions(): OnePieceSelectOption[] {
    if (!this.search) return this.options;
    return this.options.filter(opt => {
      const label = typeof opt === 'string' ? opt : opt.label;
      return label.toLowerCase().includes(this.search.toLowerCase());
    });
  }

  get selectedOption(): OnePieceSelectOption | null {
    if (this.selected === null || this.selected === undefined) return null;
    return this.options.find(opt => (typeof opt === 'string' ? opt : opt.value) === this.selected) || null;
  }

  writeValue(value: any): void {
    this.selected = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.search = '';
  }

  selectOption(option: OnePieceSelectOption): void {
    this.selected = typeof option === 'string' ? option : option.value;
    this.onChange(this.selected);
    this.select.emit(this.selected);
    this.isOpen = false;
    this.search = '';
  }

  getLabel(option: OnePieceSelectOption | null): string {
    if (!option) return '';
    return typeof option === 'string' ? option : option.label;
  }
  
  getIcon(option: OnePieceSelectOption | null): string | undefined {
    if (!option) return undefined;
    return typeof option === 'string' ? undefined : option.icon;
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selected = null;
    this.onChange(null);
    this.select.emit(null);
  }

  onInput(event: any): void {
    this.search = event.target.value;
  }

  onBlur(): void {
    setTimeout(() => { this.isOpen = false; }, 200);
  }
} 