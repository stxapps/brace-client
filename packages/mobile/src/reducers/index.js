import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import linksReducer from './linksReducer';
import hasMoreLinksReducer from './hasMoreLinksReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';

export default combineReducers({
  window: windowReducer,
  links: linksReducer,
  hasMoreLinks: hasMoreLinksReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
});