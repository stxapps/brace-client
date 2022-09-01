import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import linksReducer from './linksReducer';
import hasMoreLinksReducer from './hasMoreLinksReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';
import localSettingsReducer from './localSettingsReducer';
import fetchedReducer from './fetchedReducer';
import isFetchMoreInterrupted from './isFetchMoreInterrupted';
import fetchedMoreReducer from './fetchedMoreReducer';
import refreshFetchedReducer from './refreshFetchedReducer';
import stacksAccessReducer from './stacksAccessReducer';
import snapshotReducer from './snapshotReducer';
import linkEditorReducer from './linkEditorReducer';
import listNameEditorsReducer from './listNameEditorsReducer';
import iapReducer from './iapReducer';
import cachedFPathsReducer from './cachedFPathsReducer';
import pendingPinsReducer from './pendingPinsReducer';
import timePickReducer from './timePickReducer';

export default combineReducers({
  window: windowReducer,
  links: linksReducer,
  hasMoreLinks: hasMoreLinksReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
  localSettings: localSettingsReducer,
  fetched: fetchedReducer,
  isFetchMoreInterrupted: isFetchMoreInterrupted,
  fetchedMore: fetchedMoreReducer,
  refreshFetched: refreshFetchedReducer,
  stacksAccess: stacksAccessReducer,
  snapshot: snapshotReducer,
  linkEditor: linkEditorReducer,
  listNameEditors: listNameEditorsReducer,
  iap: iapReducer,
  cachedFPaths: cachedFPathsReducer,
  pendingPins: pendingPinsReducer,
  timePick: timePickReducer,
});
