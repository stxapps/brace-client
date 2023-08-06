import { Linking, AppState, Platform, Appearance, Alert } from 'react-native';
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
//import RNFS from 'react-native-fs';
import * as iapApi from 'react-native-iap';
import { LexoRank } from '@wewatch/lexorank';
import { is24HourFormat } from 'react-native-device-time-format';
import FlagSecure from 'react-native-flag-secure';

import userSession from '../userSession';
import axios from '../axiosWrapper';
import mhApi from '../apis/migrateHub';
import dataApi from '../apis/blockstack';
import serverApi from '../apis/server';
import fileApi from '../apis/localFile';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_STACKS_ACCESS, UPDATE_LIST_NAME, UPDATE_POPUP,
  UPDATE_SEARCH_STRING, UPDATE_LINK_EDITOR, UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN,
  UPDATE_BULK_EDITING, ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS,
  UPDATE_SELECTING_LINK_ID, FETCH, FETCH_COMMIT, FETCH_ROLLBACK, CACHE_FETCHED,
  UPDATE_FETCHED, FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE,
  CLEAR_FETCHED_LIST_NAMES, REFRESH_FETCHED, ADD_LINKS, ADD_LINKS_COMMIT,
  ADD_LINKS_ROLLBACK, UPDATE_LINKS, DELETE_LINKS, DELETE_LINKS_COMMIT,
  DELETE_LINKS_ROLLBACK, MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT,
  MOVE_LINKS_ADD_STEP_ROLLBACK, MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT,
  MOVE_LINKS_DELETE_STEP_ROLLBACK, CANCEL_DIED_LINKS, DELETE_OLD_LINKS_IN_TRASH,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_EXTRACTED_CONTENTS, UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES,
  UPDATE_LIST_NAMES, MOVE_LIST_NAME, MOVE_TO_LIST_NAME, DELETE_LIST_NAMES,
  UPDATE_SELECTING_LIST_NAME, UPDATE_DELETING_LIST_NAME, UPDATE_DO_EXTRACT_CONTENTS,
  UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH, UPDATE_DO_DESCENDING_ORDER, UPDATE_SETTINGS,
  UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK, UPDATE_INFO, UPDATE_INFO_COMMIT,
  UPDATE_INFO_ROLLBACK, CANCEL_DIED_SETTINGS, MERGE_SETTINGS, MERGE_SETTINGS_COMMIT,
  MERGE_SETTINGS_ROLLBACK, UPDATE_SETTINGS_VIEW_ID, UPDATE_DO_USE_LOCAL_LAYOUT,
  UPDATE_DEFAULT_LAYOUT_TYPE, UPDATE_LOCAL_LAYOUT_TYPE, UPDATE_DELETE_ACTION,
  UPDATE_DISCARD_ACTION, UPDATE_LIST_NAMES_MODE, GET_PRODUCTS, GET_PRODUCTS_COMMIT,
  GET_PRODUCTS_ROLLBACK, REQUEST_PURCHASE, REQUEST_PURCHASE_COMMIT,
  REQUEST_PURCHASE_ROLLBACK, RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT,
  RESTORE_PURCHASES_ROLLBACK, REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT,
  REFRESH_PURCHASES_ROLLBACK, UPDATE_IAP_PUBLIC_KEY, UPDATE_IAP_PRODUCT_STATUS,
  UPDATE_IAP_PURCHASE_STATUS, UPDATE_IAP_RESTORE_STATUS, UPDATE_IAP_REFRESH_STATUS,
  PIN_LINK, PIN_LINK_COMMIT, PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_COMMIT,
  UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_COMMIT,
  MOVE_PINNED_LINK_ADD_STEP_ROLLBACK, CANCEL_DIED_PINS, UPDATE_SYSTEM_THEME_MODE,
  UPDATE_DO_USE_LOCAL_THEME, UPDATE_DEFAULT_THEME, UPDATE_LOCAL_THEME,
  UPDATE_UPDATING_THEME_MODE, UPDATE_TIME_PICK, UPDATE_IS_24H_FORMAT,
  UPDATE_CUSTOM_EDITOR, UPDATE_IMAGES, UPDATE_CUSTOM_DATA, UPDATE_CUSTOM_DATA_COMMIT,
  UPDATE_CUSTOM_DATA_ROLLBACK, REHYDRATE_STATIC_FILES, CLEAN_UP_STATIC_FILES,
  CLEAN_UP_STATIC_FILES_COMMIT, CLEAN_UP_STATIC_FILES_ROLLBACK, UPDATE_PAYWALL_FEATURE,
  UPDATE_LOCK_ACTION, UPDATE_LOCK_EDITOR, ADD_LOCK_LIST, REMOVE_LOCK_LIST, LOCK_LIST,
  UNLOCK_LIST, CLEAN_UP_LOCKS, UPDATE_LOCKS_FOR_ACTIVE_APP,
  UPDATE_LOCKS_FOR_INACTIVE_APP, RESET_STATE, UPDATE_MIGRATE_HUB_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH, APP_GROUP_SHARE,
  APP_GROUP_SHARE_UKEY, SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP,
  PROFILE_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, CUSTOM_EDITOR_POPUP, PAYWALL_POPUP,
  LOCK_EDITOR_POPUP, CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, TIME_PICK_POPUP, DISCARD_ACTION_UPDATE_LIST_NAME, ID,
  STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK, MY_LIST, TRASH, N_LINKS,
  N_DAYS, CD_ROOT, ADDED, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  DIED_UPDATING, BRACE_EXTRACT_URL, BRACE_PRE_EXTRACT_URL, EXTRACT_INIT,
  EXTRACT_EXCEEDING_N_URLS, IAP_VERIFY_URL, IAP_STATUS_URL, APPSTORE, PLAYSTORE,
  COM_BRACEDOTTO, COM_BRACEDOTTO_SUPPORTER, SIGNED_TEST_STRING, VALID, INVALID, UNKNOWN,
  ERROR, ACTIVE, SWAP_LEFT, SWAP_RIGHT, WHT_MODE, BLK_MODE, CUSTOM_MODE, FEATURE_PIN,
  FEATURE_APPEARANCE, FEATURE_CUSTOM, FEATURE_LOCK, VALID_PASSWORD, PASSWORD_MSGS,
  APP_STATE_ACTIVE, APP_STATE_INACTIVE, APP_STATE_BACKGROUND,
} from '../types/const';
import {
  isEqual, isString, isObject, isNumber, sleep, randomString, rerandomRandomTerm,
  deleteRemovedDT, getMainId, getLinkMainIds, getUrlFirstChar, separateUrlAndParam,
  getUserImageUrl, randomDecor, isOfflineActionWithPayload, shouldDispatchFetch,
  getListNameObj, getAllListNames, getLatestPurchase, getValidPurchase,
  doEnableExtraFeatures, createDataFName, getLinkFPaths, getStaticFPaths,
  createSettingsFPath, extractPinFPath, getSortedLinks, getPinFPaths, getPins,
  separatePinnedValues, sortLinks, sortWithPins, getRawPins, getFormattedTime,
  get24HFormattedTime, extractStaticFPath, getEditingListNameEditors,
  applySubscriptionOfferDetails, validatePassword, doContainListName,
  doListContainUnlocks,
} from '../utils';
import { _ } from '../utils/obj';
import { initialSettingsState } from '../types/initialStates';
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

  AppState.addEventListener('change', async (nextAppState) => {
    await handleAppStateChange(nextAppState)(store.dispatch, store.getState);
    vars.appState.lastChangeDT = Date.now();
  });

  const isUserSignedIn = await userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }

  const darkMatches = Appearance.getColorScheme() === 'dark';
  const is24HFormat = await is24HourFormat();

  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
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

const handleAppStateChange = (nextAppState) => async (dispatch, getState) => {
  const isUserSignedIn = await userSession.isUserSignedIn();
  const now = Date.now();

  if (nextAppState === APP_STATE_ACTIVE) {
    if (getState().display.doForceLock) {
      if (Platform.OS === 'android') FlagSecure.deactivate();
      const isLong = (now - vars.appState.lastChangeDT) > 21 * 60 * 1000;
      dispatch({ type: UPDATE_LOCKS_FOR_ACTIVE_APP, payload: { isLong } });
    }

    if (isUserSignedIn) {
      const { purchaseStatus } = getState().iap;
      if (purchaseStatus === REQUEST_PURCHASE) return;
    }

    const is24HFormat = await is24HourFormat();
    dispatch(updateIs24HFormat(is24HFormat));

    if (!isUserSignedIn) return;

    const interval = (Date.now() - vars.fetch.dt) / 1000 / 60 / 60;
    if (interval < 0.6) return;
    if (isPopupShown(getState()) && interval < 0.9) return;

    dispatch(clearFetchedListNames());
  }

  let isInactive = nextAppState === APP_STATE_INACTIVE;
  if (Platform.OS === 'android') isInactive = nextAppState === APP_STATE_BACKGROUND;
  if (isInactive) {
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
  //   SettingsErrorPopup, PinErrorPopup, AccessErrorPopup, and MigrateHubPopup.
  if (state.display.isLockEditorPopupShown) return LOCK_EDITOR_POPUP;
  if (state.display.isTimePickPopupShown) return TIME_PICK_POPUP;
  if (state.display.isConfirmDeletePopupShown) return CONFIRM_DELETE_POPUP;
  if (state.display.isConfirmDiscardPopupShown) return CONFIRM_DISCARD_POPUP;
  if (state.display.isPaywallPopupShown) return PAYWALL_POPUP;
  if (state.display.isCustomEditorPopupShown) return CUSTOM_EDITOR_POPUP;
  if (state.display.isPinMenuPopupShown) return PIN_MENU_POPUP;
  if (state.display.isListNamesPopupShown) return LIST_NAMES_POPUP;
  if (state.display.isSettingsListsMenuPopupShown) return SETTINGS_LISTS_MENU_POPUP;
  if (state.display.isSettingsPopupShown) return SETTINGS_POPUP;
  if (state.display.isProfilePopupShown) return PROFILE_POPUP;
  if (state.display.isAddPopupShown) return ADD_POPUP;
  if (state.display.isSignUpPopupShown) return SIGN_UP_POPUP;
  if (state.display.isSignInPopupShown) return SIGN_IN_POPUP;

  for (const listName in state.links) {
    for (const id in state.links[listName]) {
      if (state.links[listName][id][IS_POPUP_SHOWN]) return id;
    }
  }

  // IMPORTANT that search is on the last as updatePopupAsBackPressed relies on this
  //   to close other popups before search (search is the last to be closed).
  if (state.display.isSearchPopupShown) return SEARCH_POPUP;

  return null;
};

const isPopupShown = (state) => {
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
      username: userData.username,
      image: getUserImageUrl(userData),
    },
  });
};

const resetState = async (dispatch) => {
  if (Platform.OS === 'ios') await DefaultPreference.clearAll();

  // redux-offline: Empty outbox
  dispatch({ type: OFFLINE_RESET_STATE });

  // clear file storage
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

export const updatePopup = (id, isShown, anchorPosition = null) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

export const changeListName = (listName) => async (dispatch, getState) => {

  const _listName = getState().display.listName;

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  });

  // make sure dispatch updateFetched finishes before dispatch updateFetchedMore
  await updateFetched(null, null, _listName)(dispatch, getState);
  await updateFetchedMore(null, null, _listName)(dispatch, getState);
};

export const updateSearchString = (searchString) => {
  return {
    type: UPDATE_SEARCH_STRING,
    payload: searchString,
  };
};

export const updateLinkEditor = (values) => {
  return { type: UPDATE_LINK_EDITOR, payload: values };
};

export const updateStatus = (status) => {
  return {
    type: UPDATE_STATUS,
    payload: status,
  };
};

export const updateHref = (href) => {
  return {
    type: UPDATE_HREF,
    payload: href,
  };
};

export const updateBulkEdit = (isBulkEditing) => {
  return {
    type: UPDATE_BULK_EDITING,
    payload: isBulkEditing,
  };
};

export const addSelectedLinkIds = (ids) => {
  return {
    type: ADD_SELECTED_LINK_IDS,
    payload: ids,
  };
};

export const deleteSelectedLinkIds = (ids) => {
  return {
    type: DELETE_SELECTED_LINK_IDS,
    payload: ids,
  };
};

export const updateSelectingLinkId = (id) => {
  return {
    type: UPDATE_SELECTING_LINK_ID,
    payload: id,
  };
};

export const fetch = () => async (dispatch, getState) => {

  const listName = getState().display.listName;
  const didFetchSettings = getState().display.didFetchSettings;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pendingPins = getState().pendingPins;

  const doFetchStgsAndInfo = !didFetchSettings;

  const payload = { listName, doDescendingOrder, doFetchStgsAndInfo, pendingPins };

  // If there is already FETCH with the same list name, no need to dispatch a new one.
  if (!shouldDispatchFetch(getState().offline.outbox, payload)) return;

  dispatch({
    type: FETCH,
    meta: {
      offline: {
        effect: { method: FETCH, params: payload },
        commit: { type: FETCH_COMMIT },
        rollback: { type: FETCH_ROLLBACK },
      },
    },
  });

  if (doFetchStgsAndInfo) vars.fetch.dt = Date.now();
};

export const tryUpdateFetched = (payload, meta) => async (dispatch, getState) => {

  const { listName, doDescendingOrder, links } = payload;

  if (listName !== getState().display.listName) {
    dispatch(updateFetched(payload, meta));
    return;
  }

  if (listName in getState().refreshFetched) {
    dispatch(updateFetched(payload, meta));
    return;
  }

  // If the links in state is undefined, null, or an empty object,
  //   just update the state as no scrolling or popup shown.
  let _links = getState().links[listName];
  if (_links === undefined || _links === null || isEqual(_links, {})) {
    dispatch(updateFetched(payload, meta));
    return;
  }
  _links = Object.values(_.select(_links, STATUS, ADDED));

  // If no links from fetching, they are all deleted,
  //   still process of updating is the same.

  /*
    updateAction
    0. noNew: exactly the same, nothing new, no need to update
    1. limitedSame: partially the same, first N links are the same, the rest do not know so maybe can update it right away if it doesn't trigger rerender
       - In state has more links than fetch
       - User deletes some links or all links
    2. haveNew: not the same for sure, something new, update if not scroll or popup else show fetchedPopup
  */
  let updateAction;
  if (links.length > _links.length) updateAction = 2;
  else {
    const pinFPaths = getPinFPaths(getState());
    const pendingPins = getState().pendingPins;

    let sortedLinks = sortLinks(links, doDescendingOrder);
    sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
      return getMainId(link.id);
    });

    let _sortedLinks = sortLinks(_links, doDescendingOrder);
    _sortedLinks = sortWithPins(_sortedLinks, pinFPaths, pendingPins, (link) => {
      return getMainId(link.id);
    });

    let found = false;
    for (let i = 0; i < sortedLinks.length; i++) {
      const [link, _link] = [sortedLinks[i], _sortedLinks[i]];
      if (
        link.id !== _link.id ||
        !isEqual(link.extractedResult, _link.extractedResult) ||
        !isEqual(link.custom, _link.custom)
      ) {
        found = true;
        break;
      }
    }

    updateAction = found ? 2 : links.length < _links.length ? 1 : 0;
  }

  if (updateAction === 0) {
    dispatch(extractContents());
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const pageYOffset = vars.scrollPanel.pageYOffset;
    if (
      (updateAction === 1 && pageYOffset < 64 / 10 * _links.length) ||
      (updateAction === 2 && pageYOffset === 0 && !isPopupShown(getState()))
    ) {
      dispatch(updateFetched(payload, meta));
      return;
    }
  }

  dispatch({ type: CACHE_FETCHED, payload, theMeta: meta });
};

export const updateFetched = (
  payload, meta, listName = null, doChangeListCount = false
) => async (dispatch, getState) => {

  if (!payload) {
    if (!listName) listName = getState().display.listName;

    const fetched = getState().fetched[listName];
    if (fetched) ({ payload, meta } = fetched);
  }
  if (!payload) return;

  dispatch({
    type: UPDATE_FETCHED,
    payload: { ...payload, doChangeListCount },
    theMeta: meta,
  });
};

export const fetchMore = () => async (dispatch, getState) => {

  const addedDT = Date.now();

  const fetchMoreId = `${addedDT}-${randomString(4)}`;
  const listName = getState().display.listName;
  const ids = Object.keys(getState().links[listName]);
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pendingPins = getState().pendingPins;

  const payload = { fetchMoreId, listName, ids, doDescendingOrder, pendingPins };

  // If there is already cached fetchedMore with the same list name, just return.
  const fetchedMore = getState().fetchedMore[listName];
  if (fetchedMore) return;

  // If there is already FETCH with the same list name,
  //   this fetch more is invalid. Fetch more need to get ids after FETCH_COMMIT.
  // If there is already FETCH_MORE with the same payload,
  //   no need to dispatch a new one.
  const outbox = getState().offline.outbox;
  if (Array.isArray(outbox)) {
    for (const action of outbox) {
      // It's possible that FETCH is cached
      //   and user wants to fetch more continue from current state.
      //if (isOfflineAction(action, FETCH, listName)) return;
      if (isOfflineActionWithPayload(action, FETCH_MORE, payload)) return;
    }
  }

  dispatch({
    type: FETCH_MORE,
    payload,
    meta: {
      offline: {
        effect: { method: FETCH_MORE, params: payload },
        commit: { type: FETCH_MORE_COMMIT, meta: payload },
        rollback: { type: FETCH_MORE_ROLLBACK, meta: payload },
      },
    },
  });
};

export const tryUpdateFetchedMore = (payload, meta) => async (dispatch, getState) => {

  const { fetchMoreId, listName } = meta;

  let isInterrupted = false;
  for (const id in getState().isFetchMoreInterrupted[listName]) {
    if (id === fetchMoreId) {
      isInterrupted = getState().isFetchMoreInterrupted[listName][id];
      break;
    }
  }

  if (isInterrupted) {
    dispatch({ type: CANCEL_FETCHED_MORE, payload, theMeta: meta });
    return;
  }

  const { hasDisorder } = payload;

  if (listName !== getState().display.listName || !hasDisorder) {
    dispatch(updateFetchedMore(payload, meta));
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const scrollHeight = vars.scrollPanel.contentHeight;
    const windowHeight = vars.scrollPanel.layoutHeight;
    const windowBottom = windowHeight + vars.scrollPanel.pageYOffset;

    if (windowBottom > (scrollHeight * 0.96) && !isPopupShown(getState())) {
      dispatch(updateFetchedMore(payload, meta));
      return;
    }
  }

  dispatch({ type: CACHE_FETCHED_MORE, payload, theMeta: meta });
};

export const updateFetchedMore = (payload, meta, listName = null) => async (
  dispatch, getState
) => {

  if (!payload) {
    if (!listName) listName = getState().display.listName;

    const fetchedMore = getState().fetchedMore[listName];
    if (fetchedMore) ({ payload, meta } = fetchedMore);
  }
  if (!payload) return;

  dispatch({
    type: UPDATE_FETCHED_MORE,
    payload,
    theMeta: meta,
  });
};

export const clearFetchedListNames = () => {
  return { type: CLEAR_FETCHED_LIST_NAMES };
};

export const refreshFetched = () => async (dispatch, getState) => {
  const listName = getState().display.listName;
  const payload = { listName, shouldDispatchFetch: true };

  // If there is already FETCH with the same list name, no need to dispatch a new one.
  if (!shouldDispatchFetch(getState().offline.outbox, payload)) {
    payload.shouldDispatchFetch = false;
  }

  dispatch({ type: REFRESH_FETCHED, payload });
};

export const addLink = (url, listName, doExtractContents) => async (
  dispatch, getState
) => {

  if (listName === null) listName = getState().display.listName;
  if (listName === TRASH) listName = MY_LIST;

  // First 2 terms are main of an id, should always be unique.
  // The third term is changed when move around
  //   to avoid etags confusing treating a new file as an existing file
  //   in blockstack-js/storage.
  // Getting content, etags is updated with key as path and value as content hash
  //   this is for make sure no mid-air edit collisions.
  //   But when delete, etags isn't updated so when add a new file with the same path,
  //   old value in etags is used and create an error 412 Precondition Failed.
  const addedDT = Date.now();
  const id = `${addedDT}-${randomString(4)}-${randomString(4)}`;
  const decor = randomDecor(getUrlFirstChar(url));
  const link = { id, url, addedDT, decor };
  const links = [link];
  const payload = { listName, links };

  // If doExtractContents is false but from settings is true, send pre-extract to server
  if (doExtractContents === false && getState().settings.doExtractContents === true) {
    axios.post(BRACE_PRE_EXTRACT_URL, { urls: [url] })
      .then(() => { })
      .catch((error) => {
        console.log('Error when contact Brace server to pre-extract contents with links: ', links, ' Error: ', error);
      });
  }

  dispatch({
    type: ADD_LINKS,
    payload,
    meta: {
      offline: {
        effect: { method: ADD_LINKS, params: payload },
        commit: { type: ADD_LINKS_COMMIT },
        rollback: { type: ADD_LINKS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const moveLinks = (toListName, ids, fromListName = null) => async (
  dispatch, getState
) => {

  if (!fromListName) fromListName = getState().display.listName;

  const links = _.ignore(
    _.select(getState().links[fromListName], ID, ids),
    [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
  );
  const fromLinks = Object.values(links);

  const payload = { listName: toListName, links: fromLinks, manuallyManageError: true };
  payload.links = payload.links.map(link => {
    return { ...link, id: rerandomRandomTerm(link.id) };
  });
  if (fromListName === TRASH) {
    payload.links = payload.links.map(link => {
      return { ...link, id: deleteRemovedDT(link.id) };
    });
  }
  if (toListName === TRASH) {
    const removedDT = Date.now();
    payload.links = payload.links.map(link => {
      return { ...link, id: `${link.id}-${removedDT}` };
    });
  }

  const fromIdMap = {};
  for (let i = 0; i < fromLinks.length; i++) {
    fromIdMap[payload.links[i].id] = fromLinks[i].id;
  }

  dispatch({
    type: MOVE_LINKS_ADD_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: ADD_LINKS, params: payload },
        commit: {
          type: MOVE_LINKS_ADD_STEP_COMMIT, meta: { fromListName, fromIdMap },
        },
        rollback: { type: MOVE_LINKS_ADD_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const moveLinksDeleteStep = (listName, ids, toListName, toIds) => async (
  dispatch, getState
) => {
  if (ids.length !== toIds.length) {
    console.log('In moveLinksDeleteStep, invalid ids:', ids, 'or toIds:', toIds);
  }
  if (ids.length === 0) return; // can happen if all are errorIds.

  const payload = { listName, ids, manuallyManageError: true, toListName, toIds };
  dispatch({
    type: MOVE_LINKS_DELETE_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: DELETE_LINKS, params: payload },
        commit: { type: MOVE_LINKS_DELETE_STEP_COMMIT, meta: payload },
        rollback: { type: MOVE_LINKS_DELETE_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const deleteLinks = (ids) => async (dispatch, getState) => {
  const listName = getState().display.listName;

  const payload = { listName, ids, manuallyManageError: true };
  dispatch({
    type: DELETE_LINKS,
    payload,
    meta: {
      offline: {
        effect: { method: DELETE_LINKS, params: payload },
        commit: { type: DELETE_LINKS_COMMIT },
        rollback: { type: DELETE_LINKS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const retryDiedLinks = (ids) => async (dispatch, getState) => {

  const listName = getState().display.listName;
  for (const id of ids) {
    // DIED_ADDING -> try add this link again
    // DIED_MOVING -> try move this link again
    // DIED_REMOVING -> try delete this link again
    // DIED_DELETING  -> try delete this link again
    // DIED_UPDAING -> try update this link again
    const link = getState().links[listName][id];

    const { status } = link;
    if (status === DIED_ADDING) {
      const _link = {};
      for (const attr in link) {
        if ([
          STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK,
        ].includes(attr)) continue;
        _link[attr] = link[attr];
      }
      const links = [_link];
      const payload = { listName, links };

      dispatch({
        type: ADD_LINKS,
        payload,
        meta: {
          offline: {
            effect: { method: ADD_LINKS, params: payload },
            commit: { type: ADD_LINKS_COMMIT },
            rollback: { type: ADD_LINKS_ROLLBACK, meta: payload },
          },
        },
      });
    } else if (status === DIED_MOVING) {

      const payload = { listName, ids: [id] };
      dispatch({
        type: CANCEL_DIED_LINKS,
        payload,
      });

      let fromListName = null, fromId = null;
      for (const _listName in getState().links) {
        if (_listName === listName) continue;
        for (const _id in getState().links[_listName]) {
          if (getMainId(id) === getMainId(_id)) {
            [fromListName, fromId] = [_listName, _id];
            break;
          }
        }
        if (fromId !== null) break;
      }
      if (fromId === null) {
        console.log(`In retryDiedLinks, could not find fromId for id: ${id}`);
        continue;
      }

      dispatch(moveLinks(listName, [fromId], fromListName));

    } else if (status === DIED_REMOVING) {
      dispatch(deleteLinks([id]));
    } else if (status === DIED_DELETING) {
      dispatch(deleteLinks([id]));
    } else if (status === DIED_UPDATING) {
      const toLink = {};
      for (const attr in link) {
        if ([
          STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK,
        ].includes(attr)) continue;
        toLink[attr] = link[attr];
      }
      const payload = { listName, fromLink: link.fromLink, toLink };

      dispatch({
        type: UPDATE_CUSTOM_DATA,
        payload,
        meta: {
          offline: {
            effect: { method: UPDATE_CUSTOM_DATA, params: payload },
            commit: { type: UPDATE_CUSTOM_DATA_COMMIT },
            rollback: { type: UPDATE_CUSTOM_DATA_ROLLBACK, meta: payload },
          },
        },
      });
    } else {
      throw new Error(`Invalid status: ${status} of id: ${id}`);
    }
  }
};

export const cancelDiedLinks = (ids, listName = null) => async (dispatch, getState) => {
  if (!listName) listName = getState().display.listName;

  const payload = { listName, ids };
  dispatch({ type: CANCEL_DIED_LINKS, payload });
};

const getToExtractLinks = (listName, ids, getState) => {

  if (listName === TRASH) return [];

  let obj = getState().links[listName];
  if (!isObject(obj)) return [];

  if (Array.isArray(ids)) obj = _.select(obj, ID, ids);

  const _links = _.ignore(
    obj, [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
  );
  const links = Object.values(_links)
    .filter(link => {
      if ('custom' in link) return false;
      return !link.extractedResult || link.extractedResult.status === EXTRACT_INIT;
    })
    .sort((a, b) => b.addedDT - a.addedDT)
    .slice(0, N_LINKS);

  return links;
};

export const extractContents = (listName, ids) => async (dispatch, getState) => {

  const doExtractContents = getState().settings.doExtractContents;
  if (!doExtractContents) {
    dispatch(runAfterFetchTask());
    return;
  }

  if (!listName) listName = getState().display.listName;

  const links = getToExtractLinks(listName, ids, getState);
  if (links.length === 0) {
    dispatch(runAfterFetchTask());
    return;
  }

  let res;
  try {
    res = await axios.post(BRACE_EXTRACT_URL, { urls: links.map(link => link.url) });
  } catch (error) {
    console.log('Error when contact Brace server to extract contents with links: ', links, ' Error: ', error);
    return;
  }

  const extractedResults = res.data.extractedResults;

  const extractedLinks = [];
  for (let i = 0; i < extractedResults.length; i++) {
    const extractedResult = extractedResults[i];
    if (
      extractedResult.status === EXTRACT_INIT ||
      extractedResult.status === EXTRACT_EXCEEDING_N_URLS
    ) continue;

    // Some links might be moved while extracting.
    // If that the case, ignore them.
    const obj = getState().links[listName];
    if (!isObject(obj)) continue;
    if (!Object.keys(obj).includes(links[i][ID])) continue;

    links[i].extractedResult = extractedResult;
    extractedLinks.push(links[i]);
  }
  if (extractedLinks.length === 0) {
    dispatch(runAfterFetchTask());
    return;
  }

  const payload = { listName: listName, links: extractedLinks };
  dispatch({
    type: EXTRACT_CONTENTS,
    payload,
    meta: {
      offline: {
        effect: { method: UPDATE_LINKS, params: payload },
        commit: { type: EXTRACT_CONTENTS_COMMIT },
        rollback: { type: EXTRACT_CONTENTS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const tryUpdateExtractedContents = (payload) => async (dispatch, getState) => {

  const isBulkEditing = getState().display.isBulkEditing;
  const pageYOffset = vars.scrollPanel.pageYOffset;
  const canRerender = !isBulkEditing && pageYOffset === 0 && !isPopupShown(getState());

  dispatch({
    type: UPDATE_EXTRACTED_CONTENTS,
    payload: { ...payload, canRerender },
  });
};

export const runAfterFetchTask = () => async (dispatch, getState) => {
  dispatch(randomHouseworkTasks());
};

export const randomHouseworkTasks = () => async (dispatch, getState) => {
  const now = Date.now();
  if (now - vars.randomHouseworkTasks.dt < 24 * 60 * 60 * 1000) return;

  //Disable migrate hub for now.
  //await checkObsoleteHub(dispatch, getState);

  const rand = Math.random();
  if (rand < 0.33) dispatch(deleteOldLinksInTrash());
  else if (rand < 0.66) dispatch(checkPurchases());
  else dispatch(cleanUpStaticFiles());

  vars.randomHouseworkTasks.dt = now;
};

export const deleteOldLinksInTrash = () => async (dispatch, getState) => {

  const doDeleteOldLinksInTrash = getState().settings.doDeleteOldLinksInTrash;
  if (!doDeleteOldLinksInTrash) return;

  dispatch({
    type: DELETE_OLD_LINKS_IN_TRASH,
    meta: {
      offline: {
        effect: { method: DELETE_OLD_LINKS_IN_TRASH },
        commit: { type: DELETE_OLD_LINKS_IN_TRASH_COMMIT },
        rollback: { type: DELETE_OLD_LINKS_IN_TRASH_ROLLBACK },
      },
    },
  });
};

export const updateSettingsPopup = (isShown, doCheckEditing = false) => async (
  dispatch, getState
) => {
  /*
    A settings snapshot is made when FETCH_COMMIT and UPDATE_SETTINGS_COMMIT
    For FETCH_COMMIT and UPDATE_SETTINGS_COMMIT, check action type in snapshotReducer
      as need settings that used to upload to the server, not the current in the state

    Can't make a snapshot when open the popup because
      1. FETCH_COMMIT might be after the popup is open
      2. user might open the popup while settings is being updated or rolled back
  */
  if (!isShown) {
    if (doCheckEditing) {
      const listNameEditors = getState().listNameEditors;
      const listNameMap = getState().settings.listNameMap;
      const editingLNEs = getEditingListNameEditors(listNameEditors, listNameMap);
      if (isObject(editingLNEs)) {
        for (const k in editingLNEs) {
          if (!isNumber(editingLNEs[k].blurCount)) editingLNEs[k].blurCount = 0;
          editingLNEs[k].blurCount += 1;
        }
        dispatch(updateListNameEditors(editingLNEs));

        dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_LIST_NAME));
        dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
        return;
      }
    }
    dispatch(updateStgsAndInfo());
  }

  dispatch(updatePopup(SETTINGS_POPUP, isShown));
};

export const updateSettingsViewId = (
  viewId, isSidebarShown, didCloseAnimEnd, didSidebarAnimEnd
) => async (dispatch, getState) => {

  const payload = {};
  if (viewId) payload.settingsViewId = viewId;
  if ([true, false].includes(isSidebarShown)) {
    payload.isSettingsSidebarShown = isSidebarShown;
  }
  if ([true, false].includes(didCloseAnimEnd)) {
    payload.didSettingsCloseAnimEnd = didCloseAnimEnd;
  }
  if ([true, false].includes(didSidebarAnimEnd)) {
    payload.didSettingsSidebarAnimEnd = didSidebarAnimEnd;
    if (!didSidebarAnimEnd) {
      const { updateSettingsViewIdCount } = getState().display;
      payload.updateSettingsViewIdCount = updateSettingsViewIdCount + 1;
    }
  }

  dispatch({ type: UPDATE_SETTINGS_VIEW_ID, payload });
};

export const updateListNameEditors = (listNameEditors) => {
  return { type: UPDATE_LIST_NAME_EDITORS, payload: listNameEditors };
};

export const addListNames = (newNames) => {

  let i = 0;
  const addedDT = Date.now();

  const listNameObjs = [];
  for (const newName of newNames) {
    // If cpu is fast enough, addedDT will be the same for all new names!
    //    so use a predefined one with added loop index.
    const id = `${addedDT + i}-${randomString(4)}`;
    const listNameObj = { listName: id, displayName: newName };
    listNameObjs.push(listNameObj);

    i += 1;
  }

  return { type: ADD_LIST_NAMES, payload: listNameObjs };
};

export const updateListNames = (listNames, newNames) => {
  return { type: UPDATE_LIST_NAMES, payload: { listNames, newNames } };
};

export const moveListName = (listName, direction) => {
  return { type: MOVE_LIST_NAME, payload: { listName, direction } };
};

export const moveToListName = (listName, parent) => {
  return { type: MOVE_TO_LIST_NAME, payload: { listName, parent } };
};

export const deleteListNames = (listNames) => async (dispatch, getState) => {
  const { listNameMap } = getState().settings;

  const allListNames = [];
  for (const listName of listNames) {
    const { listNameObj } = getListNameObj(listName, listNameMap);
    allListNames.push(listNameObj.listName);
    allListNames.push(...getAllListNames(listNameObj.children));
  }

  dispatch({ type: DELETE_LIST_NAMES, payload: { listNames: allListNames } });
};

export const updateDoExtractContents = (doExtractContents) => {
  return { type: UPDATE_DO_EXTRACT_CONTENTS, payload: doExtractContents };
};

export const updateDoDeleteOldLinksInTrash = (doDeleteOldLinksInTrash) => {
  return {
    type: UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH, payload: doDeleteOldLinksInTrash,
  };
};

export const updateDoDescendingOrder = (doDescendingOrder) => {
  return { type: UPDATE_DO_DESCENDING_ORDER, payload: doDescendingOrder };
};

export const updateSelectingListName = (listName) => {
  return {
    type: UPDATE_SELECTING_LIST_NAME,
    payload: listName,
  };
};

export const updateDeletingListName = (listName) => {
  return {
    type: UPDATE_DELETING_LIST_NAME,
    payload: listName,
  };
};

const updateSettings = async (dispatch, getState) => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  if (isEqual(settings, snapshotSettings)) {
    dispatch(cancelDiedSettings());
    return;
  }

  const doFetch = settings.doDescendingOrder !== snapshotSettings.doDescendingOrder;
  const payload = { settings, doFetch };

  dispatch({
    type: UPDATE_SETTINGS,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: payload },
        commit: { type: UPDATE_SETTINGS_COMMIT, meta: payload },
        rollback: { type: UPDATE_SETTINGS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const updateSettingsDeleteStep = (_settingsFPaths) => async (
  dispatch, getState
) => {
  if (_settingsFPaths.length === 0) return;
  try {
    await serverApi.putFiles(_settingsFPaths, _settingsFPaths.map(() => ({})));
    await cleanUpLocks(dispatch, getState);
  } catch (error) {
    console.log('updateSettings clean up error: ', error);
    // error in this step should be fine
  }
};

const updateInfo = async (dispatch, getState) => {
  const info = getState().info;
  const snapshotInfo = getState().snapshot.info;

  // It's ok if IAP in progess as when complete, it'll update again.
  if (isEqual(info, snapshotInfo)) return;

  const payload = { info };
  dispatch({
    type: UPDATE_INFO,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_INFO, params: payload },
        commit: { type: UPDATE_INFO_COMMIT, meta: payload },
        rollback: { type: UPDATE_INFO_ROLLBACK, meta: payload },
      },
    },
  });
};

export const updateInfoDeleteStep = (_infoFPath) => async (dispatch, getState) => {
  if (!isString(_infoFPath)) return;
  try {
    await serverApi.deleteFiles([_infoFPath]);
  } catch (error) {
    console.log('updateInfo clean up error: ', error);
    // error in this step should be fine
  }
};

export const updateStgsAndInfo = () => async (dispatch, getState) => {
  await updateSettings(dispatch, getState);
  await updateInfo(dispatch, getState);
};

export const retryDiedSettings = () => async (dispatch, getState) => {
  await updateSettings(dispatch, getState);
};

export const cancelDiedSettings = () => async (dispatch, getState) => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  const linkFPaths = getLinkFPaths(getState());

  const listNames = Object.keys(linkFPaths);
  const doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  const payload = { listNames, settings: snapshotSettings, doFetch };

  dispatch({ type: CANCEL_DIED_SETTINGS, payload: payload });
};

export const tryUpdateInfo = () => async (dispatch, getState) => {
  const isSettingsPopupShown = getState().display.isSettingsPopupShown;
  if (isSettingsPopupShown) return;

  await updateInfo(dispatch, getState);
};

export const mergeSettings = (selectedId) => async (dispatch, getState) => {
  const currentSettings = getState().settings;
  const contents = getState().conflictedSettings.contents;

  const addedDT = Date.now();
  const _settingsFPaths = contents.map(content => content.fpath);
  const _settingsIds = contents.map(content => content.id);
  const _settings = contents.find(content => content.id === selectedId);

  const settingsFName = createDataFName(`${addedDT}${randomString(4)}`, _settingsIds);
  const settingsFPath = createSettingsFPath(settingsFName);

  const settings = { ...initialSettingsState };
  for (const k in settings) {
    // Conflicted settings content has extra attrs i.e. id and fpath.
    if (k in _settings) settings[k] = _settings[k];
  }

  const linkFPaths = getLinkFPaths(getState());

  const listNames = Object.keys(linkFPaths);
  const doFetch = settings.doDescendingOrder !== currentSettings.doDescendingOrder;
  const payload = { settingsFPath, listNames, settings, doFetch, _settingsFPaths };

  dispatch({
    type: MERGE_SETTINGS,
    payload: payload,
    meta: {
      offline: {
        effect: { method: UPDATE_SETTINGS, params: payload },
        commit: { type: MERGE_SETTINGS_COMMIT, meta: payload },
        rollback: { type: MERGE_SETTINGS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const mergeSettingsDeleteStep = (_settingsFPaths) => async (
  dispatch, getState
) => {
  try {
    await serverApi.putFiles(_settingsFPaths, _settingsFPaths.map(() => ({})));
  } catch (error) {
    console.log('mergeSettings clean up error: ', error);
    // error in this step should be fine
  }
};

export const updateDoUseLocalLayout = (doUse) => {
  return { type: UPDATE_DO_USE_LOCAL_LAYOUT, payload: doUse };
};

export const updateLayoutType = (layoutType) => async (dispatch, getState) => {
  const doUseLocalLayout = getState().localSettings.doUseLocalLayout;

  const type = doUseLocalLayout ? UPDATE_LOCAL_LAYOUT_TYPE : UPDATE_DEFAULT_LAYOUT_TYPE;
  dispatch({ type, payload: layoutType });
};

export const updateDeleteAction = (deleteAction) => {
  return {
    type: UPDATE_DELETE_ACTION,
    payload: deleteAction,
  };
};

export const updateDiscardAction = (discardAction) => {
  return {
    type: UPDATE_DISCARD_ACTION,
    payload: discardAction,
  };
};

export const updateListNamesMode = (mode, animType) => {
  return {
    type: UPDATE_LIST_NAMES_MODE,
    payload: { listNamesMode: mode, listNamesAnimType: animType },
  };
};

export const updatePaywallFeature = (feature) => {
  return { type: UPDATE_PAYWALL_FEATURE, payload: feature };
};

const verifyPurchase = async (rawPurchase) => {
  if (!rawPurchase) return { status: INVALID };
  if (Platform.OS === 'android' && rawPurchase.purchaseStateAndroid === 0) {
    return { status: INVALID };
  }

  let source;
  if (Platform.OS === 'ios') source = APPSTORE;
  else if (Platform.OS === 'android') source = PLAYSTORE;

  if (!source) {
    console.log(`Invalid Platform.OS: ${Platform.OS}`);
    return { status: ERROR };
  }

  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const userId = sigObj.publicKey;

  const productId = rawPurchase.productId;

  let token;
  if (Platform.OS === 'ios') token = rawPurchase.transactionReceipt;
  else if (Platform.OS === 'android') token = rawPurchase.purchaseToken;

  if (!token) {
    console.log('No purchaseToken in rawPurchase');
    return { status: INVALID };
  }

  const reqBody = { source, userId, productId, token };

  let verifyResult;
  try {
    const res = await axios.post(IAP_VERIFY_URL, reqBody);
    verifyResult = res.data;
  } catch (error) {
    console.log(`Error when contact IAP server to verify with reqBody: ${JSON.stringify(reqBody)}, Error: `, error);
    return { status: UNKNOWN };
  }

  try {
    if (Platform.OS !== 'android') {
      await iapApi.finishTransaction({ purchase: rawPurchase, isConsumable: false });
    }
  } catch (error) {
    console.log('Error when finishTransaction: ', error);
  }

  return verifyResult;
};

const getIapStatus = async (doForce) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const reqBody = {
    userId: sigObj.publicKey,
    signature: sigObj.signature,
    appId: COM_BRACEDOTTO,
    doForce: doForce,
  };

  const res = await axios.post(IAP_STATUS_URL, reqBody);
  return res;
};

const getPurchases = (
  action, commitAction, rollbackAction, doForce, serverOnly
) => async (dispatch, getState) => {

  const { purchaseState, restoreStatus, refreshStatus } = getState().iap;
  if (
    purchaseState === REQUEST_PURCHASE ||
    restoreStatus === RESTORE_PURCHASES ||
    refreshStatus === REFRESH_PURCHASES
  ) return;

  dispatch({ type: action });

  let statusResult;
  try {
    const res = await getIapStatus(doForce);
    statusResult = res.data;

    if (serverOnly) {
      dispatch({ type: commitAction, payload: statusResult });
      return;
    }

    if (statusResult.status === VALID) {
      const purchase = getLatestPurchase(statusResult.purchases);
      if (purchase && purchase.status === ACTIVE) {
        dispatch({ type: commitAction, payload: statusResult });
        return;
      }
    }
  } catch (error) {
    console.log('Error when contact IAP server to get purchases: ', error);
    dispatch({ type: rollbackAction });
    return;
  }

  let isIap = false;
  let waits = [200, 500, 1000, 1500, 2000, 2500, 3000];
  for (const wait of waits) {
    if (getState().iap.productStatus === GET_PRODUCTS_COMMIT) {
      isIap = true;
      break;
    }
    await sleep(wait);
  }
  if (!isIap) {
    dispatch({ type: commitAction, payload: statusResult });
    return;
  }

  try {
    // As iapUpdatedListener can be missed, need to getAvailablePurchases
    const validPurchases = [], originalOrderIds = [];

    const rawPurchases = await iapApi.getAvailablePurchases();
    for (const rawPurchase of rawPurchases) {
      let originalOrderId;
      if (Platform.OS === 'ios') {
        originalOrderId = rawPurchase.originalTransactionIdentifierIOS;
      } else if (Platform.OS === 'android') {
        originalOrderId = rawPurchase.purchaseToken;
      }

      if (originalOrderIds.includes(originalOrderId)) continue;
      originalOrderIds.push(originalOrderId);

      const verifyResult = await verifyPurchase(rawPurchase);
      if (verifyResult.status === VALID) {
        validPurchases.push(verifyResult.purchase);
      }
    }

    if (validPurchases.length > 0) {
      statusResult.status = VALID;
      for (const purchase of statusResult.purchases) {
        const found = validPurchases.find(p => {
          return p.orderId === purchase.orderId;
        });
        if (!found) validPurchases.push(purchase);
      }
      statusResult.purchases = validPurchases;
    }

    dispatch({ type: commitAction, payload: statusResult });
  } catch (error) {
    console.log('Error when getAvailablePurchases to restore purchases: ', error);
    dispatch({ type: commitAction, payload: statusResult });
  }
};

const iapUpdatedListener = (dispatch, getState) => async (rawPurchase) => {
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

const iapErrorListener = (dispatch, getState) => async (error) => {
  console.log('Error in iapErrorListener: ', error);
  if (error.code === 'E_USER_CANCELLED') {
    dispatch(updateIapPurchaseStatus(null, null));
  } else {
    dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
  }
};

const registerIapListeners = (doRegister, dispatch, getState) => {
  if (doRegister) {
    if (!vars.iap.updatedEventEmitter) {
      vars.iap.updatedEventEmitter = iapApi.purchaseUpdatedListener(
        iapUpdatedListener(dispatch, getState)
      );
    }
    if (!vars.iap.errorEventEmitter) {
      vars.iap.errorEventEmitter = iapApi.purchaseErrorListener(
        iapErrorListener(dispatch, getState)
      );
    }
  } else {
    if (vars.iap.updatedEventEmitter) {
      vars.iap.updatedEventEmitter.remove();
      vars.iap.updatedEventEmitter = null;
    }
    if (vars.iap.errorEventEmitter) {
      vars.iap.errorEventEmitter.remove();
      vars.iap.errorEventEmitter = null;
    }
  }
};

export const endIapConnection = (isInit = false) => async (dispatch, getState) => {
  registerIapListeners(false, dispatch, getState);
  try {
    await iapApi.endConnection();
  } catch (error) {
    console.log('Error when end IAP connection: ', error);
  }

  if (!isInit) {
    vars.iap.didGetProducts = false;
    dispatch(updateIapProductStatus(null, null, null));
  }
};

export const initIapConnectionAndGetProducts = (doForce) => async (
  dispatch, getState
) => {
  if (vars.iap.didGetProducts && !doForce) return;
  vars.iap.didGetProducts = true;
  dispatch({ type: GET_PRODUCTS });

  if (doForce) await endIapConnection(true)(dispatch, getState);

  try {
    const canMakePayments = await iapApi.initConnection();
    try {
      await iapApi.flushFailedPurchasesCachedAsPendingAndroid();
    } catch (flushError) {
      console.log('Flush failed purchases error: ', flushError);
      // error in this step should be fine
    }
    registerIapListeners(true, dispatch, getState);

    let products = null;
    if (canMakePayments) {
      products = await iapApi.getSubscriptions({ skus: [COM_BRACEDOTTO_SUPPORTER] });
      for (let product of products) applySubscriptionOfferDetails(product);
    }

    dispatch({
      type: GET_PRODUCTS_COMMIT,
      payload: { canMakePayments, products },
    });
  } catch (error) {
    console.log('Error when init iap and get products: ', error);
    dispatch({ type: GET_PRODUCTS_ROLLBACK });
  }
};

export const requestPurchase = (product) => async (dispatch, getState) => {
  dispatch({ type: REQUEST_PURCHASE });
  try {
    const { productId, offerToken } = product;
    await iapApi.requestSubscription({
      sku: productId,
      // github.com/dooboolab-community/react-native-iap/issues/2247
      subscriptionOffers: [{ sku: productId, offerToken }],
    });
  } catch (error) {
    console.log('Error when request purchase: ', error);
    if (error.code === 'E_USER_CANCELLED') {
      dispatch(updateIapPurchaseStatus(null, null));
    } else {
      dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
    }
  }
};

export const restorePurchases = () => async (dispatch, getState) => {
  await getPurchases(
    RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
    false, false
  )(dispatch, getState);
};

export const refreshPurchases = () => async (dispatch, getState) => {
  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    true, false
  )(dispatch, getState);
};

export const checkPurchases = () => async (dispatch, getState) => {
  const { purchases, checkPurchasesDT } = getState().info;

  const purchase = getValidPurchase(purchases);
  if (!purchase) return;

  const now = Date.now();
  const expiryDT = (new Date(purchase.expiryDate)).getTime();

  let doCheck = false;
  if (now >= expiryDT || !checkPurchasesDT) doCheck = true;
  else {
    let p = 1.0 / (N_DAYS * 24 * 60 * 60 * 1000) * Math.abs(now - checkPurchasesDT);
    p = Math.max(0.01, Math.min(p, 0.99));
    doCheck = p > Math.random();
  }
  if (!doCheck) return;

  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    false, true
  )(dispatch, getState);
};

export const retryVerifyPurchase = () => async (dispatch, getState) => {
  const rawPurchase = getState().iap.rawPurchase;

  dispatch({ type: REQUEST_PURCHASE });
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

export const updateIapPublicKey = () => async (dispatch, getState) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  dispatch({ type: UPDATE_IAP_PUBLIC_KEY, payload: sigObj.publicKey });
};

export const updateIapProductStatus = (status, canMakePayments, products) => {
  return {
    type: UPDATE_IAP_PRODUCT_STATUS,
    payload: { status, canMakePayments, products },
  };
};

export const updateIapPurchaseStatus = (status, rawPurchase) => {
  return {
    type: UPDATE_IAP_PURCHASE_STATUS,
    payload: { status, rawPurchase },
  };
};

export const updateIapRestoreStatus = (status) => {
  return {
    type: UPDATE_IAP_RESTORE_STATUS,
    payload: status,
  };
};

export const updateIapRefreshStatus = (status) => {
  return {
    type: UPDATE_IAP_REFRESH_STATUS,
    payload: status,
  };
};

export const pinLinks = (ids) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_PIN));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const listName = getState().display.listName;

  // Object.values() might give diff sequence of links from ids and pins.
  const _links = _.ignore(
    _.select(getState().links[listName], ID, ids),
    [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
  );
  const links = ids.map(id => _links[id]);

  const pinFPaths = getPinFPaths(getState());
  const pendingPins = getState().pendingPins;

  const currentPins = getPins(pinFPaths, pendingPins, true);
  const currentRanks = Object.values(currentPins).map(pin => pin.rank).sort();

  let lexoRank;
  if (currentRanks.length > 0) {
    const rank = currentRanks[currentRanks.length - 1];
    lexoRank = LexoRank.parse(`0|${rank.replace('_', ':')}`).genNext();
  } else {
    lexoRank = LexoRank.middle();
  }

  let now = Date.now();
  const pins = [];
  for (const id of ids) {
    const nextRank = lexoRank.toString().slice(2).replace(':', '_');
    pins.push({ rank: nextRank, updatedDT: now, addedDT: now, id });

    lexoRank = lexoRank.genNext();
    now += 1;
  }

  const payload = { listName, links, pins };
  dispatch({
    type: PIN_LINK,
    payload,
    meta: {
      offline: {
        effect: { method: PIN_LINK, params: payload },
        commit: { type: PIN_LINK_COMMIT, meta: payload },
        rollback: { type: PIN_LINK_ROLLBACK, meta: payload },
      },
    },
  });
};

export const unpinLinks = (ids) => async (dispatch, getState) => {
  const pinFPaths = getPinFPaths(getState());

  const linkMainIds = ids.map(id => getMainId(id));

  // when move, old paths might not be deleted, so when unpin,
  //   need to delete them all, can't use getPins and no break here.
  const pins = [];
  for (const fpath of pinFPaths) {
    const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);
    const pinMainId = getMainId(id);
    if (linkMainIds.includes(pinMainId)) pins.push({ rank, updatedDT, addedDT, id });
  }

  if (pins.length === 0) {
    // As for every move link to ARCHIVE and TRASH, will try to unpin the link too,
    //  if no pin to unpin, just return.
    console.log('In unpinLinks, no pin found for ids: ', ids);
    return;
  }

  const payload = { pins };
  dispatch({
    type: UNPIN_LINK,
    payload,
    meta: {
      offline: {
        effect: { method: UNPIN_LINK, params: payload },
        commit: { type: UNPIN_LINK_COMMIT, meta: payload },
        rollback: { type: UNPIN_LINK_ROLLBACK, meta: payload },
      },
    },
  });
};

export const movePinnedLink = (id, direction) => async (dispatch, getState) => {
  const links = getState().links;
  const listName = getState().display.listName;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pinFPaths = getPinFPaths(getState());
  const pendingPins = getState().pendingPins;

  const sortedLinks = getSortedLinks(links, listName, doDescendingOrder);
  if (!sortedLinks) {
    console.log('No links found for link id: ', id);
    return;
  }

  let [pinnedValues] = separatePinnedValues(
    sortedLinks,
    pinFPaths,
    pendingPins,
    (link) => {
      return getMainId(link.id);
    }
  );

  const i = pinnedValues.findIndex(pinnedValue => pinnedValue.value.id === id);
  if (i < 0) {
    console.log('In movePinnedLink, no pin found for link id: ', id);
    return;
  }

  let nextRank;
  if (direction === SWAP_LEFT) {
    if (i === 0) return;
    if (i === 1) {
      const pRank = pinnedValues[i - 1].pin.rank;

      const lexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`);

      nextRank = lexoRank.genPrev().toString();
    } else {
      const pRank = pinnedValues[i - 1].pin.rank;
      const ppRank = pinnedValues[i - 2].pin.rank;

      const pLexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`);
      const ppLexoRank = LexoRank.parse(`0|${ppRank.replace('_', ':')}`);

      nextRank = ppLexoRank.between(pLexoRank).toString();
    }
  } else if (direction === SWAP_RIGHT) {
    if (i === pinnedValues.length - 1) return;
    if (i === pinnedValues.length - 2) {
      const nRank = pinnedValues[i + 1].pin.rank;

      const lexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`);

      nextRank = lexoRank.genNext().toString();
    } else {
      const nRank = pinnedValues[i + 1].pin.rank;
      const nnRank = pinnedValues[i + 2].pin.rank;

      const nLexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`);
      const nnLexoRank = LexoRank.parse(`0|${nnRank.replace('_', ':')}`);

      nextRank = nLexoRank.between(nnLexoRank).toString();
    }
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }
  nextRank = nextRank.slice(2).replace(':', '_');

  const now = Date.now();
  const { addedDT } = pinnedValues[i].pin;

  const payload = { rank: nextRank, updatedDT: now, addedDT, id };
  dispatch({
    type: MOVE_PINNED_LINK_ADD_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: PIN_LINK, params: { pins: [payload] } },
        commit: { type: MOVE_PINNED_LINK_ADD_STEP_COMMIT, meta: payload },
        rollback: { type: MOVE_PINNED_LINK_ADD_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const cancelDiedPins = () => {
  return { type: CANCEL_DIED_PINS };
};

export const cleanUpPins = () => async (dispatch, getState) => {
  const linkFPaths = getLinkFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  const linkMainIds = getLinkMainIds(linkFPaths);
  const pins = getRawPins(pinFPaths);

  let unusedPins = [];
  for (const fpath of pinFPaths) {
    const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);
    const pinMainId = getMainId(id);

    if (
      !isString(pinMainId) ||
      !linkMainIds.includes(pinMainId) ||
      !isObject(pins[pinMainId]) ||
      (
        rank !== pins[pinMainId].rank ||
        updatedDT !== pins[pinMainId].updatedDT ||
        addedDT !== pins[pinMainId].addedDT ||
        id !== pins[pinMainId].id
      )
    ) {
      unusedPins.push({ rank, updatedDT, addedDT, id });
    }
  }
  unusedPins = unusedPins.slice(0, N_LINKS);

  if (unusedPins.length > 0) {
    // Don't need offline, if no network or get killed, can do it later.
    try {
      await dataApi.deletePins({ pins: unusedPins });
    } catch (error) {
      console.log('cleanUpPins error: ', error);
      // error in this step should be fine
    }
  }
};

export const updateDoUseLocalTheme = (doUse) => {
  return { type: UPDATE_DO_USE_LOCAL_THEME, payload: doUse };
};

export const updateTheme = (mode, customOptions) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_APPEARANCE));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const doUseLocalTheme = getState().localSettings.doUseLocalTheme;
  const type = doUseLocalTheme ? UPDATE_LOCAL_THEME : UPDATE_DEFAULT_THEME;
  dispatch({ type, payload: { mode, customOptions } });
};

export const updateUpdatingThemeMode = (updatingThemeMode) => async (
  dispatch, getState
) => {
  const doUseLocalTheme = getState().localSettings.doUseLocalTheme;
  const customOptions = doUseLocalTheme ?
    getState().localSettings.themeCustomOptions :
    getState().settings.themeCustomOptions;
  const is24HFormat = getState().window.is24HFormat;

  let option;
  for (const opt of customOptions) {
    if (opt.mode === updatingThemeMode) {
      option = opt;
      break;
    }
  }
  if (!option) return;

  const { hour, minute, period } = getFormattedTime(option.startTime, is24HFormat);
  dispatch({
    type: UPDATE_UPDATING_THEME_MODE,
    payload: { updatingThemeMode, hour, minute, period },
  });
};

export const updateTimePick = (hour, minute, period) => {
  const timeObj = {};
  if (isString(hour) && hour.length > 0) timeObj.hour = hour;
  if (isString(minute) && minute.length > 0) timeObj.minute = minute;
  if (['AM', 'PM'].includes(period)) timeObj.period = period;

  return { type: UPDATE_TIME_PICK, payload: timeObj };
};

export const updateThemeCustomOptions = () => async (dispatch, getState) => {
  const doUseLocalTheme = getState().localSettings.doUseLocalTheme;
  const customOptions = doUseLocalTheme ?
    getState().localSettings.themeCustomOptions :
    getState().settings.themeCustomOptions;

  const { updatingThemeMode, hour, minute, period } = getState().timePick;

  const _themeMode = CUSTOM_MODE, _customOptions = [];

  let updatingOption;
  for (const opt of customOptions) {
    if (opt.mode === updatingThemeMode) updatingOption = opt;
    else _customOptions.push({ ...opt });
  }
  if (!updatingOption) return;

  const newStartTime = get24HFormattedTime(hour, minute, period);
  _customOptions.push({ ...updatingOption, startTime: newStartTime });

  dispatch(updateTheme(_themeMode, _customOptions));
};

export const updateIs24HFormat = (is24HFormat) => {
  return { type: UPDATE_IS_24H_FORMAT, payload: is24HFormat };
};

export const updateCustomEditorPopup = (isShown, id) => async (dispatch, getState) => {
  if (isShown) {
    const purchases = getState().info.purchases;

    if (!doEnableExtraFeatures(purchases)) {
      dispatch(updatePaywallFeature(FEATURE_CUSTOM));
      dispatch(updatePopup(PAYWALL_POPUP, true));
      return;
    }

    dispatch(updateSelectingLinkId(id));
  }

  dispatch(updatePopup(CUSTOM_EDITOR_POPUP, isShown));
};

export const updateCustomEditor = (
  title, image, rotate, translateX, translateY, zoom, doClearImage, msg,
) => {
  const payload = {};
  if (isString(title)) {
    payload.title = title;
    payload.didTitleEdit = true;
  }

  // image can be null, need to be able to clear the image.
  if (isObject(image)) {
    payload.image = image;
    payload.imageUrl = null;
    payload.didImageEdit = true;
  }
  if (doClearImage) {
    payload.image = null;
    payload.imageUrl = null;
    payload.didImageEdit = true;
  }

  if (isNumber(rotate)) {
    payload.rotate = rotate;
    payload.didImageEdit = true;
  }
  if (isNumber(translateX)) {
    payload.translateX = translateX;
    payload.didImageEdit = true;
  }
  if (isNumber(translateY)) {
    payload.translateY = translateY;
    payload.didImageEdit = true;
  }
  if (isNumber(zoom)) {
    payload.zoom = zoom;
    payload.didImageEdit = true;
  }

  if (isString(msg)) payload.msg = msg;
  else payload.msg = '';

  return { type: UPDATE_CUSTOM_EDITOR, payload };
};

export const updateImages = (name, content) => {
  return { type: UPDATE_IMAGES, payload: { [name]: content } };
};

export const updateCustomData = (title, image) => async (dispatch, getState) => {
  const links = getState().links;
  const listName = getState().display.listName;
  const selectingLinkId = getState().display.selectingLinkId;

  if (!isObject(links[listName]) || !isObject(links[listName][selectingLinkId])) {
    console.log('UpdateCustomData: No link found with selectingLinkId: ', selectingLinkId);
    return;
  }

  const _links = _.ignore(
    _.select(links[listName], ID, [selectingLinkId]),
    [STATUS, IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK]
  );
  const link = _links[selectingLinkId];

  const toLink = /** @type any */({});
  for (const attr in link) {
    if (attr === 'custom') continue;
    toLink[attr] = link[attr];
  }

  if (isString(title) && title.length > 0) {
    if (!('custom' in toLink)) toLink.custom = {};
    toLink.custom.title = title;
  }
  if (isString(image) && image.length > 0) {
    if (!('custom' in toLink)) toLink.custom = {};
    toLink.custom.image = image;
  }

  if (isEqual(link, toLink)) return;

  const payload = { listName: listName, fromLink: link, toLink };
  dispatch({
    type: UPDATE_CUSTOM_DATA,
    payload,
    meta: {
      offline: {
        effect: { method: UPDATE_CUSTOM_DATA, params: payload },
        commit: { type: UPDATE_CUSTOM_DATA_COMMIT },
        rollback: { type: UPDATE_CUSTOM_DATA_ROLLBACK, meta: payload },
      },
    },
  });
};

export const updateCustomDataDeleteStep = (
  serverUnusedFPaths, localUnusedFPaths
) => async (dispatch, getState) => {
  try {
    await serverApi.deleteFiles(serverUnusedFPaths);
    await fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('updateCustomData error: ', error);
    // error in this step should be fine
  }
};

export const rehydrateStaticFiles = () => async (dispatch, getState) => {
  const listName = getState().display.listName;
  const links = getState().links;

  let fpaths = [];
  for (const id in links[listName]) {
    const link = links[listName][id];
    if (isObject(link.custom)) {
      const { image } = link.custom;
      if (isString(image) && image.startsWith(CD_ROOT + '/')) {
        if (!fpaths.includes(image)) fpaths.push(image);
      }
    }
  }

  const files = await fileApi.getFiles(fpaths);

  const images = {};
  for (let i = 0; i < files.fpaths.length; i++) {
    images[files.fpaths[i]] = files.contentUrls[i];
  }

  dispatch({
    type: REHYDRATE_STATIC_FILES, payload: { listName, images },
  });
};

const _cleanUpStaticFiles = async (getState) => {
  const linkFPaths = getLinkFPaths(getState());
  const mainIds = getLinkMainIds(linkFPaths);

  // Delete unused static files in server
  let staticFPaths = getStaticFPaths(getState());

  let unusedIds = [], unusedFPaths = [];
  for (const fpath of staticFPaths) {
    const { id } = extractStaticFPath(fpath);
    if (!mainIds.includes(getMainId(id))) {
      unusedIds.push(id);
      unusedFPaths.push(fpath);
    }
  }
  unusedFPaths = unusedFPaths.slice(0, N_LINKS);

  if (unusedFPaths.length > 0) {
    await serverApi.deleteFiles(unusedFPaths);
    await fileApi.deleteFiles(unusedFPaths);
  }

  // Delete unused static files in local
  staticFPaths = await fileApi.getStaticFPaths();

  unusedFPaths = [];
  for (const fpath of staticFPaths) {
    const { id } = extractStaticFPath(fpath);
    if (!mainIds.includes(getMainId(id))) {
      unusedIds.push(id);
      unusedFPaths.push(fpath);
    }
  }
  unusedFPaths = unusedFPaths.slice(0, N_LINKS);

  if (unusedFPaths.length > 0) {
    await fileApi.deleteFiles(unusedFPaths);
  }

  // If too many static files locally, delete some of them.
  // If 1 image is around 500 KB, with 500 MB limitation, we can store 1000 images,
  //   so might not need to do this.

  return unusedIds;
};

export const cleanUpStaticFiles = () => async (dispatch, getState) => {
  const { cleanUpStaticFilesDT } = getState().localSettings;
  if (!cleanUpStaticFilesDT) return;

  const now = Date.now();
  let p = 1.0 / (N_DAYS * 24 * 60 * 60 * 1000) * Math.abs(now - cleanUpStaticFilesDT);
  p = Math.max(0.01, Math.min(p, 0.99));
  const doCheck = p > Math.random();

  if (!doCheck) return;

  // Don't need offline, if no network or get killed, can do it later.
  dispatch({ type: CLEAN_UP_STATIC_FILES });
  try {
    const ids = await _cleanUpStaticFiles(getState);
    dispatch({ type: CLEAN_UP_STATIC_FILES_COMMIT, payload: { ids } });
  } catch (error) {
    console.log('Error when clean up static files: ', error);
    dispatch({ type: CLEAN_UP_STATIC_FILES_ROLLBACK });
  }
};

export const updateLockAction = (lockAction) => {
  return { type: UPDATE_LOCK_ACTION, payload: lockAction };
};

export const updateLockEditor = (payload) => {
  return { type: UPDATE_LOCK_EDITOR, payload };
};

export const showAddLockEditorPopup = (actionType) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_LOCK));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  dispatch(updateLockAction(actionType));
  dispatch(updatePopup(LOCK_EDITOR_POPUP, true));
};

export const addLockList = (
  listName, password, canChangeListNames, canExport
) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  password = await userSession.encrypt(password);

  dispatch({
    type: ADD_LOCK_LIST,
    payload: { listName, password, canChangeListNames, canExport },
  });
  dispatch(updatePopup(LOCK_EDITOR_POPUP, false));
};

export const removeLockList = (listName, password) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  const lockedList = getState().lockSettings.lockedLists[listName];

  let isValid = false;
  if (isObject(lockedList)) {
    if (isString(lockedList.password)) {
      const lockedPassword = await userSession.decrypt(lockedList.password);
      if (lockedPassword === password) isValid = true;
    }
  }
  if (!isValid) {
    dispatch(updateLockEditor({
      isLoadingShown: false, errMsg: 'Password is not correct. Please try again.',
    }));
    return;
  }

  dispatch({ type: REMOVE_LOCK_LIST, payload: { listName } });
  dispatch(updatePopup(LOCK_EDITOR_POPUP, false));
};

export const lockCurrentList = () => async (dispatch, getState) => {
  const listName = getState().display.listName;
  dispatch({ type: LOCK_LIST, payload: { listName } });
};

export const unlockList = (listName, password) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  const lockedList = getState().lockSettings.lockedLists[listName];

  let isValid = false;
  if (isObject(lockedList)) {
    if (isString(lockedList.password)) {
      const lockedPassword = await userSession.decrypt(lockedList.password);
      if (lockedPassword === password) isValid = true;
    }
  }
  if (!isValid) {
    dispatch(updateLockEditor({
      isLoadingShown: false, errMsg: 'Password is not correct. Please try again.',
    }));
    return;
  }

  dispatch({ type: UNLOCK_LIST, payload: { listName, unlockedDT: Date.now() } });
  dispatch(updatePopup(LOCK_EDITOR_POPUP, false));
};

const cleanUpLocks = async (dispatch, getState) => {
  const { listNameMap } = getState().settings;
  const lockSettings = getState().lockSettings;

  const listNames = [];
  for (const listName in lockSettings.lockedLists) {
    if (!doContainListName(listName, listNameMap)) listNames.push(listName);
  }

  dispatch({ type: CLEAN_UP_LOCKS, payload: { listNames } });
};

export const checkObsoleteHub = async (dispatch, getState) => {
  const userData = await userSession.loadUserData();

  const { hubUrl, profile } = userData;
  if (!hubUrl.includes('hub.blockstack.org')) return;

  const hubUrlInProfile = profile && profile.api && profile.api.gaiaHubUrl;
  dispatch(updateMigrateHubState({ hubUrl, hubUrlInProfile }));
};

export const updateMigrateHubState = (data) => {
  return { type: UPDATE_MIGRATE_HUB_STATE, payload: data };
};

export const updateMigrateHubProgress = (progress) => {
  return { type: UPDATE_MIGRATE_HUB_STATE, payload: { progress } };
};

const _migrateHub = async (dispatch, getState) => {
  let doneCount = 0;
  dispatch(updateMigrateHubProgress({ total: 'calculating...', done: doneCount }));

  const userData = await userSession.loadUserData();
  const sdHubConfig = await mhApi.createSdHubConfig(
    userData.appPrivateKey, userData.gaiaAssociationToken
  );

  const fpaths = [], sdFPaths = [], ftdFPaths = [];
  await serverApi.listFiles((fpath) => {
    fpaths.push(fpath);
    return true;
  });
  if (fpaths.length === 0) {
    await mhApi.storeInfoFile(sdHubConfig, userData.appPrivateKey);
    await mhApi.revokeAuth(userData.gaiaHubConfig);
    dispatch(updateMigrateHubProgress({ total: 0, done: doneCount }));
    return;
  }

  sdFPaths.push(...(await mhApi.listFiles(sdHubConfig)));

  for (const fpath of fpaths) {
    if (sdFPaths.includes(fpath)) continue;
    ftdFPaths.push(fpath);
  }

  const total = ftdFPaths.length;
  if (total > doneCount) {
    dispatch(updateMigrateHubProgress({ total, done: doneCount }));
  }

  for (let i = 0, j = ftdFPaths.length; i < j; i += N_LINKS) {
    const _fpaths = ftdFPaths.slice(i, i + N_LINKS);
    await Promise.all(_fpaths.map(fpath => mhApi.migrateFile(
      userData.gaiaHubConfig, sdHubConfig, fpath
    )));

    doneCount += _fpaths.length;
    if (total > doneCount) {
      dispatch(updateMigrateHubProgress({ total, done: doneCount }));
    }
  }

  await mhApi.revokeAuth(userData.gaiaHubConfig);
  dispatch(updateMigrateHubProgress({ total, done: doneCount }));
};

export const migrateHub = () => async (dispatch, getState) => {
  try {
    await _migrateHub(dispatch, getState);
  } catch (error) {
    dispatch(updateMigrateHubProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};
