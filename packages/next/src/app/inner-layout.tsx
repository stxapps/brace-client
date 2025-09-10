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
    if (rtmCount > prevRtmCount.current) dispatch(linkTo(router, '/'));
    prevRtmCount.current = rtmCount;
  }, [rtmCount, dispatch, router]);

  useEffect(() => {
    dispatch(updateHref(window.location.href));
  }, [pathname, searchParams, hash, dispatch]);

  useEffect(() => {
    const detail: RouteChangeCompleteEventDetail = { pathname, searchParams };
    const event = new CustomEvent<RouteChangeCompleteEventDetail>(
      'routeChangeComplete', { detail }
    );
    window.dispatchEvent(event);
  }, [pathname, searchParams]);

  useEffect(() => {
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (
      isPWAInstalled && 'serviceWorker' in navigator && window.serwist !== undefined
    ) {
      window.serwist.register();
      window.serwist.addEventListener('waiting', () => {
        dispatch(showSWWUPopup());
      });
    }
  }, [dispatch]);

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
