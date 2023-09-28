//import './wdyr';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore, compose } from 'redux';
import { install as installReduxLoop } from 'redux-loop';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

import './stylesheets/tailwind.css';
import './stylesheets/loading.css';
import './stylesheets/patterns.css';

import reducers from './reducers';
import { init } from './actions';
import { queue, discard, effect } from './apis/customOffline';
import {
  FETCH, FETCH_MORE, EXTRACT_CONTENTS, DELETE_OLD_LINKS_IN_TRASH,
} from './types/actionTypes';
import { isObject } from './utils';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import App from './components/App';

offlineConfig.queue = queue;
offlineConfig.discard = discard;
offlineConfig.effect = effect;
offlineConfig.persistCallback = () => {
  init(store);
};
offlineConfig.dispatch = (...args) => {
  store.dispatch(...args);
};
offlineConfig.persistOptions = {
  blacklist: [
    'user', 'stacksAccess', 'hasMoreLinks', 'images', 'fetched', 'fetchedMore',
    'isFetchMoreInterrupted', 'refreshFetched', 'linkEditor', 'customEditor',
    'tagEditor', 'listNameEditors', 'tagNameEditors', 'timePick', 'lockEditor', 'iap',
    'migrateHub',
  ],
};
offlineConfig.filterOutboxRehydrate = (outbox) => {
  return outbox.filter(action => {
    if (!isObject(action)) return false;
    return ![
      FETCH, FETCH_MORE, EXTRACT_CONTENTS, DELETE_OLD_LINKS_IN_TRASH,
    ].includes(action.type);
  });
};

/** @ts-expect-error */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  /** @type {any} */(reducers),
  composeEnhancers(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
    offline(offlineConfig),
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
