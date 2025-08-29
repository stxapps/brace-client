import { combineReducers } from 'redux';

import windowReducer from './windowReducer';
import linksReducer from './linksReducer';
import fetchedReducer from './fetchedReducer';
import fetchedMoreReducer from './fetchedMoreReducer';
import imagesReducer from './imagesReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';
import conflictedSettingsReducer from './conflictedSettingsReducer';
import localSettingsReducer from './localSettingsReducer';
import infoReducer from './infoReducer';
import linkEditorReducer from './linkEditorReducer';
import customEditorReducer from './customEditorReducer';
import tagEditorReducer from './tagEditorReducer';
import stacksAccessReducer from './stacksAccessReducer';
import snapshotReducer from './snapshotReducer';
import listNameEditorsReducer from './listNameEditorsReducer';
import tagNameEditorsReducer from './tagNameEditorsReducer';
import iapReducer from './iapReducer';
import cachedFPathsReducer from './cachedFPathsReducer';
import pendingSsltsReducer from './pendingSsltsReducer';
import pendingPinsReducer from './pendingPinsReducer';
import pendingTagsReducer from './pendingTagsReducer';
import timePickReducer from './timePickReducer';
import lockSettingsReducer from './lockSettingsReducer';
import lockEditorReducer from './lockEditorReducer';

export default combineReducers({
  window: windowReducer,
  links: linksReducer,
  fetched: fetchedReducer,
  fetchedMore: fetchedMoreReducer,
  images: imagesReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
  conflictedSettings: conflictedSettingsReducer,
  localSettings: localSettingsReducer,
  info: infoReducer,
  linkEditor: linkEditorReducer,
  customEditor: customEditorReducer,
  tagEditor: tagEditorReducer,
  stacksAccess: stacksAccessReducer,
  snapshot: snapshotReducer,
  listNameEditors: listNameEditorsReducer,
  tagNameEditors: tagNameEditorsReducer,
  iap: iapReducer,
  cachedFPaths: cachedFPathsReducer,
  pendingSslts: pendingSsltsReducer,
  pendingPins: pendingPinsReducer,
  pendingTags: pendingTagsReducer,
  timePick: timePickReducer,
  lockSettings: lockSettingsReducer,
  lockEditor: lockEditorReducer,
});
