import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: 'calc(100vh - 3.75rem - 6.5rem)' }} className="relative mx-auto flex max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 xl:px-12">
      <p className="text-sm font-medium text-white">404</p>
      <h1 className="mt-3 text-3xl tracking-tight text-white">Page not found</h1>
      <p className="mt-2.5 text-sm text-slate-400">Sorry, we couldn’t find the page you’re looking for.</p>
      <Link href="/" className="mt-8 text-sm font-medium text-white">Go back home</Link>
    </div>
  );
}
