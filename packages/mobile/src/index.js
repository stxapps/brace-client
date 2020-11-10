//import './wdyr';

import React from 'react';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { install as installReduxLoop } from 'redux-loop';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import {
  SafeAreaProvider, initialWindowMetrics, SafeAreaView,
} from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';

import reducers from './reducers';
import { init, updateMenuPopupAsBackPressed } from './actions'
import { queue, discard, effect } from './apis/customOffline'

import App from './components/App';
import Share from './components/Share';

offlineConfig.queue = queue;
offlineConfig.discard = discard;
offlineConfig.effect = effect;
offlineConfig.persistCallback = () => {
  init(store);
};
offlineConfig.dispatch = (...args) => {
  store.dispatch(...args);
};

/** @ts-ignore */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  /** @ts-ignore */
  reducers,
  composeEnhancers(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
    offline(offlineConfig),
  )
);
const backHandler = (menuProvider) => updateMenuPopupAsBackPressed(menuProvider, store.dispatch, store.getState);

const Root = () => {

  if (!styles.menuProviderStyle) styles.menuProviderStyle = { backdrop: { backgroundColor: 'black', opacity: 0.25 } };

  if (!styles.safeAreaViewStyle) styles.safeAreaViewStyle = { flex: 1, backgroundColor: 'white' };

  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <MenuProvider customStyles={styles.menuProviderStyle} backHandler={backHandler}>
          <SafeAreaView style={styles.safeAreaViewStyle}>
            <App />
          </SafeAreaView>
        </MenuProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export const ShareRoot = () => {

  if (!styles.shareSafeAreaViewStyle) styles.shareSafeAreaViewStyle = { flex: 1, backgroundColor: 'transparent' };

  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SafeAreaView style={styles.shareSafeAreaViewStyle}>
          <Share />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
};

const styles = {};

export default Root;
