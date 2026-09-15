import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { prerenderCatalogInterceptor } from './prerender-catalog.interceptor';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(withFetch(), withInterceptors([prerenderCatalogInterceptor])),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
