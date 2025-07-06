import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, AudioState } from '../../services/audio.service';
import { Subscription } from 'rxjs';

export interface MusicControlsTheme {
  buttonBg: string;
  buttonHoverBg: string;
  buttonTextColor: string;
  volumeTextColor: string;
  sliderBg: string;
  sliderThumbBg: string;
}

@Component({
  selector: 'app-music-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center space-x-4">
      <button
        (click)="toggleMusic()"
        class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-bold shadow-lg"
        [class]="getButtonClasses()"
      >
        <span>{{ audioState.isMuted ? '🔇' : '🎵' }}</span>
        <span>{{ audioState.isMuted ? 'Activar música' : 'Silenciar música' }}</span>
      </button>
      
      @if (!audioState.isMuted) {
        <div class="flex items-center space-x-2">
          <span class="text-sm font-semibold" [style.color]="theme?.volumeTextColor || '#374151'">
            Volumen:
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            [value]="audioState.volume"
            (input)="onVolumeChange($event)"
            class="w-20 h-2 rounded-lg appearance-none cursor-pointer"
            [style.background]="theme?.sliderBg || '#fef3c7'"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      cursor: pointer;
      height: 8px;
      border-radius: 4px;
    }

    input[type="range"]::-webkit-slider-track {
      height: 8px;
      border-radius: 4px;
      background: #fef3c7;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      cursor: pointer;
      background: #f59e0b;
      border: 3px solid #d97706;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    }

    input[type="range"]::-webkit-slider-thumb:hover {
      background: #d97706;
      transform: scale(1.15);
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }

    input[type="range"]::-moz-range-track {
      height: 8px;
      border-radius: 4px;
      border: none;
      background: #fef3c7;
    }

    input[type="range"]::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid #d97706;
      background: #f59e0b;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    }

    input[type="range"]::-moz-range-thumb:hover {
      background: #d97706;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }
  `]
})
export class MusicControlsComponent implements OnInit, OnDestroy {
  @Input() theme?: MusicControlsTheme;
  @Input() musicFile?: string;

  private audioService = inject(AudioService);
  private subscription = new Subscription();
  
  audioState: AudioState = {
    isPlaying: false,
    isMuted: true,
    volume: 0.3,
    currentTrack: null
  };

  ngOnInit(): void {
    // Suscribirse a los cambios del estado de audio
    this.subscription.add(
      this.audioService.audioState$.subscribe(state => {
        this.audioState = state;
      })
    );

    // Inicializar audio si se proporciona un archivo
    if (this.musicFile) {
      this.audioService.initializeAudio(this.musicFile);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMusic(): void {
    this.audioService.toggleMusic();
  }

  onVolumeChange(event: Event): void {
    this.audioService.onVolumeChange(event);
  }

  getButtonClasses(): string {
    const baseClasses = 'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-bold shadow-lg';
    
    if (this.audioState.isMuted) {
      return `${baseClasses} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white`;
    } else {
      const bgClasses = this.theme?.buttonBg || 'bg-gradient-to-r from-yellow-500 to-orange-500';
      const hoverClasses = this.theme?.buttonHoverBg || 'hover:from-yellow-400 hover:to-orange-400';
      const textClasses = this.theme?.buttonTextColor ? `text-${this.theme.buttonTextColor}` : 'text-white';
      
      return `${baseClasses} ${bgClasses} ${hoverClasses} ${textClasses}`;
    }
  }
} 