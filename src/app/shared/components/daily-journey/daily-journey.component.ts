import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DailyActivityService } from '../../services/daily-activity.service';
import { GameManagerService } from '../../services/game-manager.service';
import { millisecondsUntilArgentinaMidnight } from '../../utils/daily-activity.utils';

@Component({
  selector: 'app-daily-journey',
  imports: [],
  templateUrl: './daily-journey.component.html',
  styleUrl: './daily-journey.component.css',
})
export class DailyJourneyComponent implements OnDestroy {
  readonly activity = inject(DailyActivityService);
  private readonly gameManager = inject(GameManagerService);

  readonly expanded = signal(false);
  readonly countdown = signal(this.formatCountdown(millisecondsUntilArgentinaMidnight()));
  readonly games = toSignal(this.gameManager.games$, { initialValue: this.gameManager.getGames() });
  readonly dailyGames = computed(() => this.games().filter((game) => game.mode === 'daily'));
  readonly completedDailyGames = computed(() =>
    this.dailyGames().filter((game) => game.dailyState?.completed).length
  );
  readonly progressPercent = computed(() => {
    const total = this.dailyGames().length;
    return total ? Math.round((this.completedDailyGames() / total) * 100) : 0;
  });
  readonly signedInWithGoogle = computed(() => !this.activity.user()?.isAnonymous);

  private readonly countdownTimer = window.setInterval(() => {
    this.countdown.set(this.formatCountdown(millisecondsUntilArgentinaMidnight()));
  }, 1000);

  ngOnDestroy(): void {
    window.clearInterval(this.countdownTimer);
  }

  toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }

  async connectGoogle(): Promise<void> {
    await this.activity.signInWithGoogle();
  }

  async disconnectGoogle(): Promise<void> {
    await this.activity.useAnonymousProfile();
  }

  calendarDayLabel(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, month - 1, day)));
  }

  private formatCountdown(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
  }
}
