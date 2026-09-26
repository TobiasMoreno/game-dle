import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { NextGamePreloadingStrategy } from './shared/services/next-game-preloading.strategy';
import { NativeShellService } from './shared/services/native-shell.service';
import { AppLifecycleService } from './shared/services/app-lifecycle.service';
import { AppStorageService } from './shared/services/app-storage.service';
import { RouteMetadataService } from './shared/services/route-metadata.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(NextGamePreloadingStrategy)
    ),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => inject(RouteMetadataService).start()),
    provideAppInitializer(() => inject(AppStorageService).initialize()),
    provideAppInitializer(() => inject(AppLifecycleService).initialize()),
    provideAppInitializer(() => inject(NativeShellService).initialize()),
  ],
};
