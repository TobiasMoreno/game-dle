import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'game-dle' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('game-dle');
  });

  it('renders the brand without competing with the page heading', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[aria-label="Ir al inicio de Game-DLE"]')?.textContent).toContain('Game-DLE');
    expect(compiled.querySelector('h1')).toBeNull();
  });

  it('should link the Game-DLE brand to home', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const homeLink = compiled.querySelector<HTMLAnchorElement>(
      'a[aria-label="Ir al inicio de Game-DLE"]'
    );

    expect(homeLink?.getAttribute('href')).toBe('/');
  });
});
