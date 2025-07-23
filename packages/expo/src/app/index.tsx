import { Redirect } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';

import App from '@/components/App';

export default function Home() {
  const { hasShareIntent } = useShareIntentContext();

  if (hasShareIntent) return <Redirect href="/shareintent" />;
  return <App />;
}
