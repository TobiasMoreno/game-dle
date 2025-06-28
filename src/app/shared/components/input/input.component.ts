import {
  Component,
  forwardRef,
  inject,
  OnInit,
  input,
  output,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ReactiveFormsModule,
  ControlContainer,
} from '@angular/forms';
import { CountryCode } from '../../services/country/country-code.interface';
import { CountryService } from '../../services/country/country.service';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class InputComponent implements ControlValueAccessor, OnInit {
  label = input.required<string>();
  leftImageUrl = input<string>();
  rightImageUrl = input<string>();
  type = input<string>('text');
  placeholder = input<string>();
  errors = input<ValidationErrors>();
  showClearButton = input<boolean>();
  placeholderPosition = input<'center' | 'start'>('center');
  touched = input<boolean>();
  width = input<string>('310px');
  height = input<string>('54px');
  floatingLabels = input<boolean>(false);
  backgroundColor = input<string>();
  countries = input<CountryCode[]>([]);
  selectedCountry = input<CountryCode | null>();

  rightIconClick = output<void>();
  inputBlur = output<void>();
  countryChange = output<CountryCode>();

  private countryService = inject(CountryService);

  innerValue: string = '';
  isDisabled: boolean = false;
  localTouched: boolean = false;
  isFocused: boolean = false;

  private _countries: CountryCode[] = [];

  get availableCountries(): CountryCode[] {
    return this._countries;
  }

  ngOnInit() {
    if (this.type() === 'tel') {
      this.countryService.loadCountries();

      this.countryService.countries$.subscribe(countries => {
        this._countries = countries;
      });

      this.countryService.selectedCountry$.subscribe((country) => {
        if (country) {
          this.countryChange.emit(country);
          if (this.innerValue) {
            this.onInputChange(this.innerValue);
          }
        }
      });
    }
  }

  onSelectCountry(countryCodeValue: string) {
    const foundCountry = this._countries.find(
      (c) => c.code === countryCodeValue
    );
    if (foundCountry) {
      this.countryService.setSelectedCountry(foundCountry);
    }
  }

  onRightIconClick(): boolean {
    this.rightIconClick.emit();
    return true;
  }

  onChange = (_: any) => {};
  onTouch = () => {
    this.localTouched = true;
    this.inputBlur.emit();
  };

  writeValue(value: any): void {
    if (this.type() === 'tel' && this.selectedCountry()) {
      const dialCode = this.selectedCountry()?.dialCode;
      if (dialCode) {
        this.innerValue = value?.replace(dialCode, '') || '';
      } else {
        this.innerValue = value || '';
      }
    } else {
      this.innerValue = value || '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(value: string): void {
    if (this.type() === 'tel' && this.selectedCountry()) {
      const dialCode = this.selectedCountry()?.dialCode;
      if (dialCode) {
        const phoneNumber = value.replace(/\D/g, '');
        this.innerValue = phoneNumber;
        this.onChange(dialCode + phoneNumber);
      }
    } else {
      this.innerValue = value;
      this.onChange(value);
    }
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouch();
  }

  clearInput(): void {
    this.innerValue = '';
    this.onChange('');
    this.onTouch();
  }

  get fieldIsTouched(): boolean {
    return this.touched() || this.localTouched;
  }
}
