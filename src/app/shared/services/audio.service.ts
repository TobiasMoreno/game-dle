import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AudioState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrack: string | null;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private audioStateSubject = new BehaviorSubject<AudioState>({
    isPlaying: false,
    isMuted: true,
    volume: 0.3,
    currentTrack: null
  });

  public audioState$ = this.audioStateSubject.asObservable();

  /**
   * Inicializa el audio con un archivo de música
   */
  initializeAudio(musicUrl: string): void {
    try {
      this.audio = new Audio(musicUrl);
      this.audio.loop = true;
      this.audio.volume = this.audioStateSubject.value.volume;
      this.audio.preload = 'auto';
      
      this.updateState({ currentTrack: musicUrl });
      
      console.log('✅ Audio inicializado:', musicUrl);
    } catch (error) {
      console.error('❌ Error al inicializar audio:', error);
    }
  }

  /**
   * Inicia la reproducción de música
   */
  startMusic(): void {
    if (this.audio && !this.audioStateSubject.value.isPlaying && !this.audioStateSubject.value.isMuted) {
      this.audio.play().then(() => {
        this.updateState({ isPlaying: true });
        console.log('🎵 Música iniciada');
      }).catch((error) => {
        console.error('❌ Error al reproducir música:', error);
      });
    }
  }

  /**
   * Detiene la reproducción de música
   */
  stopMusic(): void {
    if (this.audio && this.audioStateSubject.value.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.updateState({ isPlaying: false });
      console.log('🔇 Música detenida');
    }
  }

  /**
   * Alterna entre silenciar y activar la música
   */
  toggleMusic(): void {
    const currentState = this.audioStateSubject.value;
    
    if (currentState.isMuted) {
      this.updateState({ isMuted: false });
      this.startMusic();
    } else {
      this.updateState({ isMuted: true });
      this.stopMusic();
    }
  }

  /**
   * Establece el volumen de la música
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audio) {
      this.audio.volume = clampedVolume;
    }
    
    this.updateState({ volume: clampedVolume });
  }

  /**
   * Maneja el cambio de volumen desde un input
   */
  onVolumeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.setVolume(parseFloat(target.value));
    }
  }

  /**
   * Obtiene el estado actual del audio
   */
  getAudioState(): AudioState {
    return this.audioStateSubject.value;
  }

  /**
   * Verifica si la música está reproduciéndose
   */
  isMusicPlaying(): boolean {
    return this.audioStateSubject.value.isPlaying;
  }

  /**
   * Verifica si la música está silenciada
   */
  isMusicMuted(): boolean {
    return this.audioStateSubject.value.isMuted;
  }

  /**
   * Obtiene el volumen actual
   */
  getVolume(): number {
    return this.audioStateSubject.value.volume;
  }

  /**
   * Limpia los recursos de audio
   */
  cleanup(): void {
    this.stopMusic();
    if (this.audio) {
      this.audio = null;
    }
    this.updateState({
      isPlaying: false,
      isMuted: true,
      volume: 0.3,
      currentTrack: null
    });
  }

  /**
   * Actualiza el estado del audio
   */
  private updateState(updates: Partial<AudioState>): void {
    const currentState = this.audioStateSubject.value;
    const newState = { ...currentState, ...updates };
    this.audioStateSubject.next(newState);
  }
} 