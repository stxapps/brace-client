export interface RouteChangeCompleteEventDetail {
  pathname: string;
  searchParams: URLSearchParams;
}

declare global {
  interface WindowEventMap {
    'routeChangeComplete': CustomEvent<RouteChangeCompleteEventDetail>;
  }
}
