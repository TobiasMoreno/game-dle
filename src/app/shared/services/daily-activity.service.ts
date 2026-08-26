import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { get, ref, set } from 'firebase/database';
import { firebaseAuth, getFirebaseDatabase } from '../config/firebase.config';
import { DailyActivityEntry, GameActivityStats } from '../models/daily-activity.model';
import {
  argentinaDateKey,
  buildActivitySummary,
  buildGameActivityStats,
} from '../utils/daily-activity.utils';

interface CloudActivityByDate {
  [date: string]: Record<string, DailyActivityEntry>;
}

@Injectable({ providedIn: 'root' })
export class DailyActivityService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storageKey = 'game-dle-daily-activity-v1';
  private readonly entriesState = signal<DailyActivityEntry[]>(this.readLocalEntries());

  readonly entries = this.entriesState.asReadonly();
  readonly summary = computed(() => buildActivitySummary(this.entriesState()));
  readonly user = signal<User | null>(firebaseAuth.currentUser);
  readonly authReady = signal(false);
  readonly syncing = signal(false);
  readonly syncMessage = signal('');

  private authPromise: Promise<User> | null = null;
  private readonly authReadyPromise: Promise<void>;

  constructor() {
    if (!this.isBrowser) {
      this.authReady.set(true);
      this.authReadyPromise = Promise.resolve();
      return;
    }

    onAuthStateChanged(firebaseAuth, (user) => {
      this.user.set(user);
      if (user) void this.syncWithCloud(user);
    });
    this.authReadyPromise = this.initializeAuth();
  }

  async recordDailyGame(
    gameId: string,
    won: boolean,
    attempts: number,
    score?: number
  ): Promise<void> {
    const date = argentinaDateKey();
    const key = this.entryKey(date, gameId);
    if (this.entriesState().some((entry) => this.entryKey(entry.date, entry.gameId) === key)) {
      return;
    }

    const entry: DailyActivityEntry = {
      date,
      gameId,
      won,
      attempts: Math.max(0, Math.round(attempts)),
      completedAt: Date.now(),
      ...(typeof score === 'number' && Number.isFinite(score) ? { score } : {}),
    };
    this.persistLocal([...this.entriesState(), entry]);

    try {
      const user = await this.ensureUser();
      await this.writeEntry(user.uid, entry);
      this.syncMessage.set('Progreso sincronizado');
    } catch {
      this.syncMessage.set('Guardado en este dispositivo');
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.syncing.set(true);
    this.syncMessage.set('');
    try {
      await this.authReadyPromise;
      await setPersistence(firebaseAuth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(firebaseAuth, provider);
      this.user.set(credential.user);
      await this.syncWithCloud(credential.user);
      this.syncMessage.set('Historial sincronizado con Google');
    } catch (error) {
      const code = this.firebaseErrorCode(error);
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      this.syncMessage.set(
        code === 'auth/operation-not-allowed'
          ? 'El acceso con Google todavía no está habilitado.'
          : 'No pudimos conectar con Google. Intentá nuevamente.'
      );
    } finally {
      this.syncing.set(false);
    }
  }

  async useAnonymousProfile(): Promise<void> {
    this.syncing.set(true);
    try {
      await this.authReadyPromise;
      await signOut(firebaseAuth);
      this.authPromise = null;
      const user = await this.createAnonymousUser();
      this.user.set(user);
      await this.syncWithCloud(user);
      this.syncMessage.set('Las estadísticas siguen guardadas en este navegador');
    } finally {
      this.syncing.set(false);
    }
  }

  getGameStats(gameId: string): GameActivityStats {
    return buildGameActivityStats(this.entriesState(), gameId);
  }

  private async ensureUser(): Promise<User> {
    await this.authReadyPromise;
    return this.createAnonymousUser();
  }

  private async initializeAuth(): Promise<void> {
    try {
      try {
        await setPersistence(firebaseAuth, browserLocalPersistence);
      } catch {
        this.syncMessage.set('No pudimos activar el inicio de sesión persistente en este navegador');
      }

      await firebaseAuth.authStateReady();
      this.user.set(firebaseAuth.currentUser);
      if (!firebaseAuth.currentUser) await this.createAnonymousUser();
    } catch {
      this.syncMessage.set('No pudimos restaurar la sesión; el progreso sigue guardado localmente');
    } finally {
      this.authReady.set(true);
    }
  }

  private async createAnonymousUser(): Promise<User> {
    if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
    if (!this.authPromise) {
      this.authPromise = signInAnonymously(firebaseAuth)
        .then((credential) => credential.user)
        .finally(() => { this.authPromise = null; });
    }
    return this.authPromise;
  }

  private async syncWithCloud(user: User): Promise<void> {
    this.syncing.set(true);
    try {
      const snapshot = await get(ref(getFirebaseDatabase(), `users/${user.uid}/activity`));
      const cloudEntries = this.flattenCloudEntries(snapshot.val() as CloudActivityByDate | null);
      const cloudKeys = new Set(cloudEntries.map((entry) => this.entryKey(entry.date, entry.gameId)));
      const merged = this.mergeEntries(this.entriesState(), cloudEntries);
      this.persistLocal(merged);

      const missingInCloud = merged.filter(
        (entry) => !cloudKeys.has(this.entryKey(entry.date, entry.gameId))
      );
      await Promise.all(missingInCloud.map((entry) => this.writeEntry(user.uid, entry)));
      this.syncMessage.set(user.isAnonymous ? 'Progreso guardado en este dispositivo' : 'Historial sincronizado');
    } catch {
      this.syncMessage.set('Sin conexión: el progreso sigue guardado localmente');
    } finally {
      this.syncing.set(false);
    }
  }

  private writeEntry(uid: string, entry: DailyActivityEntry): Promise<void> {
    return set(
      ref(getFirebaseDatabase(), `users/${uid}/activity/${entry.date}/${entry.gameId}`),
      entry
    );
  }

  private flattenCloudEntries(data: CloudActivityByDate | null): DailyActivityEntry[] {
    if (!data || typeof data !== 'object') return [];
    return Object.values(data).flatMap((games) =>
      games && typeof games === 'object' ? Object.values(games) : []
    ).filter((entry): entry is DailyActivityEntry => this.isValidEntry(entry));
  }

  private mergeEntries(local: DailyActivityEntry[], cloud: DailyActivityEntry[]): DailyActivityEntry[] {
    const entries = new Map<string, DailyActivityEntry>();
    for (const entry of [...cloud, ...local]) {
      if (!this.isValidEntry(entry)) continue;
      const key = this.entryKey(entry.date, entry.gameId);
      const existing = entries.get(key);
      if (!existing || entry.completedAt < existing.completedAt) entries.set(key, entry);
    }
    return [...entries.values()]
      .sort((a, b) => a.completedAt - b.completedAt)
      .slice(-750);
  }

  private readLocalEntries(): DailyActivityEntry[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is DailyActivityEntry => this.isValidEntry(entry))
        : [];
    } catch {
      return [];
    }
  }

  private persistLocal(entries: DailyActivityEntry[]): void {
    const normalized = this.mergeEntries(entries, []);
    this.entriesState.set(normalized);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(normalized));
    } catch {
      // La señal mantiene la sesión funcional aunque el almacenamiento esté lleno o bloqueado.
    }
  }

  private isValidEntry(value: unknown): value is DailyActivityEntry {
    if (!value || typeof value !== 'object') return false;
    const entry = value as Partial<DailyActivityEntry>;
    return typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
      typeof entry.gameId === 'string' && entry.gameId.length > 0 && entry.gameId.length <= 40 &&
      typeof entry.won === 'boolean' && typeof entry.attempts === 'number' &&
      typeof entry.completedAt === 'number';
  }

  private entryKey(date: string, gameId: string): string {
    return `${date}:${gameId}`;
  }

  private firebaseErrorCode(error: unknown): string {
    return typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  }
}
