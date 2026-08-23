import { routes } from './app.routes';

describe('application route metadata', () => {
  it('defines a title and description for every page route', () => {
    const pageRoutes = routes.filter((route) => route.loadComponent);

    expect(pageRoutes.length).toBeGreaterThan(0);
    for (const route of pageRoutes) {
      expect(route.title).withContext(route.path ?? '').toEqual(jasmine.any(String));
      expect(route.data?.['description']).withContext(route.path ?? '').toEqual(jasmine.any(String));
    }
  });
});
