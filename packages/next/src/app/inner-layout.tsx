'use client';
import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Provider as ReduxProvider } from 'react-redux';

import type { RouteChangeCompleteEventDetail } from '@/declarations';
import { makeStore, AppStore, useSelector, useDispatch } from '@/store';
import { bindAddNextActionRef } from '@/store-next';
import { updateHref, linkTo } from '@/actions';
import { useTailwind, useHash } from '@/components';

function Initializer() {
  const rtmCount = useSelector(state => state.display.redirectToMainCount);
  const prevRtmCount = useRef(rtmCount);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = useHash();
  const router = useRouter();

  useEffect(() => {
    if (rtmCount > prevRtmCount.current) dispatch(linkTo(router, '/'));
    prevRtmCount.current = rtmCount;
  }, [rtmCount]);

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
