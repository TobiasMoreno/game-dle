import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  GuessInputComponent,
  GuessSuggestion,
} from './guess-input.component';

describe('GuessInputComponent', () => {
  let component: GuessInputComponent;
  let fixture: ComponentFixture<GuessInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuessInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuessInputComponent);
    component = fixture.componentInstance;
  });

  it('no muestra opciones hasta ingresar al menos dos caracteres', () => {
    fixture.componentRef.setInput('suggestions', [
      { nombre: 'Mario' },
      { nombre: 'Luigi' },
    ]);
    component.inputValue = 'm';

    component.filterSuggestions();

    expect(component.filteredSuggestions).toEqual([]);
  });

  it('muestra todas las opciones que cumplen con el filtro', () => {
    const suggestions: GuessSuggestion[] = Array.from(
      { length: 12 },
      (_, index) => ({ nombre: `Mario ${index + 1}` })
    );
    fixture.componentRef.setInput('suggestions', suggestions);
    component.inputValue = 'ma';

    component.filterSuggestions();

    expect(component.filteredSuggestions).toEqual(suggestions);
  });
});
