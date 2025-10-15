'use client';
import { useEffect } from 'react';

import { HASH_SUPPORT } from '@/types/const';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen w-screen max-w-full bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-red-600 sm:text-5xl">5XX</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">An error occured</h1>
              <p className="mt-2.5 text-base text-gray-500">It&apos;s likely to be a network issue. Please wait a moment, check your internet connection and try to refresh the page. If the problem persists, please <a className="rounded-xs underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
              <p className="mt-2.5 text-sm text-gray-500">{error.message}</p>
              <div className="mt-6">
                <button onClick={() => reset()} className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-red-700 focus:outline-none focus:ring">Try again</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
