import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { NextGamePreloadingStrategy } from './shared/services/next-game-preloading.strategy';
import { RouteMetadataService } from './shared/services/route-metadata.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(NextGamePreloadingStrategy)
    ),
    provideHttpClient(),
    provideAppInitializer(() => inject(RouteMetadataService).start()),
  ],
};
