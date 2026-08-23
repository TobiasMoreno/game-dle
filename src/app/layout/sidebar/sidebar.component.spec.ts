import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('groups game links by mode and exposes a close control', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const headings = [...element.querySelectorAll('nav h3')].map((item) => item.textContent?.trim());

    expect(headings).toEqual(['Desafíos de hoy', 'Rondas ilimitadas', 'Para jugar con amigos']);
    expect(element.querySelectorAll('nav a[href^="/games/"]').length).toBe(component.games.length);
    expect(element.querySelector('button[aria-label="Cerrar menú de juegos"]')).not.toBeNull();
  });

  it('keeps backwards keyboard focus inside the open drawer', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const first = element.querySelector<HTMLButtonElement>('button[aria-label="Cerrar menú de juegos"]');
    const focusable = element.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const last = focusable.item(focusable.length - 1);
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true });

    first?.focus();
    component.trapFocus(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(last);
  });
});
