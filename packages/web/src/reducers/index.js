import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import linksReducer from './linksReducer';
import hasMoreLinksReducer from './hasMoreLinksReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';
import fetchedReducer from './fetchedReducer';
import isFetchMoreInterrupted from './isFetchMoreInterrupted';
import stacksAccessReducer from './stacksAccessReducer';
import snapshotReducer from './snapshotReducer';
import listNameEditorsReducer from './listNameEditorsReducer';

export default combineReducers({
  window: windowReducer,
  links: linksReducer,
  hasMoreLinks: hasMoreLinksReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
  fetched: fetchedReducer,
  isFetchMoreInterrupted: isFetchMoreInterrupted,
  stacksAccess: stacksAccessReducer,
  snapshot: snapshotReducer,
  listNameEditors: listNameEditorsReducer,
});
