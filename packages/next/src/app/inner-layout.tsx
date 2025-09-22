'use client';
import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Provider as ReduxProvider } from 'react-redux';

import type { RouteChangeCompleteEventDetail } from '@/declarations';
import { makeStore, AppStore, useSelector, useDispatch } from '@/store';
import { bindAddNextActionRef } from '@/store-next';
import { init, updateHref, linkTo, showSWWUPopup } from '@/actions';
import { useTailwind, useHash } from '@/components';

function Initializer() {
  const didPersistCallback = useSelector(state => state.appState.didPersistCallback);
  const rtmCount = useSelector(state => state.appState.redirectToMainCount);
  const prevRtmCount = useRef(rtmCount);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = useHash();
  const router = useRouter();

  useEffect(() => {
    if (didPersistCallback) dispatch(init());
  }, [didPersistCallback, dispatch]);

  useEffect(() => {
    if (rtmCount > prevRtmCount.current) {
      // 1. Root -> do nothing (handle in linkTo)
      // 2. Pages both /pricing and /#pricing -> link to '/'
      // 3. Adding (paths contains dots) -> do nothing
      if (window.location.pathname.includes('.')) return;
      dispatch(linkTo(router, '/'));
    }
    prevRtmCount.current = rtmCount;
  }, [rtmCount, dispatch, router]);

  useEffect(() => {
    dispatch(updateHref(window.location.href));
  }, [didPersistCallback, pathname, searchParams, hash, dispatch]);

  useEffect(() => {
    const detail: RouteChangeCompleteEventDetail = { pathname, searchParams };
    const event = new CustomEvent<RouteChangeCompleteEventDetail>(
      'routeChangeComplete', { detail }
    );
    window.dispatchEvent(event);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!('serviceWorker' in navigator && window.serwist !== undefined)) return;

    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    let didListenMedia = false, didRegister = false;
    const onWaiting = () => {
      dispatch(showSWWUPopup());
    };
    const register = () => {
      if (didRegister) return;
      window.serwist.register();
      window.serwist.addEventListener('waiting', onWaiting);
      didRegister = true;
    };
    const onMediaChange = () => {
      if (mediaQuery.matches) register();
    };
    const check = async () => {
      if (mediaQuery.matches) {
        register();
        return;
      }

      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        register();
        return;
      }

      mediaQuery.addEventListener('change', onMediaChange);
      didListenMedia = true;
    };

    check();
    return () => {
      if (didListenMedia) mediaQuery.removeEventListener('change', onMediaChange);
      if (didRegister) window.serwist.removeEventListener('waiting', onWaiting);
    };
  }, [dispatch]);

  // Fix Back/Forward between URLs have hash changing.
  // https://github.com/bootleq/feeders/commit/c211ff7c527bc3ca24694a2e39b21e62778e0348
  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname !== pathname) {
        router.replace(window.location.href);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [pathname, router]);

  return null;
}

function SafeArea({ children }: { children: React.ReactNode }) {
  const tailwind = useTailwind();

  return (
    <div className={tailwind('safe-area min-h-screen bg-white blk:bg-gray-900')}>
      {children}
    </div>
  );
}

export function InnerLayout({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    const { store, addNextAction } = makeStore();
    storeRef.current = store;
    bindAddNextActionRef(addNextAction);
  }

  return (
    <ReduxProvider store={storeRef.current}>
      <Suspense fallback={null}>
        <Initializer />
      </Suspense>
      <SafeArea>
        {children}
      </SafeArea>
    </ReduxProvider>
  );
}
