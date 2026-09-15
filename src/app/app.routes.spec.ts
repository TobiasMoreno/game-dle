import { routes } from './app.routes';
import pages from './public-pages.json';

describe('application route metadata', () => {
  it('exposes every canonical page and excludes the missing-page route from indexing', () => {
    expect(routes.filter(route => route.loadComponent && route.path !== '**').map(route => route.path))
      .toEqual(pages.map(page => page.path));
    expect(routes.find(route => route.path === '**')?.data?.['noindex']).toBeTrue();
    expect(new Set(pages.map(page => page.path)).size).toBe(pages.length);
  });
  it('renders the complete home page at the submitted site root', () => {
    const rootRoute = routes.find((route) => route.path === '');
    const legacyHomeRoute = routes.find((route) => route.path === 'home');

    expect(rootRoute?.loadComponent).toEqual(jasmine.any(Function));
    expect(rootRoute?.redirectTo).toBeUndefined();
    expect(legacyHomeRoute?.redirectTo).toBe('');
  });

  it('defines a title and description for every page route', () => {
    const pageRoutes = routes.filter((route) => route.loadComponent);

    expect(pageRoutes.length).toBeGreaterThan(0);
    for (const route of pageRoutes) {
      expect(route.title).withContext(route.path ?? '').toEqual(jasmine.any(String));
      expect(route.data?.['description']).withContext(route.path ?? '').toEqual(jasmine.any(String));
    }
  });
});
