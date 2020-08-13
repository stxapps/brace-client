import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { install as installReduxLoop } from 'redux-loop';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

import './stylesheets/tailwind.css';
import './stylesheets/loading.css';
import './stylesheets/patterns.css';

import { BLOCKSTACK_AUTH } from './types/const';
import reducers from './reducers';
import { init } from './actions';
import { queue, discard, effect } from './apis/customOffline';
import { getUrlPathQueryHash } from './utils';
import * as serviceWorker from './serviceWorker';

import App from './components/App';
import BlockstackAuth from './components/BlockstackAuth';

if (getUrlPathQueryHash(window.location.href).startsWith(BLOCKSTACK_AUTH.slice(1))) {
  ReactDOM.render(
    <React.StrictMode>
      <BlockstackAuth />
    </React.StrictMode>,
    document.getElementById('root')
  );
} else {

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

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
