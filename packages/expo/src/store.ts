import {
  useStore as _useStore, useSelector as _useSelector, useDispatch as _useDispatch,
} from 'react-redux';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import { composeWithDevTools } from 'redux-devtools-expo-dev-plugin';

import reducers from '@/reducers';
import { init } from '@/actions';
import { queue, discard, effect } from '@/apis/customOffline';
import {
  FETCH, FETCH_MORE, EXTRACT_CONTENTS, DELETE_OLD_LINKS_IN_TRASH,
} from '@/types/actionTypes';
import { isObject } from '@/utils';

export const makeStore = () => {
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
      'isFetchMoreInterrupted', 'refreshFetched', 'display', 'linkEditor', 'customEditor',
      'tagEditor', 'listNameEditors', 'tagNameEditors', 'timePick', 'lockEditor', 'iap',
      'conflictedSettings',
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

  let nextActions = [];
  const addNextAction = (action) => {
    nextActions.push(action);
  };

  const enhancers = composeWithDevTools(applyMiddleware(thunk), offline(offlineConfig));
  const store = createStore(reducers, enhancers);
  store.subscribe(() => {
    const itnActions = [...nextActions];
    nextActions = [];

    for (const action of itnActions) {
      setTimeout(() => {
        store.dispatch(action);
      }, 100);
    }
  });
  return { store, addNextAction };
};

type MakeStoreReturn = ReturnType<typeof makeStore>;
export type AppStore = MakeStoreReturn['store'];
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];
export type RootState = ReturnType<AppGetState>;

export const useStore = _useStore.withTypes<AppStore>();
export const useSelector = _useSelector.withTypes<RootState>();
export const useDispatch = _useDispatch.withTypes<AppDispatch>();
