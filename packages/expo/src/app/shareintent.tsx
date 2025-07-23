import { Redirect } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';

import Share from '@/components/Share';

export default function ShareIntent() {
  const { hasShareIntent } = useShareIntentContext();

  if (!hasShareIntent) return <Redirect href="/" />;
  return <Share />;
}
