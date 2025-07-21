import React, { useEffect, useRef } from 'react';
import { Text, TextInput, Platform, StatusBar } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { Slot, useRouter, usePathname, ExternalPathString } from 'expo-router';
import { ShareIntentProvider } from 'expo-share-intent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SystemBars } from 'react-native-edge-to-edge';
import 'expo-dev-client';

import {
  makeStore, AppStore, useDispatch, useSelector,
} from '@/store';
import { bindAddNextActionRef } from '@/store-next';
import { handleAppStateChange } from '@/actions/piece';
import { useAppState } from '@/components';
import { BLK_MODE } from '@/types/const';
import { getThemeMode } from '@/selectors';
import cache from '@/utils/cache';

// @ts-expect-error
Text.defaultProps = Text.defaultProps || {};
// @ts-expect-error
Text.defaultProps.allowFontScaling = false;
// @ts-expect-error
TextInput.defaultProps = TextInput.defaultProps || {};
// @ts-expect-error
TextInput.defaultProps.allowFontScaling = false;

function Initializer() {
  const appState = useAppState();
  const pathname = usePathname();
  const prevAppState = useRef(null);
  const prevPathname = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (prevAppState.current === null || prevPathname.current === null) {
      prevAppState.current = appState;
      prevPathname.current = pathname;
      return;
    }
    if (appState !== prevAppState.current || pathname !== prevPathname.current) {
      dispatch(handleAppStateChange(appState, pathname));
    }
    prevAppState.current = appState;
    prevPathname.current = pathname;
  }, [appState, pathname, dispatch]);

  return null;
}

const InnerRoot = () => {
  const statusBarStyleCount = useSelector(
    state => state.display.updateStatusBarStyleCount
  );
  const themeMode = useSelector(state => getThemeMode(state));

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const txtColor = themeMode === BLK_MODE ? 'light-content' : 'dark-content';
      StatusBar.setBarStyle(txtColor);
    }
  }, [statusBarStyleCount, themeMode]);

  const txtColor = themeMode === BLK_MODE ? 'light' : 'dark';
  const bgColor = themeMode === BLK_MODE ? 'rgb(17, 24, 39)' : 'white';

  return (
    <SafeAreaView style={cache('SI_safeAreaView', { flex: 1, backgroundColor: bgColor }, [bgColor])}>
      <Slot />
      <SystemBars style={txtColor} />
    </SafeAreaView>
  );
};

export default function Root() {
  const router = useRouter();
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    const { store, addNextAction } = makeStore();
    storeRef.current = store;
    bindAddNextActionRef(addNextAction);
  }

  return (
    <ShareIntentProvider
      options={{
        debug: false,
        resetOnBackground: false,
        onResetShareIntent: () => router.replace('/' as ExternalPathString),
      }}
    >
      <ReduxProvider store={storeRef.current}>
        <Initializer />
        <KeyboardProvider>
          <InnerRoot />
        </KeyboardProvider>
      </ReduxProvider>
    </ShareIntentProvider>
  );
}
