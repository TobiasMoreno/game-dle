import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
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
  imports: [],
  templateUrl: './music-controls.component.html',
  styleUrls: ['./music-controls.component.css']
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