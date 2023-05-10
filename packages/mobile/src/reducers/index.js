import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import linksReducer from './linksReducer';
import hasMoreLinksReducer from './hasMoreLinksReducer';
import fetchedReducer from './fetchedReducer';
import isFetchMoreInterrupted from './isFetchMoreInterrupted';
import fetchedMoreReducer from './fetchedMoreReducer';
import refreshFetchedReducer from './refreshFetchedReducer';
import imagesReducer from './imagesReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';
import conflictedSettingsReducer from './conflictedSettingsReducer';
import localSettingsReducer from './localSettingsReducer';
import infoReducer from './infoReducer';
import linkEditorReducer from './linkEditorReducer';
import customEditorReducer from './customEditorReducer';
import stacksAccessReducer from './stacksAccessReducer';
import snapshotReducer from './snapshotReducer';
import listNameEditorsReducer from './listNameEditorsReducer';
import iapReducer from './iapReducer';
import cachedFPathsReducer from './cachedFPathsReducer';
import pendingPinsReducer from './pendingPinsReducer';
import timePickReducer from './timePickReducer';
import migrateHubReducer from './migrateHubReducer';

export default combineReducers({
  window: windowReducer,
  links: linksReducer,
  hasMoreLinks: hasMoreLinksReducer,
  fetched: fetchedReducer,
  isFetchMoreInterrupted: isFetchMoreInterrupted,
  fetchedMore: fetchedMoreReducer,
  refreshFetched: refreshFetchedReducer,
  images: imagesReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
  conflictedSettings: conflictedSettingsReducer,
  localSettings: localSettingsReducer,
  info: infoReducer,
  linkEditor: linkEditorReducer,
  customEditor: customEditorReducer,
  stacksAccess: stacksAccessReducer,
  snapshot: snapshotReducer,
  listNameEditors: listNameEditorsReducer,
  iap: iapReducer,
  cachedFPaths: cachedFPathsReducer,
  pendingPins: pendingPinsReducer,
  timePick: timePickReducer,
  migrateHub: migrateHubReducer,
});
