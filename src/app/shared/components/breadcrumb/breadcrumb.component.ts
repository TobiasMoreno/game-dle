import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, of, Subscription, switchMap } from 'rxjs';

interface Crumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  crumbs: Crumb[] = [];
  sub!: Subscription;
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(
        filter((evt) => evt instanceof NavigationEnd),
        map(() => this.buildBreadCrumb(this.route.root))
      )
      .subscribe((crumbs) => (this.crumbs = crumbs));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private buildBreadCrumb(
    route: ActivatedRoute,
    url: string = '',
    crumbs: Crumb[] = []
  ): any {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';

    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return crumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data[ROUTE_DATA_BREADCRUMB];
      if (!label) {
        return this.buildBreadCrumb(child, url, crumbs);
      }
      crumbs.push({ label, url });
      return this.buildBreadCrumb(child, url, crumbs);
    }
  }
}
