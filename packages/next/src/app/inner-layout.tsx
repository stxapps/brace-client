'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Provider as ReduxProvider } from 'react-redux';

import { makeStore, AppStore, useDispatch } from '@/store';
import { bindAddNextActionRef } from '@/store-next';
import { updateHref } from '@/actions';
import { useTailwind, useHash } from '@/components';

function Initializer() {
  const pathname = usePathname();
  const hash = useHash();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateHref(window.location.href));
  }, [pathname, hash, dispatch]);

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
      <Initializer />
      <SafeArea>
        {children}
      </SafeArea>
    </ReduxProvider>
  );
}
