import { useCallback } from 'react';
import { useRouter, useFocusEffect, ExternalPathString } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';

export default function NotFound() {
  const router = useRouter();
  const { hasShareIntent } = useShareIntentContext();

  useFocusEffect(useCallback(() => {
    if (hasShareIntent) {
      router.replace('/shareintent' as ExternalPathString);
    } else {
      router.replace('/' as ExternalPathString);
    }
  }, [router, hasShareIntent]));

  return null;
}
