import {
  Linking, AppState, Platform, Appearance, Alert, DeviceEventEmitter,
} from 'react-native';
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import { is24HourFormat } from 'react-native-device-time-format';
import FlagSecure from 'react-native-flag-secure';

import userSession from '../userSession';
import cacheApi from '../apis/localCache';
import fileApi from '../apis/localFile';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_STACKS_ACCESS, UPDATE_SEARCH_STRING,
  UPDATE_POPUP, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING, REFRESH_FETCHED,
  REQUEST_PURCHASE, UPDATE_SYSTEM_THEME_MODE, UPDATE_IS_24H_FORMAT,
  UPDATE_LOCKS_FOR_ACTIVE_APP, UPDATE_LOCKS_FOR_INACTIVE_APP,
  INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH,
  APP_GROUP_SHARE, APP_GROUP_SHARE_UKEY, APP_GROUP_SHARE_SKEY, APP_GROUP_SHARE_PKEY,
  SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  CARD_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, BULK_EDIT_MENU_POPUP,
  CUSTOM_EDITOR_POPUP, TAG_EDITOR_POPUP, PAYWALL_POPUP, CONFIRM_DELETE_POPUP,
  CONFIRM_DISCARD_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP,
  SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP, LOCK_EDITOR_POPUP, SWWU_POPUP, MY_LIST,
  WHT_MODE, BLK_MODE, APP_STATE_ACTIVE, APP_STATE_INACTIVE, APP_STATE_BACKGROUND,
} from '../types/const';
import {
  isObject, separateUrlAndParam, getUserUsername, getUserImageUrl, doListContainUnlocks,
} from '../utils';
import vars from '../vars';

import DefaultPreference from 'react-native-default-preference';
if (Platform.OS === 'ios') DefaultPreference.setName(APP_GROUP_SHARE);

export const init = async (store) => {

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

  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    await handlePendingSignIn(initialUrl)(store.dispatch, store.getState);
  }

  Linking.addEventListener('url', async (e) => {
    await handlePendingSignIn(e.url)(store.dispatch, store.getState);
  });

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
      href: DOMAIN_NAME + '/',
      windowWidth: null,
      windowHeight: null,
      visualWidth: null,
      visualHeight: null,
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
    },
  });

  Appearance.addChangeListener((e) => {
    const systemThemeMode = e.colorScheme === 'dark' ? BLK_MODE : WHT_MODE;
    store.dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });
};

const handlePendingSignIn = (url) => async (dispatch, getState) => {

  if (!url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH) &&
    !url.startsWith(APP_DOMAIN_NAME + BLOCKSTACK_AUTH)) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true,
  });

  const { param: { authResponse } } = separateUrlAndParam(url, 'authResponse');
  try {
    await userSession.handlePendingSignIn(authResponse);
  } catch (error) {
    console.log('Catched an error thrown by handlePendingSignIn', error);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) dispatch(updateUserSignedIn());

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
};

let _didAddAppStateChangeListener;
export const addAppStateChangeListener = () => (dispatch, getState) => {
  // This listener is added in Main.js and never remove.
  // Add when needed and let it there. Also, add only once.
  // Don't add in init, as Share also calls it.
  // Can't dispatch after init as init might not finished yet due to await.
  if (_didAddAppStateChangeListener) return;

  if (Platform.OS === 'android') {
    DeviceEventEmitter.addListener('onMainActivityResume', async () => {
      const nextAppState = APP_STATE_ACTIVE;
      await handleAppStateChange(nextAppState)(dispatch, getState);
      vars.appState.lastChangeDT = Date.now();
    });
    DeviceEventEmitter.addListener('onMainActivityPause', async () => {
      const nextAppState = APP_STATE_BACKGROUND;
      await handleAppStateChange(nextAppState)(dispatch, getState);
      vars.appState.lastChangeDT = Date.now();
    });
  } else {
    AppState.addEventListener('change', async (nextAppState) => {
      await handleAppStateChange(nextAppState)(dispatch, getState);
      vars.appState.lastChangeDT = Date.now();
    });
  }

  _didAddAppStateChangeListener = true;
};

const handleAppStateChange = (nextAppState) => async (dispatch, getState) => {
  // AppState is host level, trigger events on any activity.
  // For iOS, Share is pure native, so this won't be called. Can just use AppState.
  // For Android, need to use ActivityState so this is called only for App, not Share.
  const isUserSignedIn = getState().user.isUserSignedIn;

  if (nextAppState === APP_STATE_ACTIVE) {
    const doForceLock = getState().display.doForceLock;
    const isLong = (Date.now() - vars.appState.lastChangeDT) > 21 * 60 * 1000;
    const lockedLists = getState().lockSettings.lockedLists;
    const doNoChangeMyList = (
      isObject(lockedLists[MY_LIST]) &&
      lockedLists[MY_LIST].canChangeListNames === false
    );
    if (doForceLock || (isUserSignedIn && isLong)) {
      if (Platform.OS === 'android') FlagSecure.deactivate();
      dispatch({
        type: UPDATE_LOCKS_FOR_ACTIVE_APP,
        payload: { isLong, doNoChangeMyList },
      });
    }

    if (isUserSignedIn) {
      const { purchaseStatus } = getState().iap;
      if (purchaseStatus === REQUEST_PURCHASE) return;
    }

    const is24HFormat = await is24HourFormat();
    dispatch(updateIs24HFormat(is24HFormat));

    if (!isUserSignedIn) return;

    let didShare = false;
    if (Platform.OS === 'ios') {
      const res = await DefaultPreference.get(APP_GROUP_SHARE_SKEY);
      didShare = res === 'didShare=true';
    }
    const interval = (Date.now() - vars.fetch.dt) / 1000 / 60 / 60;
    if (!didShare && interval < 0.6) return;
    if (isPopupShown(getState()) && interval < 0.9) return;

    dispatch(refreshFetched());
  }

  let isInactive = nextAppState === APP_STATE_INACTIVE;
  if (Platform.OS === 'android') isInactive = nextAppState === APP_STATE_BACKGROUND;
  if (isInactive) {
    if (Platform.OS === 'ios') {
      await DefaultPreference.set(APP_GROUP_SHARE_SKEY, '');
    }

    if (!isUserSignedIn) return;

    const { purchaseStatus } = getState().iap;
    if (purchaseStatus === REQUEST_PURCHASE) return;

    const doLCU = doListContainUnlocks(getState());
    if (doLCU) {
      if (Platform.OS === 'android') FlagSecure.activate();
      dispatch({ type: UPDATE_LOCKS_FOR_INACTIVE_APP });
    }
  }
};

const getPopupShownId = (state) => {
  // No need these popups here:
  //   SettingsErrorPopup, PinErrorPopup, TagErrorPopup, AccessErrorPopup,
  //   and SWWUPopup.
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

export const updateMenuPopupAsBackPressed = (menuProvider, dispatch, getState) => {

  if (menuProvider.isMenuOpen()) {
    const id = getPopupShownId(getState());
    if (id) {
      menuProvider.closeMenu();
      dispatch(updatePopup(id, false));
      return true;
    }
  }

  return false;
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
  if (Platform.OS === 'ios') {
    await DefaultPreference.set(APP_GROUP_SHARE_UKEY, JSON.stringify(userData));
  }
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
  if (Platform.OS === 'ios') await DefaultPreference.clearAll();

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

export const updateDefaultPreference = async (doExtractContents) => {
  if (Platform.OS !== 'ios') return;

  const value = doExtractContents ? 'doExtractContents=true' : '';
  await DefaultPreference.set(APP_GROUP_SHARE_PKEY, value);
};

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

export const updatePopup = (id, isShown, anchorPosition = null) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
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

export const updateIs24HFormat = (is24HFormat) => {
  return { type: UPDATE_IS_24H_FORMAT, payload: is24HFormat };
};

export const showSWWUPopup = () => async (dispatch, getState) => {
  dispatch(updatePopup(SWWU_POPUP, true));
};

export const increaseUpdateStatusBarStyleCount = () => {
  return { type: INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT };
};
