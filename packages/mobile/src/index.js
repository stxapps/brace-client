import React from 'react';
import { SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { install as installReduxLoop } from 'redux-loop';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import { MenuProvider } from 'react-native-popup-menu';

import App from './components/App';
import Adding from './components/Adding';

import reducers from './reducers';
import { init } from './actions'
import { queue, discard, effect } from './apis/customOffline'

offlineConfig.queue = queue;
offlineConfig.discard = discard;
offlineConfig.effect = effect;
offlineConfig.persistCallback = () => {
  init(store);
};
offlineConfig.dispatch = (...args) => {
  store.dispatch(...args);
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducers,
  composeEnhancers(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
    offline(offlineConfig),
  )
);

const Root = () => {
  return (
    <Provider store={store}>
      <MenuProvider customStyles={{ backdrop: { backgroundColor: 'black', opacity: 0.25 } }} backHandler={true}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}><App /></SafeAreaView>
      </MenuProvider>
    </Provider>
  );
};

export const Share = () => {
  return (
    <Provider store={store}>
      <Adding />
    </Provider>
  );
};

export default Root;
