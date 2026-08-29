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

  it('only renders the edge and shadow while the drawer is open', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('aside') as HTMLElement;

    expect(sidebar.classList).not.toContain('game-sidebar--open');
    expect(getComputedStyle(sidebar).visibility).toBe('hidden');
    expect(getComputedStyle(sidebar).borderRightWidth).toBe('0px');

    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(sidebar.classList).toContain('game-sidebar--open');
    expect(getComputedStyle(sidebar).visibility).toBe('visible');
    expect(getComputedStyle(sidebar).borderRightWidth).toBe('1px');
  });

  it('groups game links by mode and exposes a close control', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const headings = [...element.querySelectorAll('nav h3')].map((item) => item.textContent?.trim());

    expect(headings).toEqual(['Universos', 'Desafíos de hoy', 'Rondas ilimitadas', 'Para jugar con amigos']);
    expect(element.querySelectorAll('nav a[href^="/games/"]').length).toBe(component.games.length);
    expect(element.querySelector('nav a[href="/lol"]')).not.toBeNull();
    expect(element.querySelector('nav a[href="/futbol"]')).not.toBeNull();
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
