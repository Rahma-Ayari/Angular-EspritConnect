import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

/**
 * Navigate between child routes of the jobs feature.
 * Works when mounted under /entreprise/jobs (enterprise) or /dashboard/jobs (future).
 */
export function navigateJobs(
  router: Router,
  route: ActivatedRoute,
  commands: (string | number)[],
  extras?: NavigationExtras
): void {
  router.navigate(commands, { relativeTo: findJobsLayoutRoute(route), ...extras });
}

function findJobsLayoutRoute(route: ActivatedRoute): ActivatedRoute {
  let current: ActivatedRoute | null = route;
  while (current) {
    const children = current.routeConfig?.children;
    if (children?.some((c) => c.path === 'all')) {
      return current;
    }
    current = current.parent;
  }
  return route;
}
