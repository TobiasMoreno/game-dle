import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { prerenderCatalogInterceptor } from './prerender-catalog.interceptor';

describe('prerender catalogs', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    provideHttpClient(withInterceptors([prerenderCatalogInterceptor])),
    provideHttpClientTesting(),
  ] }));

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('renders each local catalog without a network request and isolates consumers', () => {
    const http = TestBed.inject(HttpClient);
    for (const path of ['/geodle-countries.json', '/musicdle-songs.json', '/campeones_lol.json']) {
      let first: unknown;
      let second: unknown;
      http.get(path).subscribe(value => first = value);
      http.get(`https://game-dle.web.app${path}?v=test`).subscribe(value => second = value);
      expect(first).withContext(path).toBeTruthy();
      expect(second).withContext(path).toEqual(first);
      expect(second).withContext(path).not.toBe(first);
      TestBed.inject(HttpTestingController).expectNone(path);
    }
  });

  it('preserves requests to other hosts, other resources and writes', () => {
    const http = TestBed.inject(HttpClient);
    const testing = TestBed.inject(HttpTestingController);
    for (const url of ['https://example.com/geodle-countries.json', '/other.json']) {
      http.get(url).subscribe(value => expect(value).toEqual({ delegated: true }));
      testing.expectOne(url).flush({ delegated: true });
    }
    http.post('/geodle-countries.json', {}).subscribe(value => expect(value).toEqual({ delegated: true }));
    testing.expectOne(request => request.method === 'POST').flush({ delegated: true });
  });
});
