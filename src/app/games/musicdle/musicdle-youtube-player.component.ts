import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  MusicdleYoutubePlayer,
  YoutubeIframeService,
} from './youtube-iframe.service';

@Component({
  selector: 'app-musicdle-youtube-player',
  templateUrl: './musicdle-youtube-player.component.html',
  styleUrl: './musicdle-youtube-player.component.css',
})
export class MusicdleYoutubePlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
  videoId = input.required<string>();
  startSeconds = input.required<number>();
  unlockedSeconds = input.required<number>();

  readyChange = output<boolean>();
  playbackChange = output<boolean>();
  videoUnavailable = output<number>();
  apiUnavailable = output<void>();

  @ViewChild('playerHost', { static: true }) playerHost!: ElementRef<HTMLElement>;

  isReady = false;
  loadFailed = false;
  volume = 100;

  private readonly youtubeApi = inject(YoutubeIframeService);
  private player: MusicdleYoutubePlayer | null = null;
  private monitorId: ReturnType<typeof setInterval> | null = null;

  ngAfterViewInit(): void {
    this.youtubeApi.loadApi()
      .then((YT) => {
        this.player = new YT.Player(this.playerHost.nativeElement, {
          width: '100%',
          height: '100%',
          videoId: this.videoId(),
          playerVars: {
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              this.isReady = true;
              this.loadFailed = false;
              this.player?.setVolume(this.volume);
              this.cueSegment();
              this.readyChange.emit(true);
            },
            onStateChange: (event: { data: number }) => this.onPlayerStateChange(event.data),
            onError: (event: { data: number }) => this.onPlayerError(event.data),
          },
        });
      })
      .catch(() => this.onApiUnavailable());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.player && (changes['videoId'] || changes['startSeconds'] || changes['unlockedSeconds'])) {
      this.isReady = true;
      this.loadFailed = false;
      this.cueSegment();
      this.readyChange.emit(true);
    }
  }

  ngOnDestroy(): void {
    this.stopMonitor();
    this.player?.destroy();
  }

  playSegment(): void {
    if (!this.player || !this.isReady) return;

    this.player.loadVideoById({
      videoId: this.videoId(),
      startSeconds: this.startSeconds(),
      endSeconds: this.segmentEnd,
    });
  }

  onVolumeInput(event: Event): void {
    const nextVolume = Number((event.target as HTMLInputElement).value);
    this.volume = Math.min(100, Math.max(0, nextVolume));
    this.player?.setVolume(this.volume);
  }

  private get segmentEnd(): number {
    return this.startSeconds() + this.unlockedSeconds();
  }

  private cueSegment(): void {
    if (!this.player) return;
    this.stopMonitor();
    this.playbackChange.emit(false);
    this.player.cueVideoById({
      videoId: this.videoId(),
      startSeconds: this.startSeconds(),
      endSeconds: this.segmentEnd,
    });
  }

  private onPlayerStateChange(state: number): void {
    if (state === 1) {
      this.playbackChange.emit(true);
      this.startMonitor();
      return;
    }

    if (state === 0 || state === 2) {
      this.playbackChange.emit(false);
      this.stopMonitor();
    }
  }

  private startMonitor(): void {
    this.stopMonitor();
    this.monitorId = setInterval(() => {
      if (!this.player) return;
      if (this.player.getCurrentTime() >= this.segmentEnd - 0.08) {
        this.player.pauseVideo();
        this.player.seekTo(this.startSeconds(), false);
        this.playbackChange.emit(false);
        this.stopMonitor();
      }
    }, 100);
  }

  private stopMonitor(): void {
    if (this.monitorId !== null) {
      clearInterval(this.monitorId);
      this.monitorId = null;
    }
  }

  private onPlayerError(code: number): void {
    this.loadFailed = true;
    this.stopMonitor();
    this.readyChange.emit(false);
    this.playbackChange.emit(false);
    this.videoUnavailable.emit(code);
  }

  private onApiUnavailable(): void {
    this.loadFailed = true;
    this.isReady = false;
    this.stopMonitor();
    this.readyChange.emit(false);
    this.playbackChange.emit(false);
    this.apiUnavailable.emit();
  }
}
