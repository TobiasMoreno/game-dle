import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MusicdleStorageService } from './musicdle-storage.service';
import { MusicdleYoutubePlayerComponent } from './musicdle-youtube-player.component';
import { MusicdleYoutubePlayer, YoutubeIframeService } from './youtube-iframe.service';

describe('MusicdleYoutubePlayerComponent', () => {
  let loadApi: jasmine.Spy<YoutubeIframeService['loadApi']>;
  let player: jasmine.SpyObj<MusicdleYoutubePlayer>;
  let playerConstructor: jasmine.Spy;
  let api: NonNullable<Window['YT']>;

  beforeEach(async () => {
    player = jasmine.createSpyObj<MusicdleYoutubePlayer>('Player', [
      'cueVideoById', 'loadVideoById', 'pauseVideo', 'seekTo', 'setVolume', 'getCurrentTime', 'destroy',
    ]);
    playerConstructor = jasmine.createSpy('YT.Player').and.returnValue(player);
    api = {
      Player: playerConstructor as unknown as NonNullable<Window['YT']>['Player'],
      PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0 },
    };
    loadApi = jasmine.createSpy<YoutubeIframeService['loadApi']>('loadApi')
      .and.returnValue(Promise.resolve(api));
    await TestBed.configureTestingModule({
      imports: [MusicdleYoutubePlayerComponent],
      providers: [
        { provide: YoutubeIframeService, useValue: { loadApi } },
        { provide: MusicdleStorageService, useValue: { getVolume: () => 65 } },
      ],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(MusicdleYoutubePlayerComponent);
    fixture.componentRef.setInput('videoId', 'abcdefghijk');
    fixture.componentRef.setInput('startSeconds', 0);
    fixture.componentRef.setInput('unlockedSeconds', 2);
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza en el servidor sin cargar la API ni crear un reproductor', async () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const fixture = render();
    await fixture.whenStable();
    expect(loadApi).not.toHaveBeenCalled();
    expect(playerConstructor).not.toHaveBeenCalled();
    expect(fixture.componentInstance.loadFailed).toBeFalse();
  });

  it('crea el reproductor en el navegador y restaura el volumen al estar listo', async () => {
    const fixture = render();
    await fixture.whenStable();
    expect(loadApi).toHaveBeenCalledTimes(1);
    expect(playerConstructor).toHaveBeenCalledTimes(1);
    const options = playerConstructor.calls.mostRecent().args[1];
    expect(options.playerVars.origin).toBe(window.location.origin);
    options.events.onReady();
    expect(player.setVolume).toHaveBeenCalledWith(65);
    expect(player.cueVideoById).toHaveBeenCalledWith({
      videoId: 'abcdefghijk', startSeconds: 0, endSeconds: 2,
    });
    expect(fixture.componentInstance.isReady).toBeTrue();
  });

  it('no crea un reproductor si el componente se destruyó mientras cargaba la API', async () => {
    let resolve!: (value: NonNullable<Window['YT']>) => void;
    loadApi.and.returnValue(new Promise((done) => { resolve = done; }));
    const fixture = render();
    fixture.destroy();
    resolve(api);
    await Promise.resolve();
    expect(playerConstructor).not.toHaveBeenCalled();
  });

  it('no emite errores de una carga que terminó después de destruirse', async () => {
    let reject!: (reason: Error) => void;
    loadApi.and.returnValue(new Promise((_resolve, fail) => { reject = fail; }));
    const fixture = render();
    const error = spyOn(fixture.componentInstance.apiUnavailable, 'emit');
    fixture.destroy();
    reject(new Error('API no disponible'));
    await Promise.resolve();
    await Promise.resolve();
    expect(error).not.toHaveBeenCalled();
  });
});
