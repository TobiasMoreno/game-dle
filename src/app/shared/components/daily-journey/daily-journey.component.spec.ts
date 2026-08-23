import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DailyActivitySummary } from '../../models/daily-activity.model';
import { DailyActivityService } from '../../services/daily-activity.service';
import { GameManagerService } from '../../services/game-manager.service';
import { DailyJourneyComponent } from './daily-journey.component';

describe('DailyJourneyComponent', () => {
  let fixture: ComponentFixture<DailyJourneyComponent>;
  let authReady: WritableSignal<boolean>;
  let user: WritableSignal<{ isAnonymous: boolean } | null>;

  const summary: DailyActivitySummary = {
    currentStreak: 3,
    bestStreak: 5,
    totalActiveDays: 7,
    totalGames: 12,
    totalWins: 9,
    todayGames: 1,
    todayCompleted: true,
    lastActiveDate: '2026-08-23',
    calendar: [],
    achievements: [],
  };
  const games = [
    {
      id: 'wordle', name: 'Wordle', description: '', route: '/games/wordle',
      icon: 'fas fa-font', mode: 'daily' as const,
      dailyState: { date: '2026-08-23', completed: true },
    },
    {
      id: 'serpentile', name: 'Serpentile', description: '', route: '/games/serpentile',
      icon: 'fas fa-bezier-curve', mode: 'daily' as const,
    },
    {
      id: 'geodle', name: 'GeoDLE', description: '', route: '/games/geodle',
      icon: 'fas fa-earth-americas', mode: 'unlimited' as const,
    },
  ];

  beforeEach(async () => {
    authReady = signal(true);
    user = signal<{ isAnonymous: boolean } | null>(null);
    await TestBed.configureTestingModule({
      imports: [DailyJourneyComponent],
      providers: [
        {
          provide: DailyActivityService,
          useValue: {
            summary: signal(summary),
            user,
            authReady,
            syncing: signal(false),
            syncMessage: signal(''),
            signInWithGoogle: jasmine.createSpy(),
            useAnonymousProfile: jasmine.createSpy(),
          },
        },
        {
          provide: GameManagerService,
          useValue: { games$: of(games), getGames: () => games },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyJourneyComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('keeps secondary information collapsed while showing daily progress', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.journey__progress-head')?.textContent).toContain('1/2');
    expect(element.querySelector('.journey__details')).toBeNull();
    expect(element.querySelector('.journey__sync')).toBeNull();
  });

  it('reveals history, achievements and backup from the summary control', () => {
    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('.journey__primary');

    toggle?.click();
    fixture.detectChanges();

    const details = element.querySelector('.journey__details');
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(details?.querySelector('.journey__calendar-block')).not.toBeNull();
    expect(details?.querySelector('.journey__achievements')).not.toBeNull();
    expect(details?.querySelector('.journey__sync')).not.toBeNull();
  });

  it('communicates restoring, local and Google backup states', () => {
    fixture.componentInstance.toggleExpanded();
    authReady.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Restaurando sesión');

    authReady.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Guardado en este dispositivo');

    user.set({ isAnonymous: false });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Conectado con Google');
  });
});
