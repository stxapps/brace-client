import { Keyboard, Appearance, AppState, Alert } from 'react-native';
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import { getCalendars } from 'expo-localization';

import userSession from '../userSession';
import cacheApi from '../apis/localCache';
import fileApi from '../apis/localFile';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_STACKS_ACCESS, UPDATE_SEARCH_STRING,
  UPDATE_POPUP, UPDATE_BULK_EDITING, REFRESH_FETCHED, UPDATE_SYSTEM_THEME_MODE,
  UPDATE_IS_24H_FORMAT, INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, BLOCKSTACK_AUTH, SIGN_UP_POPUP, SIGN_IN_POPUP,
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, CARD_ITEM_MENU_POPUP, LIST_NAMES_POPUP,
  PIN_MENU_POPUP, BULK_EDIT_MENU_POPUP, CUSTOM_EDITOR_POPUP, TAG_EDITOR_POPUP,
  PAYWALL_POPUP, CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP,
  LOCK_EDITOR_POPUP, SWWU_POPUP, WHT_MODE, BLK_MODE,
} from '../types/const';
import { isFldStr, getUserUsername, getUserImageUrl } from '../utils';
import vars from '../vars';

let _didInit;
export const init = () => async (dispatch, getState) => {
  if (_didInit) return;
  _didInit = true;

  const store = { dispatch, getState };

  const hasSession = await userSession.hasSession();
  if (!hasSession) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH,
      callbackUrlScheme: APP_URL_SCHEME,
    };
    await userSession.createSession(config);
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  let username = null, userImage = null, userHubUrl = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = getUserUsername(userData);
    userImage = getUserImageUrl(userData);
    userHubUrl = userData.hubUrl;
  }

  const darkMatches = Appearance.getColorScheme() === 'dark';
  const is24HFormat = await is24HourFormat();

  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      userHubUrl,
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
    },
  });

  Keyboard.addListener('keyboardWillShow', () => {
    store.dispatch(increaseUpdateStatusBarStyleCount());
  });
  Keyboard.addListener('keyboardDidShow', () => {
    store.dispatch(increaseUpdateStatusBarStyleCount());
  });
  Keyboard.addListener('keyboardDidHide', () => {
    store.dispatch(increaseUpdateStatusBarStyleCount());
  });

  Appearance.addChangeListener((e) => {
    const systemThemeMode = e.colorScheme === 'dark' ? BLK_MODE : WHT_MODE;
    store.dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });

  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') store.dispatch(increaseUpdateStatusBarStyleCount());
  });
};

const getPopupShownId = (state) => {
  // No need these popups here:
  //   SettingsErrorPopup, PinErrorPopup, TagErrorPopup, AccessErrorPopup,
  //   SWWUPopup, and HubErrorPopup.
  if (state.display.isLockEditorPopupShown) return LOCK_EDITOR_POPUP;
  if (state.display.isTimePickPopupShown) return TIME_PICK_POPUP;
  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;
  if (state.display.isConfirmDiscardPopupShown) return CONFIRM_DISCARD_POPUP;
  if (state.display.isPaywallPopupShown) return PAYWALL_POPUP;
  if (state.display.isTagEditorPopupShown) return TAG_EDITOR_POPUP;
  if (state.display.isCustomEditorPopupShown) return CUSTOM_EDITOR_POPUP;
  if (state.display.isBulkEditMenuPopupShown) return BULK_EDIT_MENU_POPUP;
  if (state.display.isPinMenuPopupShown) return PIN_MENU_POPUP;
  if (state.display.isListNamesPopupShown) return LIST_NAMES_POPUP;
  if (state.display.isCardItemMenuPopupShown) return CARD_ITEM_MENU_POPUP;
  if (state.display.isSettingsListsMenuPopupShown) return SETTINGS_LISTS_MENU_POPUP;
  if (state.display.isSettingsTagsMenuPopupShown) return SETTINGS_TAGS_MENU_POPUP;
  if (state.display.isSettingsPopupShown) return SETTINGS_POPUP;
  if (state.display.isProfilePopupShown) return PROFILE_POPUP;
  if (state.display.isAddPopupShown) return ADD_POPUP;
  if (state.display.isSignUpPopupShown) return SIGN_UP_POPUP;
  if (state.display.isSignInPopupShown) return SIGN_IN_POPUP;

  // IMPORTANT that search is on the last as updatePopupAsBackPressed relies on this
  //   to close other popups before search (search is the last to be closed).
  if (state.display.isSearchPopupShown) return SEARCH_POPUP;

  return null;
};

export const isPopupShown = (state) => {
  return getPopupShownId(state) !== null;
};

export const signOut = () => async (dispatch, getState) => {
  await userSession.signUserOut();
  await resetState(dispatch);
};

export const updateUserData = (data) => async (dispatch, getState) => {
  try {
    await userSession.updateUserData(data);
  } catch (error) {
    Alert.alert('Update user data failed!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    return;
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) dispatch(updateUserSignedIn());
};

export const updateUserSignedIn = () => async (dispatch, getState) => {
  await resetState(dispatch);

  const userData = await userSession.loadUserData();
  dispatch({
    type: UPDATE_USER,
    payload: {
      isUserSignedIn: true,
      username: getUserUsername(userData),
      image: getUserImageUrl(userData),
      hubUrl: userData.hubUrl,
    },
  });
};

const resetState = async (dispatch) => {
  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  // clear file storage
  await cacheApi.deleteAllFiles();
  await fileApi.deleteAllFiles();

  // clear cached fpaths
  vars.cachedServerFPaths.fpaths = null;

  // clear vars
  vars.fetch.dt = 0;
  vars.randomHouseworkTasks.dt = 0;

  // clear all user data!
  dispatch({ type: RESET_STATE });
};

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

export const updatePopup = (
  id, isShown, anchorPosition = null, replaceId = null
) => async (dispatch, getState) => {
  dispatch({
    type: UPDATE_POPUP, payload: { id, isShown, anchorPosition },
  });
  if (isShown && isFldStr(replaceId)) {
    dispatch({
      type: UPDATE_POPUP, payload: { id: replaceId, isShown: false },
    });
  }
};

export const updateSearchString = (searchString) => {
  return { type: UPDATE_SEARCH_STRING, payload: searchString };
};

export const updateHref = (href) => {
  return { type: UPDATE_HREF, payload: href };
};

export const updateBulkEdit = (isBulkEditing) => {
  return { type: UPDATE_BULK_EDITING, payload: isBulkEditing };
};

export const refreshFetched = (doShowLoading = false, doScrollTop = false) => async (
  dispatch, getState
) => {
  // No show loading refresh e.g., inactive to active
  //   - no show loading, no scroll top
  //   - fetch settings, fetch links, check and show fetchedPopup

  // Show loading refresh e.g., press refresh button
  //   - show loading, scroll top
  //   - fetch settings, fetch links, force update no cache

  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const lnOrQt = queryString ? queryString : listName;

  const payload = { lnOrQt, doShowLoading, doScrollTop };
  dispatch({ type: REFRESH_FETCHED, payload });
};

export const is24HourFormat = async () => {
  const cals = getCalendars();
  if (Array.isArray(cals) && cals.length > 0) {
    return cals[0].uses24hourClock === true;
  }
  return false;
};

export const updateIs24HFormat = (is24HFormat) => {
  return { type: UPDATE_IS_24H_FORMAT, payload: is24HFormat };
};

export const showSWWUPopup = () => async (dispatch, getState) => {
  dispatch(updatePopup(SWWU_POPUP, true));
};

export const increaseUpdateStatusBarStyleCount = () => {
  return { type: INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT };
};
