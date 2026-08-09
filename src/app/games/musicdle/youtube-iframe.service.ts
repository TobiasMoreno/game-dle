import { Injectable } from '@angular/core';

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: Record<string, unknown>) => MusicdleYoutubePlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface MusicdleYoutubePlayer {
  cueVideoById(options: { videoId: string; startSeconds: number; endSeconds: number }): void;
  loadVideoById(options: { videoId: string; startSeconds: number; endSeconds: number }): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  destroy(): void;
}

@Injectable({ providedIn: 'root' })
export class YoutubeIframeService {
  private apiPromise?: Promise<NonNullable<Window['YT']>>;

  loadApi(): Promise<NonNullable<Window['YT']>> {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (this.apiPromise) return this.apiPromise;

    this.apiPromise = new Promise((resolve, reject) => {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        if (window.YT) resolve(window.YT);
      };

      const existingScript = document.getElementById('youtube-iframe-api');
      if (existingScript) return;

      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => reject(new Error('No se pudo cargar la API de YouTube'));
      document.head.appendChild(script);
    });

    return this.apiPromise;
  }
}
