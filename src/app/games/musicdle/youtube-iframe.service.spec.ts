import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { YoutubeIframeService } from './youtube-iframe.service';

describe('YoutubeIframeService SSR', () => {
  it('rechaza las llamadas del servidor sin insertar scripts de YouTube', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const append = spyOn(document.head, 'appendChild');
    await expectAsync(TestBed.inject(YoutubeIframeService).loadApi())
      .toBeRejectedWithError('La API de YouTube solo está disponible en el navegador');
    expect(append).not.toHaveBeenCalled();
  });
});
