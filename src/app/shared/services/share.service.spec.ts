import { TestBed } from '@angular/core/testing';
import { PlatformService } from './platform.service';
import { ShareService } from './share.service';

describe('ShareService', () => {
  const publicUrl = (path: string) => `https://game-dle.web.app${path}`;
  let originalShare: PropertyDescriptor | undefined;
  let originalClipboard: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalShare = Object.getOwnPropertyDescriptor(navigator, 'share');
    originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  });

  afterEach(() => {
    restoreNavigatorProperty('share', originalShare);
    restoreNavigatorProperty('clipboard', originalClipboard);
    TestBed.resetTestingModule();
  });

  it('passes the public URL separately without duplicating it in the Web Share text', async () => {
    const webShare = jasmine.createSpy('share').and.resolveTo();
    defineNavigatorProperty('share', webShare);
    const service = createService(false);

    const outcome = await service.share({ title: 'GeoDLE', text: 'Resultado', path: '/games/geodle' });

    expect(outcome).toBe('shared');
    expect(webShare).toHaveBeenCalledWith({
      title: 'GeoDLE',
      text: 'Resultado',
      url: 'https://game-dle.web.app/games/geodle',
    });
  });

  it('copies text and the public URL when Web Share is unavailable', async () => {
    defineNavigatorProperty('share', undefined);
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    defineNavigatorProperty('clipboard', { writeText });
    const service = createService(false);

    const outcome = await service.share({ title: 'GeoDLE', text: 'Resultado', path: '/games/geodle' });

    expect(outcome).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('Resultado\nhttps://game-dle.web.app/games/geodle');
  });

  function createService(isNative: boolean): ShareService {
    TestBed.configureTestingModule({
      providers: [
        ShareService,
        { provide: PlatformService, useValue: { isNative, publicUrl } },
      ],
    });
    return TestBed.inject(ShareService);
  }

  function defineNavigatorProperty(name: 'share' | 'clipboard', value: unknown): void {
    Object.defineProperty(navigator, name, { configurable: true, value });
  }

  function restoreNavigatorProperty(
    name: 'share' | 'clipboard',
    descriptor: PropertyDescriptor | undefined,
  ): void {
    if (descriptor) Object.defineProperty(navigator, name, descriptor);
    else delete (navigator as unknown as Record<string, unknown>)[name];
  }
});
