import { routes } from './app.routes';

describe('application route metadata', () => {
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
