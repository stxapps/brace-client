'use client';
import { useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { makeStore, AppStore } from '@/store';
import { bindAddNextActionRef } from '@/store-next';
import { useTailwind } from '@/components';

export function InnerRoot({ children }: { children: React.ReactNode }) {
  const tailwind = useTailwind();
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    const { store, addNextAction } = makeStore();
    storeRef.current = store;
    bindAddNextActionRef(addNextAction);
  }

  return (
    <ReduxProvider store={storeRef.current}>
      <div className={tailwind('safe-area min-h-screen bg-white blk:bg-gray-900')}>
        {children}
      </div>
    </ReduxProvider>
  );
}
