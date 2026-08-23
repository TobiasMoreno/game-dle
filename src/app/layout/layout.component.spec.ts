import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let component: LayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.removeProperty('overflow');
    fixture.destroy();
  });

  it('exposes the global navigation trigger and home brand', () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('[aria-controls="game-navigation"]');
    const brand = element.querySelector<HTMLAnchorElement>('a[aria-label="Ir al inicio de Game-DLE"]');

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(brand?.getAttribute('href')).toBe('/home');
  });

  it('opens the drawer and closes it with Escape', fakeAsync(() => {
    component.openSidebar();
    fixture.detectChanges();
    tick();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.sidebar-backdrop')).not.toBeNull();
    expect(element.querySelector('aside')?.getAttribute('aria-hidden')).toBe('false');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    tick();

    expect(component.isSidebarOpen).toBeFalse();
    expect(element.querySelector('.sidebar-backdrop')).toBeNull();
  }));
});
