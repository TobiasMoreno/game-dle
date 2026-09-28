import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { NextGamePreloadingStrategy } from './shared/services/next-game-preloading.strategy';
import { NativeShellService } from './shared/services/native-shell.service';
import { AppLifecycleService } from './shared/services/app-lifecycle.service';
import { AppStorageService } from './shared/services/app-storage.service';
import { RouteMetadataService } from './shared/services/route-metadata.service';
import {
  GlobalErrorHandler,
  ObservabilityService,
} from './shared/services/observability.service';
import { AdService } from './shared/services/ad.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(NextGamePreloadingStrategy)),
    provideHttpClient(withFetch()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAppInitializer(() => inject(RouteMetadataService).start()),
    provideAppInitializer(() => inject(ObservabilityService).initialize()),
    provideAppInitializer(() => {
      const storageInitialization = inject(AppStorageService).initialize();
      const adService = inject(AdService);
      void storageInitialization.then(() => adService.initialize());
      return storageInitialization;
    }),
    provideAppInitializer(() => inject(AppLifecycleService).initialize()),
    provideAppInitializer(() => inject(NativeShellService).initialize()),
  ],
};
