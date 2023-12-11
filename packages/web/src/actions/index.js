// A first line mark for theDiff
import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import { LexoRank } from '@wewatch/lexorank';

import userSession from '../userSession';
import axios from '../axiosWrapper';
import iapApi from '../paddleWrapper';
import dataApi from '../apis/blockstack';
import fileApi from '../apis/localFile';
import lsgApi from '../apis/localSg';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_WINDOW_SIZE, UPDATE_VISUAL_SIZE, UPDATE_WINDOW,
  UPDATE_HISTORY_POSITION, UPDATE_STACKS_ACCESS, UPDATE_LIST_NAME, UPDATE_QUERY_STRING,
  UPDATE_SEARCH_STRING, UPDATE_POPUP, UPDATE_LINK_EDITOR, UPDATE_STATUS,
  UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING, ADD_SELECTED_LINK_IDS,
  DELETE_SELECTED_LINK_IDS, UPDATE_SELECTING_LINK_ID, FETCH, FETCH_COMMIT,
  FETCH_ROLLBACK, CACHE_FETCHED, UPDATE_FETCHED, FETCH_MORE, FETCH_MORE_COMMIT,
  FETCH_MORE_ROLLBACK, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, REFRESH_FETCHED,
  ADD_FETCHING_INFO, DELETE_FETCHING_INFO, SET_SHOWING_LINK_IDS, ADD_LINKS,
  ADD_LINKS_COMMIT, ADD_LINKS_ROLLBACK, DELETE_LINKS, DELETE_LINKS_COMMIT,
  DELETE_LINKS_ROLLBACK, MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT,
  MOVE_LINKS_ADD_STEP_ROLLBACK, MOVE_LINKS_DELETE_STEP, MOVE_LINKS_DELETE_STEP_COMMIT,
  MOVE_LINKS_DELETE_STEP_ROLLBACK, CANCEL_DIED_LINKS, DELETE_OLD_LINKS_IN_TRASH,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_EXTRACTED_CONTENTS, UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES,
  UPDATE_LIST_NAMES, MOVE_LIST_NAME, MOVE_TO_LIST_NAME, DELETE_LIST_NAMES,
  UPDATE_SELECTING_LIST_NAME, UPDATE_DO_EXTRACT_CONTENTS,
  UPDATE_DO_DELETE_OLD_LINKS_IN_TRASH, UPDATE_DO_DESCENDING_ORDER, TRY_UPDATE_SETTINGS,
  TRY_UPDATE_SETTINGS_COMMIT, TRY_UPDATE_SETTINGS_ROLLBACK, UPDATE_SETTINGS,
  TRY_UPDATE_INFO, TRY_UPDATE_INFO_COMMIT, TRY_UPDATE_INFO_ROLLBACK,
  CANCEL_DIED_SETTINGS, MERGE_SETTINGS, MERGE_SETTINGS_COMMIT, MERGE_SETTINGS_ROLLBACK,
  UPDATE_SETTINGS_VIEW_ID, UPDATE_DO_USE_LOCAL_LAYOUT, UPDATE_DEFAULT_LAYOUT_TYPE,
  UPDATE_LOCAL_LAYOUT_TYPE, UPDATE_DELETE_ACTION, UPDATE_DISCARD_ACTION,
  UPDATE_LIST_NAMES_MODE, GET_PRODUCTS, GET_PRODUCTS_COMMIT, GET_PRODUCTS_ROLLBACK,
  REQUEST_PURCHASE, REQUEST_PURCHASE_COMMIT, REQUEST_PURCHASE_ROLLBACK,
  RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
  REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
  UPDATE_IAP_PUBLIC_KEY, UPDATE_IAP_PRODUCT_STATUS, UPDATE_IAP_PURCHASE_STATUS,
  UPDATE_IAP_RESTORE_STATUS, UPDATE_IAP_REFRESH_STATUS, PIN_LINK, PIN_LINK_COMMIT,
  PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_COMMIT, UNPIN_LINK_ROLLBACK,
  MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_COMMIT,
  MOVE_PINNED_LINK_ADD_STEP_ROLLBACK, CANCEL_DIED_PINS, UPDATE_SYSTEM_THEME_MODE,
  UPDATE_DO_USE_LOCAL_THEME, UPDATE_DEFAULT_THEME, UPDATE_LOCAL_THEME,
  UPDATE_UPDATING_THEME_MODE, UPDATE_TIME_PICK, UPDATE_IS_24H_FORMAT,
  UPDATE_CUSTOM_EDITOR, UPDATE_IMAGES, UPDATE_CUSTOM_DATA, UPDATE_CUSTOM_DATA_COMMIT,
  UPDATE_CUSTOM_DATA_ROLLBACK, CLEAN_UP_STATIC_FILES, CLEAN_UP_STATIC_FILES_COMMIT,
  CLEAN_UP_STATIC_FILES_ROLLBACK, UPDATE_PAYWALL_FEATURE, UPDATE_LOCK_ACTION,
  UPDATE_LOCK_EDITOR, ADD_LOCK_LIST, REMOVE_LOCK_LIST, LOCK_LIST, UNLOCK_LIST,
  CLEAN_UP_LOCKS, UPDATE_TAG_EDITOR, UPDATE_TAG_DATA_S_STEP,
  UPDATE_TAG_DATA_S_STEP_COMMIT, UPDATE_TAG_DATA_S_STEP_ROLLBACK,
  UPDATE_TAG_DATA_T_STEP, UPDATE_TAG_DATA_T_STEP_COMMIT,
  UPDATE_TAG_DATA_T_STEP_ROLLBACK, CANCEL_DIED_TAGS, UPDATE_TAG_NAME_EDITORS,
  ADD_TAG_NAMES, UPDATE_TAG_NAMES, MOVE_TAG_NAME, DELETE_TAG_NAMES,
  UPDATE_SELECTING_TAG_NAME, RESET_STATE,
} from '../types/actionTypes';
import {
  BACK_DECIDER, BACK_POPUP, ALL, HASH_BACK, SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP,
  SEARCH_POPUP, PROFILE_POPUP, CARD_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP,
  CUSTOM_EDITOR_POPUP, TAG_EDITOR_POPUP, PAYWALL_POPUP, CONFIRM_DELETE_POPUP,
  CONFIRM_DISCARD_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP,
  SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP, LOCK_EDITOR_POPUP, SWWU_POPUP,
  DISCARD_ACTION_UPDATE_LIST_NAME, DISCARD_ACTION_UPDATE_TAG_NAME, LOCAL_LINK_ATTRS,
  MY_LIST, TRASH, N_LINKS, N_DAYS, CD_ROOT, ADDED, DIED_ADDING, DIED_MOVING,
  DIED_REMOVING, DIED_DELETING, DIED_UPDATING, SHOWING_STATUSES, BRACE_PRE_EXTRACT_URL,
  EXTRACT_INIT, IAP_VERIFY_URL, IAP_STATUS_URL, PADDLE, COM_BRACEDOTTO,
  COM_BRACEDOTTO_SUPPORTER, SIGNED_TEST_STRING, VALID, INVALID, ACTIVE, UNKNOWN,
  SWAP_LEFT, SWAP_RIGHT, WHT_MODE, BLK_MODE, CUSTOM_MODE, FEATURE_PIN,
  FEATURE_APPEARANCE, FEATURE_CUSTOM, FEATURE_LOCK, FEATURE_TAG, PADDLE_RANDOM_ID,
  VALID_PASSWORD, PASSWORD_MSGS, IN_USE_LIST_NAME, LIST_NAME_MSGS, VALID_TAG_NAME,
  DUPLICATE_TAG_NAME, IN_USE_TAG_NAME, TAG_NAME_MSGS, VALID_URL,
  DELETE_ACTION_LIST_NAME, DELETE_ACTION_TAG_NAME,
} from '../types/const';
import {
  isEqual, isArrayEqual, isString, isObject, isNumber, throttle, randomString,
  getMainId, getLinkMainIds, getUrlFirstChar, separateUrlAndParam, extractUrl,
  getUserImageUrl, validateUrl, randomDecor, getListNameObj, getAllListNames,
  getLatestPurchase, getValidPurchase, doEnableExtraFeatures, createDataFName,
  getLinkFPaths, getStaticFPaths, createSettingsFPath, extractPinFPath, getPinFPaths,
  getPins, separatePinnedValues, sortLinks, sortWithPins, getRawPins, getFormattedTime,
  get24HFormattedTime, extractStaticFPath, getWindowSize, getEditingListNameEditors,
  validatePassword, doContainListName, sleep, sample, extractLinkFPath, extractLinkId,
  getLink, getListNameAndLink, getNLinkObjs, getNLinkFPaths, newObject,
  addFetchedToVars, createLinkFPath, isFetchedLinkId, doesIncludeFetching,
  doesIncludeFetchingMore, isFetchingInterrupted, getTagFPaths, getInUseTagNames,
  getEditingTagNameEditors, getTags, getTagNameObj, getTagNameObjFromDisplayName,
  validateTagNameDisplayName, extractTagFPath, getNLinkFPathsByQt, getLastLinkFPaths,
  getLinkPrevFPathsPerId,
} from '../utils';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

export const init = async (store) => {

  await handlePendingSignIn()(store.dispatch, store.getState);

  const isUserSignedIn = userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }

  const { windowWidth, windowHeight, visualWidth, visualHeight } = getWindowSize();

  const darkMatches = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const is24HFormat = null;

  store.dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      href: window.location.href,
      windowWidth,
      windowHeight,
      visualWidth,
      visualHeight,
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
    },
  });

  popHistoryState(store);
  window.addEventListener('popstate', function () {
    popHistoryState(store);
  });

  window.addEventListener('resize', throttle(() => {
    store.dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      store.dispatch({
        type: UPDATE_VISUAL_SIZE,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
        },
      });
    }, 16));
  }

  window.addEventListener('beforeunload', (e) => {
    const isUserSignedIn = userSession.isUserSignedIn();
    if (!isUserSignedIn) return;

    const { busy, online, outbox, retryScheduled } = store.getState().offline;
    if ((busy || (online && outbox.length > 0)) && !retryScheduled) {
      const found = outbox.some(action => {
        if (!isObject(action)) return false;
        return [
          ADD_LINKS, MOVE_LINKS_ADD_STEP, MOVE_LINKS_DELETE_STEP, DELETE_LINKS,
          UPDATE_CUSTOM_DATA, TRY_UPDATE_SETTINGS, MERGE_SETTINGS, PIN_LINK,
          UNPIN_LINK, MOVE_PINNED_LINK_ADD_STEP, UPDATE_TAG_DATA_S_STEP,
          UPDATE_TAG_DATA_T_STEP,
        ].includes(action.type);
      });
      if (found) {
        e.preventDefault();
        return e.returnValue = 'It looks like your changes are being saved to the server. Do you want to leave immediately and save your changes later?';
      }
    }

    if (!store.getState().display.isSettingsPopupShown) return;

    const settings = store.getState().settings;
    const snapshotSettings = store.getState().snapshot.settings;
    if (!isEqual(settings, snapshotSettings)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the settings haven\'t been saved. Do you want to leave immediately and discard your changes?';
    }

    const listNameEditors = store.getState().listNameEditors;
    const listNameMap = store.getState().settings.listNameMap;
    const editingLNEs = getEditingListNameEditors(listNameEditors, listNameMap);
    if (isObject(editingLNEs)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the list names haven\'t been saved. Do you want to leave this site and discard your changes?';
    }

    const tagNameEditors = store.getState().tagNameEditors;
    const tagNameMap = store.getState().settings.tagNameMap;
    const editingTNEs = getEditingTagNameEditors(tagNameEditors, tagNameMap);
    if (isObject(editingTNEs)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the tag names haven\'t been saved. Do you want to leave this site and discard your changes?';
    }
  }, { capture: true });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const systemThemeMode = e.matches ? BLK_MODE : WHT_MODE;
    store.dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });
};

const handlePendingSignIn = () => async (dispatch, getState) => {

  const { pathname } = extractUrl(window.location.href);
  if (!(pathname === '/' && userSession.isSignInPending())) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true,
  });

  try {
    await userSession.handlePendingSignIn();
  } catch (error) {
    console.log('Catched an error thrown by handlePendingSignIn', error);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const { separatedUrl } = separateUrlAndParam(window.location.href, 'authResponse');
  window.history.replaceState(window.history.state, '', separatedUrl);

  const isUserSignedIn = userSession.isUserSignedIn();
  if (isUserSignedIn) await resetState(dispatch);

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
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

const isPopupShown = (state) => {
  return getPopupShownId(state) !== null;
};

const updatePopupAsBackPressed = (dispatch, getState) => {

  // Close other popups before search,
  //   this depends on getPopupShownId to return other ids before search id
  let id = getPopupShownId(getState());
  if (!id) {
    console.log('updatePopupAsBackPressed is called while no popup is shown.');
    id = ALL;
  }

  if (id === ADD_POPUP) {
    if (window.document.activeElement instanceof HTMLInputElement) {
      window.document.activeElement.blur();
    }
  }
  if (id === SEARCH_POPUP) {
    // Clear search string
    //   and need to defocus too to prevent keyboard appears on mobile
    dispatch(updateSearchString(''));

    if (window.document.activeElement instanceof HTMLInputElement) {
      window.document.activeElement.blur();
    }
  }

  dispatch(updatePopup(id, false));
};

export const popHistoryState = (store) => {

  let historyPosition = window.history.state;
  if (
    historyPosition === BACK_DECIDER &&
    store.getState().window.historyPosition === BACK_POPUP
  ) {

    // if back button pressed and there is a popup shown
    if (isPopupShown(store.getState())) {
      // disable back button by forcing to go forward in history states
      // No need to update state here as window.history.go triggers popstate event
      updatePopupAsBackPressed(store.dispatch, store.getState);

      window.history.go(1);
      return
    }

    // if back button pressed and is bulk editing
    if (store.getState().display.isBulkEditing) {

      store.dispatch(updateBulkEdit(false));

      window.history.go(1);
      return
    }

    // No popup shown and no bulk editing, go back one more
    // need to update state first before going off so that when back know that back from somewhere else
    store.dispatch({
      type: UPDATE_WINDOW,
      payload: {
        href: window.location.href,
        historyPosition: null,
      },
    });

    // https://stackoverflow.com/questions/3588315/how-to-check-if-the-user-can-go-back-in-browser-history-or-not
    const href = window.location.href;
    window.history.go(-1);
    setTimeout(function () {
      // if location was not changed, then there is no history back
      if (href === window.location.href) {
        window.history.replaceState(null, '', HASH_BACK);
        window.history.pushState(null, '', href);
        window.history.go(-1);
      }
    }, 500);
    return;
  }

  if (historyPosition === BACK_DECIDER) {
    // A page forwards to BACK_DECIDER, forward one more to BACK_POPUP
    // No need to update state here as window.history.go triggers popstate event
    window.history.go(1);
    return;
  }

  store.dispatch({
    type: UPDATE_WINDOW,
    payload: {
      href: window.location.href,
      historyPosition: historyPosition,
    },
  });
};

export const updateHistoryPosition = historyPosition => {
  return { type: UPDATE_HISTORY_POSITION, payload: historyPosition };
};

export const signOut = () => async (dispatch, getState) => {
  userSession.signUserOut();
  await resetState(dispatch);
};

export const updateUserData = (data) => async (dispatch, getState) => {
  try {
    userSession.updateUserData(data);
  } catch (error) {
    window.alert(`Update user data failed! Please refresh the page and try again. If the problem persists, please contact us.\n\n${error}`);
    return;
  }

  const isUserSignedIn = userSession.isUserSignedIn();
  if (isUserSignedIn) dispatch(updateUserSignedIn());
};

export const updateUserSignedIn = () => async (dispatch, getState) => {
  await resetState(dispatch);

  const userData = userSession.loadUserData();
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
  lsgApi.removeItemSync(PADDLE_RANDOM_ID);

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
  dispatch(updateFetched(null, false, true));
  dispatch(updateFetchedMore(null, true));

  dispatch({ type: UPDATE_LIST_NAME, payload: listName });
};

export const updateQueryString = (queryString) => async (dispatch, getState) => {
  dispatch(updateFetched(null, false, true));
  dispatch(updateFetchedMore(null, true));

  dispatch({ type: UPDATE_QUERY_STRING, payload: queryString });
};

export const updateSearchString = (searchString) => {
  return { type: UPDATE_SEARCH_STRING, payload: searchString };
};

export const updateLinkEditor = (values) => {
  return { type: UPDATE_LINK_EDITOR, payload: values };
};

export const updateStatus = (status) => {
  return { type: UPDATE_STATUS, payload: status };
};

export const updateHref = (href) => {
  return { type: UPDATE_HREF, payload: href };
};

export const updateBulkEdit = (isBulkEditing) => {
  return { type: UPDATE_BULK_EDITING, payload: isBulkEditing };
};

export const addSelectedLinkIds = (ids) => {
  return { type: ADD_SELECTED_LINK_IDS, payload: ids };
};

export const deleteSelectedLinkIds = (ids) => {
  return { type: DELETE_SELECTED_LINK_IDS, payload: ids };
};

export const updateSelectingLinkId = (id) => {
  return { type: UPDATE_SELECTING_LINK_ID, payload: id };
};

const _getIdsAndImages = async (linkObjsOrFPaths, links) => {
  const ids = [], imageFPaths = [], images = {};

  for (const objOrFPath of linkObjsOrFPaths) {
    let link;
    if (isString(objOrFPath)) {
      const { listName, id } = extractLinkFPath(objOrFPath);
      if (isObject(links[listName])) link = links[listName][id];
    } else if (isObject(objOrFPath)) {
      link = objOrFPath;
    } else {
      console.log('In _getIdsAndImages, invalid objOrFPath:', objOrFPath);
      continue;
    }
    if (!isObject(link)) continue;

    ids.push(link.id);
    if (isObject(link.custom)) {
      const { image } = link.custom;
      if (isString(image) && image.startsWith(CD_ROOT + '/')) {
        if (!imageFPaths.includes(image)) imageFPaths.push(image);
      }
    }
  }
  if (imageFPaths.length > 0) {
    const files = await fileApi.getFiles(imageFPaths);
    for (let i = 0; i < files.fpaths.length; i++) {
      images[files.fpaths[i]] = files.contentUrls[i];
    }
  }

  return { ids, images };
};

export const fetch = () => async (dispatch, getState) => {
  const doForce = vars.fetch.doForce;
  vars.fetch.doForce = false;

  const links = getState().links;
  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const didFetch = getState().display.didFetch;
  const didFetchSettings = getState().display.didFetchSettings;
  const fetchingInfos = getState().display.fetchingInfos;
  const doForceLock = getState().display.doForceLock;
  const cachedFetched = getState().fetched;
  const pendingPins = getState().pendingPins;
  const pendingTags = getState().pendingTags;
  const lockedLists = getState().lockSettings.lockedLists;

  let doDescendingOrder = getState().settings.doDescendingOrder;

  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
  const pinFPaths = getPinFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const lnOrQt = queryString ? queryString : listName;
  if (doesIncludeFetching(lnOrQt, doForce, fetchingInfos) || lnOrQt in cachedFetched) {
    // For queryString, continue showing loading.
    if (!queryString && !vars.fetch.doShowLoading) {
      const { hasMore, objsWithPcEc } = getNLinkObjs({
        links, listName, doDescendingOrder, pinFPaths, pendingPins,
      });
      const { ids, images } = await _getIdsAndImages(objsWithPcEc, links);
      dispatch({
        type: SET_SHOWING_LINK_IDS,
        payload: { ids, hasMore, images, doClearSelectedLinkIds: true },
      });
    }
    vars.fetch.doShowLoading = false;
    return;
  }

  const fthId = `${Date.now()}${randomString(4)}`;
  dispatch(addFetchingInfo({ type: FETCH, doForce, lnOrQt, fthId }));

  const bin = { fetchedLinkFPaths: [], unfetchedLinkFPaths: [], hasMore: false };
  if (didFetch && didFetchSettings) {
    let fpaths, fpathsWithPcEc;
    if (queryString) {
      const _result = getNLinkFPathsByQt({
        linkFPaths, links, doDescendingOrder, pinFPaths, pendingPins, tagFPaths,
        pendingTags, doForceLock, lockedLists, queryString,
      });
      [fpaths, fpathsWithPcEc] = [_result.fpaths, _result.fpathsWithPcEc];
      bin.hasMore = _result.hasMore;
    } else {
      const _result = getNLinkFPaths({
        linkFPaths, links, listName, doDescendingOrder, pinFPaths, pendingPins,
      });
      [fpaths, fpathsWithPcEc] = [_result.fpaths, _result.fpathsWithPcEc];
      bin.hasMore = _result.hasMore;
    }
    for (const linkFPath of fpaths) {
      const etRs = extractLinkFPath(linkFPath);
      if (isFetchedLinkId(vars.fetch.fetchedLinkIds, links, etRs.listName, etRs.id)) {
        bin.fetchedLinkFPaths.push(linkFPath);
      } else {
        bin.unfetchedLinkFPaths.push(linkFPath);
      }
    }
    if (bin.unfetchedLinkFPaths.length === 0) {
      const { ids, images } = await _getIdsAndImages(fpathsWithPcEc, links);
      dispatch({
        type: SET_SHOWING_LINK_IDS,
        payload: { ids, hasMore: bin.hasMore, images, doClearSelectedLinkIds: true },
      });
      // E.g., in settings commit, reset fetchedLnOrQts but not fetchedLinkIds,
      //   need to add lnOrQt for calculate isStale correctly.
      addFetchedToVars(lnOrQt, null, vars);
      dispatch(deleteFetchingInfo(fthId));
      vars.fetch.doShowLoading = false;
      return;
    }
  }
  // For queryString, continue showing loading.
  if (!queryString && !vars.fetch.doShowLoading) {
    const { hasMore, objsWithPcEc } = getNLinkObjs({
      links, listName, doDescendingOrder, pinFPaths, pendingPins,
    });
    const { ids, images } = await _getIdsAndImages(objsWithPcEc, links);
    dispatch({
      type: SET_SHOWING_LINK_IDS,
      payload: { ids, hasMore, images, doClearSelectedLinkIds: true },
    });
  }
  vars.fetch.doShowLoading = false;

  const payload = { listName, queryString, lnOrQt, fthId };
  dispatch({
    type: FETCH,
    payload,
    meta: {
      offline: {
        effect: { method: FETCH, params: { ...payload, getState } },
        commit: { type: FETCH_COMMIT },
        rollback: {
          type: FETCH_ROLLBACK,
          meta: { ...payload, signInDT: getState().localSettings.signInDT },
        },
      },
    },
  });
};

const _poolLinks = (linkFPaths, payloadLinks, stateLinks) => {
  return linkFPaths.map(fpath => {
    const { listName, id } = extractLinkFPath(fpath);

    let links = payloadLinks;
    if (isObject(links[listName]) && isObject(links[listName][id])) {
      return links[listName][id];
    }

    links = stateLinks;
    if (isObject(links[listName]) && isObject(links[listName][id])) {
      return links[listName][id];
    }

    return null;
  });
};

const _poolListNameAndLinks = (linkFPaths, payloadLinks, stateLinks) => {
  return linkFPaths.map(fpath => {
    const { listName, id } = extractLinkFPath(fpath);

    let links = payloadLinks;
    if (isObject(links[listName]) && isObject(links[listName][id])) {
      return { listName, link: links[listName][id] };
    }

    links = stateLinks;
    if (isObject(links[listName]) && isObject(links[listName][id])) {
      return { listName, link: links[listName][id] };
    }

    return { listName: null, link: null };
  });
};

const _getNnAndUqLinks = (nuqLinks) => {
  const uqLinks = [], usedMainIds = [];
  for (const link of nuqLinks) {
    if (!isObject(link)) continue;

    const mainId = getMainId(link.id);
    if (usedMainIds.includes(mainId)) continue;

    uqLinks.push(link);
    usedMainIds.push(mainId);
  }
  return uqLinks;
};

const _getUpdateFetchedAction = (getState, payload) => {
  /*
    updateAction
    0. justUpdate: no links showing, can just update
    1. noNew: exactly the same, nothing new, update only hasMore
    2. limitedSame: partially the same, first N links are the same
    3. haveNew: not the same for sure, something new, update if not scroll or popup
         else show fetchedPopup
  */
  const fetchingInfos = getState().display.fetchingInfos;
  const showingLinkIds = getState().display.showingLinkIds;
  const pendingPins = getState().pendingPins;
  const cachedFetchedMore = getState().fetchedMore;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const pinFPaths = getPinFPaths(getState());

  if (!Array.isArray(showingLinkIds) || showingLinkIds.length === 0) return 0;

  if (
    doesIncludeFetchingMore(payload.lnOrQt, false, fetchingInfos) ||
    doesIncludeFetchingMore(payload.lnOrQt, true, fetchingInfos) ||
    payload.lnOrQt in cachedFetchedMore
  ) {
    return 3; // Try to prevent differences in the fetchMore.
  }

  // Only showing status links, not processing fpath links.
  const ossLinks = [], npfLinks = [];
  const showingLinks = showingLinkIds.map(linkId => getLink(linkId, getState().links));
  for (const link of showingLinks) {
    if (!isObject(link)) continue;

    if (SHOWING_STATUSES.includes(link.status)) ossLinks.push(link);
    if (link.status === ADDED) npfLinks.push(link);
  }

  if (ossLinks.length === 0) return 0;

  const { fetchedLinkFPaths, unfetchedLinkFPaths } = payload;
  const updatingLinkFPaths = [...fetchedLinkFPaths, ...unfetchedLinkFPaths];

  let updatingLinks = _poolLinks(updatingLinkFPaths, payload.links, getState().links);
  updatingLinks = _getNnAndUqLinks(updatingLinks);
  updatingLinks = sortLinks(updatingLinks, doDescendingOrder);
  updatingLinks = sortWithPins(updatingLinks, pinFPaths, pendingPins, (link) => {
    return getMainId(link.id);
  });

  if (npfLinks.length < updatingLinks.length) return 3;
  if (npfLinks.length > updatingLinks.length && !payload.hasMore) return 3;

  for (let i = 0; i < updatingLinks.length; i++) {
    const [npfLink, updatingLink] = [npfLinks[i], updatingLinks[i]];
    if (
      npfLink.id !== updatingLink.id ||
      !isEqual(npfLink.extractedResult, updatingLink.extractedResult) ||
      !isEqual(npfLink.custom, updatingLink.custom) ||
      npfLink.doIgnoreExtrdRst
    ) {
      return 3;
    }
  }

  if (npfLinks.length > updatingLinks.length) return 2;
  return 1;
};

export const tryUpdateFetched = (payload) => async (dispatch, getState) => {
  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const fetchingInfos = getState().display.fetchingInfos;

  // If interrupted e.g. by refreshFetched,
  //   don't updateFetched so don't override any variables.
  if (isFetchingInterrupted(payload.fthId, fetchingInfos)) {
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  const lnOrQt = queryString ? queryString : listName;
  if (payload.lnOrQt !== lnOrQt) {
    dispatch(updateFetched(payload, false, true));
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  // If no links from fetching, they are all deleted,
  //   still the process of updating is the same.

  const updateAction = _getUpdateFetchedAction(getState, payload);
  if (updateAction === 0) {
    dispatch(updateFetched(payload));
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  if (updateAction === 1) {
    // As updateAction is not 0, showingLinkIds should be an array.
    // There is also a check on keepId if it's an array or not.
    const showingLinkIds = getState().display.showingLinkIds;
    dispatch({
      type: UPDATE_FETCHED,
      payload: {
        lnOrQt: payload.lnOrQt, keepIds: showingLinkIds, hasMore: payload.hasMore,
      },
    });
    addFetchedToVars(payload.lnOrQt, payload.links, vars);
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  if (updateAction === 2) {
    addFetchedToVars(null, payload.links, vars);
    dispatch(deleteFetchingInfo(payload.fthId));
    dispatch(fetchMore(true));
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const scrollY = vars.scrollPanel.scrollY;
    if (scrollY < 32 && !isPopupShown(getState())) {
      dispatch(updateFetched(payload));
      dispatch(deleteFetchingInfo(payload.fthId));
      return;
    }
  }

  dispatch({ type: CACHE_FETCHED, payload });
  dispatch(deleteFetchingInfo(payload.fthId));
};

export const updateFetched = (
  payload, doChangeListCount = false, noDisplay = false
) => async (dispatch, getState) => {

  if (!payload) {
    const listName = getState().display.listName;
    const queryString = getState().display.queryString;
    const lnOrQt = queryString ? queryString : listName;

    const fetched = getState().fetched[lnOrQt];
    if (fetched) ({ payload } = fetched);
  }
  if (!payload) return;

  const links = getState().links;
  const pendingPins = getState().pendingPins;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pinFPaths = getPinFPaths(getState());

  const { fetchedLinkFPaths, unfetchedLinkFPaths } = payload;
  const updatingLinkFPaths = [...fetchedLinkFPaths, ...unfetchedLinkFPaths];
  const updatingLnAndLks = _poolListNameAndLinks(
    updatingLinkFPaths, payload.links, links
  );

  const lksPerLn = {}, updatingLinks = [];
  for (const { listName, link } of updatingLnAndLks) {
    if (!isString(listName) || !isObject(link)) continue;

    if (!isObject(lksPerLn[listName])) lksPerLn[listName] = {};
    lksPerLn[listName][link.id] = link;

    updatingLinks.push(link);
  }

  if (noDisplay) {
    dispatch({
      type: UPDATE_FETCHED, payload: { lnOrQt: payload.lnOrQt, links: lksPerLn },
    });
    addFetchedToVars(payload.lnOrQt, payload.links, vars);
    return;
  }

  const processingLinks = [];
  if (isObject(links[payload.lnOrQt])) {
    for (const link of Object.values(links[payload.lnOrQt])) {
      if (link.status === ADDED) continue;
      processingLinks.push(link);
    }
  }

  let sortedLinks = [...processingLinks, ...updatingLinks];
  sortedLinks = _getNnAndUqLinks(sortedLinks);
  sortedLinks = sortLinks(sortedLinks, doDescendingOrder);
  sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
    return getMainId(link.id);
  });

  const { ids, images } = await _getIdsAndImages(sortedLinks, null);

  // Need to update in one render, if not jumpy!
  //   - update links
  //   - update showingLinkIds, hasMore, images, and scrollTop or not
  //   - clear payload in fetched
  dispatch({
    type: UPDATE_FETCHED,
    payload: {
      lnOrQt: payload.lnOrQt, links: lksPerLn,
      ids, hasMore: payload.hasMore, images, doChangeListCount,
      doClearSelectedLinkIds: true,
    },
  });
  addFetchedToVars(payload.lnOrQt, payload.links, vars);
};

export const fetchMore = (doForCompare = false) => async (dispatch, getState) => {
  const links = getState().links;
  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const fetchingInfos = getState().display.fetchingInfos;
  const showingLinkIds = getState().display.showingLinkIds;
  const doForceLock = getState().display.doForceLock;
  const cachedFetchedMore = getState().fetchedMore;
  const pendingPins = getState().pendingPins;
  const pendingTags = getState().pendingTags;
  const lockedLists = getState().lockSettings.lockedLists;

  const doDescendingOrder = getState().settings.doDescendingOrder;

  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
  const pinFPaths = getPinFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  if (!Array.isArray(showingLinkIds)) {
    console.log('In fetchMore, showingLinkIds is not an array!');
    return;
  }

  const lnOrQt = queryString ? queryString : listName;
  if (
    doesIncludeFetchingMore(lnOrQt, doForCompare, fetchingInfos) ||
    lnOrQt in cachedFetchedMore
  ) {
    return;
  }

  const fthId = `${Date.now()}${randomString(4)}`;
  dispatch(addFetchingInfo({ type: FETCH_MORE, doForCompare, lnOrQt, fthId }));

  let isStale = false;
  if (!doForCompare && !queryString) {
    isStale = !vars.fetch.fetchedLnOrQts.includes(listName);
  }

  const safLinkIds = []; // Showing and fetched link ids.
  const showingLinks = showingLinkIds.map(linkId => getLink(linkId, links));
  for (const link of showingLinks) {
    if (!isObject(link)) continue;
    // In fetchedLinkIds but might not in links
    //   e.g. delete by UPDATE_FETCHED or UPDATE_FETCHED_MORE.
    // Though, here should be fine as link is from links.
    if (vars.fetch.fetchedLinkIds.includes(link.id)) safLinkIds.push(link.id);
  }

  const bin = {
    fetchedLinkFPaths: [], unfetchedLinkFPaths: [], hasMore: false, hasDisorder: false,
  };
  if (doForCompare) {
    if (queryString) {
      // Impossible case, just return.
      addFetchedToVars(lnOrQt, null, vars);
      dispatch(deleteFetchingInfo(fthId));
      return;
    } else {
      const _result = getNLinkFPaths({
        linkFPaths, links, listName, doDescendingOrder, pinFPaths, pendingPins,
        excludingIds: safLinkIds,
      });
      if (_result.fpaths.length === 0) {
        addFetchedToVars(lnOrQt, null, vars);
        dispatch(deleteFetchingInfo(fthId));
        return;
      }
    }
  } else {
    let fpaths, fpathsWithPcEc;
    if (queryString) {
      if (isStale) {
        // Impossible case, just return.
        dispatch(deleteFetchingInfo(fthId));
        return;
      }

      const _result = getNLinkFPathsByQt({
        linkFPaths, links, doDescendingOrder, pinFPaths, pendingPins, tagFPaths,
        pendingTags, doForceLock, lockedLists, queryString, excludingIds: safLinkIds,
      });
      [fpaths, fpathsWithPcEc] = [_result.fpaths, _result.fpathsWithPcEc];
      [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
    } else {
      if (isStale) {
        const { hasMore, hasDisorder, objsWithPcEc } = getNLinkObjs({
          links, listName, doDescendingOrder, pinFPaths, pendingPins,
          excludingIds: showingLinkIds,
        });
        if (hasDisorder) {
          console.log('No cache for now. Maybe fast enough to not jumpy.');
        }
        const { ids, images } = await _getIdsAndImages(objsWithPcEc, links);
        dispatch({ type: SET_SHOWING_LINK_IDS, payload: { ids, hasMore, images } });
        dispatch(deleteFetchingInfo(fthId));
        return;
      }

      const _result = getNLinkFPaths({
        linkFPaths, links, listName, doDescendingOrder, pinFPaths, pendingPins,
        excludingIds: safLinkIds,
      });
      [fpaths, fpathsWithPcEc] = [_result.fpaths, _result.fpathsWithPcEc];
      [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
    }
    for (const linkFPath of fpaths) {
      const etRs = extractLinkFPath(linkFPath);
      if (isFetchedLinkId(vars.fetch.fetchedLinkIds, links, etRs.listName, etRs.id)) {
        bin.fetchedLinkFPaths.push(linkFPath);
      } else {
        bin.unfetchedLinkFPaths.push(linkFPath);
      }
    }
    if (bin.unfetchedLinkFPaths.length === 0) {
      if (bin.hasDisorder) {
        console.log('No cache for now. Maybe fast enough to not jumpy.');
      }
      const { ids, images } = await _getIdsAndImages(fpathsWithPcEc, links);
      dispatch({
        type: SET_SHOWING_LINK_IDS, payload: { ids, hasMore: bin.hasMore, images },
      });
      dispatch(deleteFetchingInfo(fthId));
      return;
    }
  }

  const payload = { doForCompare, listName, queryString, lnOrQt, fthId, safLinkIds };
  dispatch({
    type: FETCH_MORE,
    payload,
    meta: {
      offline: {
        effect: { method: FETCH_MORE, params: { ...payload, getState } },
        commit: { type: FETCH_MORE_COMMIT },
        rollback: { type: FETCH_MORE_ROLLBACK, meta: payload },
      },
    },
  });
};

const _getLinksForCompareAction = (getState, payload) => {
  const showingLinkIds = getState().display.showingLinkIds;
  const pendingPins = getState().pendingPins;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const pinFPaths = getPinFPaths(getState());

  // Only showing status links, not processing fpath links, to listName map.
  const ossLinks = [], npfLinks = [], toLnMap = {};
  if (Array.isArray(showingLinkIds)) {
    const showingLnAndLks = showingLinkIds.map(linkId => {
      return getListNameAndLink(linkId, getState().links);
    });
    for (const { listName, link } of showingLnAndLks) {
      if (!isString(listName) || !isObject(link)) continue;

      if (SHOWING_STATUSES.includes(link.status)) ossLinks.push(link);
      if (link.status === ADDED) npfLinks.push(link);
      toLnMap[link.id] = listName;
    }
  }

  const { fetchedLinkFPaths, unfetchedLinkFPaths } = payload;
  const updatingLinkFPaths = [...fetchedLinkFPaths, ...unfetchedLinkFPaths];
  const updatingLnAndLks = _poolListNameAndLinks(
    updatingLinkFPaths, payload.links, getState().links
  );

  let updatingLinks = [];
  for (const { listName, link } of updatingLnAndLks) {
    if (!isString(listName) || !isObject(link)) continue;
    updatingLinks.push(link);
    toLnMap[link.id] = listName;
  }
  for (const link of npfLinks) {
    // In fetchedLinkIds but might not in links
    //   e.g. delete by UPDATE_FETCHED or UPDATE_FETCHED_MORE.
    // Though, here should be fine as npfLinks are from links.
    if (vars.fetch.fetchedLinkIds.includes(link.id)) {
      updatingLinks.push(link);
    }
  }
  updatingLinks = _getNnAndUqLinks(updatingLinks);
  updatingLinks = sortLinks(updatingLinks, doDescendingOrder);
  updatingLinks = sortWithPins(updatingLinks, pinFPaths, pendingPins, (link) => {
    return getMainId(link.id);
  });

  return { ossLinks, npfLinks, updatingLinks, toLnMap };
};

const _getForCompareAction = (
  ossLinks, npfLinks, updatingLinks, updatingHasMore,
) => {
  /*
    updateAction
    0. justUpdate: no links showing, can just update
    1. noNew: exactly the same, nothing new, update only hasMore
    2. limitedSame: partially the same, first N links are the same
    3. haveNew: not the same for sure, something new, update if not scroll or popup
         else show fetchedPopup
  */
  if (ossLinks.length === 0) return 0;

  if (npfLinks.length < updatingLinks.length) return 3;
  if (npfLinks.length > updatingLinks.length && !updatingHasMore) return 3;

  for (let i = 0; i < updatingLinks.length; i++) {
    const [npfLink, updatingLink] = [npfLinks[i], updatingLinks[i]];
    if (
      npfLink.id !== updatingLink.id ||
      !isEqual(npfLink.extractedResult, updatingLink.extractedResult) ||
      !isEqual(npfLink.custom, updatingLink.custom) ||
      npfLink.doIgnoreExtrdRst
    ) {
      return 3;
    }
  }

  if (npfLinks.length > updatingLinks.length) return 2;
  return 1;
};

const _getFpsAndLksPerLn = (links, toLnMap) => {
  const fpaths = [], lksPerLn = {};
  for (const link of links) {
    const listName = toLnMap[link.id];
    const fpath = createLinkFPath(listName, link.id);
    fpaths.push(fpath);

    if (!isObject(lksPerLn[listName])) lksPerLn[listName] = {};
    lksPerLn[listName][link.id] = link;
  }
  return { fpaths, lksPerLn };
};

export const tryUpdateFetchedMore = (payload) => async (dispatch, getState) => {
  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const fetchingInfos = getState().display.fetchingInfos;
  const showingLinkIds = getState().display.showingLinkIds;

  // If interrupted e.g. by refreshFetched,
  //   don't updateFetchedMore so don't override any variables.
  if (
    isFetchingInterrupted(payload.fthId, fetchingInfos) ||
    !Array.isArray(showingLinkIds)
  ) {
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  const lnOrQt = queryString ? queryString : listName;
  if (payload.lnOrQt !== lnOrQt) {
    dispatch(updateFetchedMore(payload, true));
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  if (payload.doForCompare) {
    const {
      ossLinks, npfLinks, updatingLinks, toLnMap,
    } = _getLinksForCompareAction(getState, payload);

    const updateAction = _getForCompareAction(
      ossLinks, npfLinks, updatingLinks, payload.hasMore
    );
    if (updateAction === 0) {
      // Empty e.g., user deletes all showing links
      dispatch(updateFetchedMore(payload));
      dispatch(deleteFetchingInfo(payload.fthId));
      return;
    }

    if (updateAction === 1) {
      dispatch({
        type: UPDATE_FETCHED_MORE,
        payload: {
          lnOrQt: payload.lnOrQt, keepIds: showingLinkIds, hasMore: payload.hasMore,
        },
      });
      addFetchedToVars(payload.lnOrQt, payload.links, vars);
      dispatch(deleteFetchingInfo(payload.fthId));
      return;
    }

    if (updateAction === 2) {
      addFetchedToVars(null, payload.links, vars);
      dispatch(deleteFetchingInfo(payload.fthId));
      dispatch(fetchMore(true));
      return;
    }

    const { fpaths, lksPerLn } = _getFpsAndLksPerLn(updatingLinks, toLnMap);
    dispatch({
      type: CACHE_FETCHED,
      payload: {
        lnOrQt: payload.lnOrQt,
        fetchedLinkFPaths: [],
        unfetchedLinkFPaths: fpaths,
        hasMore: payload.hasMore,
        links: lksPerLn,
      },
    });
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  if (!payload.hasDisorder) {
    dispatch(updateFetchedMore(payload));
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const scrollHeight = vars.scrollPanel.contentHeight;
    const windowHeight = vars.scrollPanel.layoutHeight;
    const windowBottom = windowHeight + vars.scrollPanel.scrollY;

    if (windowBottom > (scrollHeight * 0.96) && !isPopupShown(getState())) {
      dispatch(updateFetchedMore(payload));
      dispatch(deleteFetchingInfo(payload.fthId));
      return;
    }
  }

  dispatch({ type: CACHE_FETCHED_MORE, payload });
  dispatch(deleteFetchingInfo(payload.fthId));
};

export const updateFetchedMore = (
  payload, noDisplay = false
) => async (dispatch, getState) => {

  if (!payload) {
    const listName = getState().display.listName;
    const queryString = getState().display.queryString;
    const lnOrQt = queryString ? queryString : listName;

    const fetchedMore = getState().fetchedMore[lnOrQt];
    if (fetchedMore) ({ payload } = fetchedMore);
  }
  if (!payload) return;

  const links = getState().links;
  const showingLinkIds = getState().display.showingLinkIds;
  const pendingPins = getState().pendingPins;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pinFPaths = getPinFPaths(getState());

  if (!Array.isArray(showingLinkIds)) {
    // Need to dispatch UPDATE_FETCHED_MORE to make sure clear fetchedMoreReducer.
    dispatch({
      type: UPDATE_FETCHED_MORE, payload: { lnOrQt: payload.lnOrQt },
    });
    return;
  }

  if (noDisplay) {
    dispatch({
      type: UPDATE_FETCHED_MORE,
      payload: { lnOrQt: payload.lnOrQt, links: payload.links },
    });
    addFetchedToVars(payload.lnOrQt, payload.links, vars);
    return;
  }

  const processingLinks = [];
  if (isObject(links[payload.lnOrQt])) {
    for (const link of Object.values(links[payload.lnOrQt])) {
      if (link.status === ADDED) continue;
      processingLinks.push(link);
    }
  }

  let fsgLinks = showingLinkIds.map(linkId => getLink(linkId, links));
  fsgLinks = fsgLinks.filter(link => isObject(link));

  const { fetchedLinkFPaths, unfetchedLinkFPaths } = payload;
  const updatingLinkFPaths = [...fetchedLinkFPaths, ...unfetchedLinkFPaths];

  let updatingLinks = _poolLinks(updatingLinkFPaths, payload.links, links);
  updatingLinks = updatingLinks.filter(link => isObject(link));

  let sortedLinks = [...processingLinks, ...updatingLinks, ...fsgLinks];
  sortedLinks = _getNnAndUqLinks(sortedLinks);
  sortedLinks = sortLinks(sortedLinks, doDescendingOrder);
  sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
    return getMainId(link.id);
  });

  const { ids, images } = await _getIdsAndImages(sortedLinks, null);

  // Need to update in one render, if not jumpy!
  //   - update links
  //   - update showingLinkIds, hasMore, images
  //   - clear payload in fetchedMore
  dispatch({
    type: UPDATE_FETCHED_MORE,
    payload: {
      lnOrQt: payload.lnOrQt, links: payload.links,
      ids, hasMore: payload.hasMore, images,
    },
  });
  addFetchedToVars(payload.lnOrQt, payload.links, vars);
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

const sortShowingLinkIds = async (dispatch, getState) => {
  const links = getState().links;
  const showingLinkIds = getState().display.showingLinkIds;
  const pendingPins = getState().pendingPins;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pinFPaths = getPinFPaths(getState());

  if (!Array.isArray(showingLinkIds)) return;

  let sortedLinks = showingLinkIds.map(linkId => getLink(linkId, links));
  sortedLinks = _getNnAndUqLinks(sortedLinks);
  sortedLinks = sortLinks(sortedLinks, doDescendingOrder);
  sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
    return getMainId(link.id);
  });

  const ids = sortedLinks.map(link => link.id);
  dispatch({ type: SET_SHOWING_LINK_IDS, payload: { ids } });
};

const addFetchingInfo = (payload) => {
  return { type: ADD_FETCHING_INFO, payload };
};

const deleteFetchingInfo = (fthId) => {
  return { type: DELETE_FETCHING_INFO, payload: fthId };
};

const _getAddLinkInsertIndex = (getState) => {
  const showingLinkIds = getState().display.showingLinkIds;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  if (!Array.isArray(showingLinkIds)) return null;
  if (!doDescendingOrder) return showingLinkIds.length;

  const pinFPaths = getPinFPaths(getState());
  const pendingPins = getState().pendingPins;

  const pins = getPins(pinFPaths, pendingPins, true);

  for (let i = 0; i < showingLinkIds.length; i++) {
    const linkMainId = getMainId(showingLinkIds[i]);
    if (linkMainId in pins) continue;
    return i;
  }

  return showingLinkIds.length;
};

export const addLink = (url, listName, doExtractContents) => async (
  dispatch, getState
) => {
  if (!isString(listName)) listName = getState().display.listName;
  if (listName === TRASH) listName = MY_LIST;

  const queryString = getState().display.queryString;
  if (queryString) listName = MY_LIST;

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

  let insertIndex;
  if (!queryString && listName === getState().display.listName) {
    insertIndex = _getAddLinkInsertIndex(getState);
  }

  const payload = { listNames: [listName], links: [link], insertIndex };

  // If doExtractContents is false but from settings is true, send pre-extract to server
  if (doExtractContents === false && getState().settings.doExtractContents === true) {
    axios.post(BRACE_PRE_EXTRACT_URL, { urls: [url] })
      .then(() => { })
      .catch((error) => {
        console.log('Error when contact Brace server to pre-extract contents with url: ', url, ' Error: ', error);
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
  addFetchedToVars(null, [link], vars);
};

export const moveLinks = (toListName, ids) => async (dispatch, getState) => {
  if (ids.length === 0) return;

  const links = getState().links;
  let updatedDT = Date.now();

  const toListNames = [], toLinks = [];
  for (const id of ids) {
    const { listName, link } = getListNameAndLink(id, links);
    if (!isString(listName) || !isObject(link)) {
      console.log('In moveLinks, no found list name or link for id:', id);
      continue;
    }

    const [fromListName, fromLink] = [listName, newObject(link, LOCAL_LINK_ATTRS)];
    if (fromListName === toListName) {
      console.log('In moveLinks, same fromListName and toListName:', fromListName);
      continue;
    }

    const toId = `${getMainId(fromLink.id)}-${randomString(4)}-${updatedDT}`;
    const toLink = { ...fromLink, id: toId, fromListName, fromId: fromLink.id };
    updatedDT += 1;

    toListNames.push(toListName);
    toLinks.push(toLink);
  }

  const payload = { listNames: toListNames, links: toLinks, manuallyManageError: true };
  dispatch({
    type: MOVE_LINKS_ADD_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: ADD_LINKS, params: payload },
        commit: { type: MOVE_LINKS_ADD_STEP_COMMIT, meta: payload },
        rollback: { type: MOVE_LINKS_ADD_STEP_ROLLBACK, meta: payload },
      },
    },
  });
  addFetchedToVars(null, toLinks, vars);
};

export const moveLinksDeleteStep = (toListNames, toIds) => async (
  dispatch, getState
) => {
  if (toIds.length === 0) return; // can happen if all are errorIds.

  const links = getState().links;

  const listNames = [], ids = [];
  for (let i = 0; i < toListNames.length; i++) {
    const [toListName, toId] = [toListNames[i], toIds[i]];
    if (!isObject(links[toListName]) || !isObject(links[toListName][toId])) continue;

    const { fromListName, fromId } = links[toListName][toId];
    listNames.push(fromListName);
    ids.push(fromId);
  }

  const payload = {
    listNames, ids, manuallyManageError: true, prevFPathsPerId: {}, toListNames, toIds,
  };
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
  if (ids.length === 0) return;

  const links = getState().links;
  const allLinkFPaths = getLinkFPaths(getState());

  const dListNames = [], dIds = [];
  for (const id of ids) {
    const { listName, link } = getListNameAndLink(id, links);
    if (!isString(listName) || !isObject(link)) {
      console.log('In deleteLinks, no found list name or link for id:', id);
      continue;
    }

    dListNames.push(listName);
    dIds.push(id);
  }

  const prevFPathsPerId = getLinkPrevFPathsPerId(dIds, allLinkFPaths);
  const payload = {
    listNames: dListNames, ids: dIds, manuallyManageError: true, prevFPathsPerId,
  };
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
  const links = getState().links;

  for (const id of ids) {
    // DIED_ADDING -> try add this link again
    // DIED_MOVING -> try move this link again
    // DIED_REMOVING -> try delete this link again
    // DIED_DELETING  -> try delete this link again
    // DIED_UPDAING -> try update this link again
    const { listName, link } = getListNameAndLink(id, links);
    if (!isString(listName) || !isObject(link)) {
      console.log('In retryDiedLinks, no found listName or link for id:', id);
      continue;
    }

    const { status } = link;
    if (status === DIED_ADDING) {
      const ridLink = newObject(link, LOCAL_LINK_ATTRS);

      const payload = { listNames: [listName], links: [ridLink] };
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
      const payload = {
        listNames: [listName], links: [link], manuallyManageError: true,
      };
      dispatch({
        type: MOVE_LINKS_ADD_STEP,
        payload,
        meta: {
          offline: {
            effect: { method: ADD_LINKS, params: payload },
            commit: { type: MOVE_LINKS_ADD_STEP_COMMIT, meta: payload },
            rollback: { type: MOVE_LINKS_ADD_STEP_ROLLBACK, meta: payload },
          },
        },
      });
    } else if (status === DIED_REMOVING) {
      dispatch(deleteLinks([id]));
    } else if (status === DIED_DELETING) {
      dispatch(deleteLinks([id]));
    } else if (status === DIED_UPDATING) {
      const payload = { listName, fromLink: link.fromLink, toLink: link };
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

export const cancelDiedLinks = (canceledIds) => async (dispatch, getState) => {
  const links = getState().links;

  const listNames = [], ids = [], statuses = [], fromIds = [];
  for (const id of canceledIds) {
    const { listName, link } = getListNameAndLink(id, links);
    if (!isString(listName) || !isObject(link)) {
      console.log('In cancelDiedLinks, no found listName or link for id:', id);
      continue;
    }

    const { status, fromId, fromLink } = link;
    listNames.push(listName);
    ids.push(id);
    statuses.push(status);
    fromIds.push(isString(fromId) ? fromId : isObject(fromLink) ? fromLink.id : null);
  }

  const payload = { listNames, ids, statuses, fromIds };
  dispatch({ type: CANCEL_DIED_LINKS, payload });
};

const getToExtractLinks = (getState, listNames, ids) => {
  const links = getState().links;
  const [isLnsArray, isIdsArray] = [Array.isArray(listNames), Array.isArray(ids)];

  const toListNames = [], toLinks = [];
  if (isLnsArray && isIdsArray) {
    for (let i = 0; i < listNames.length; i++) {
      const [listName, id] = [listNames[i], ids[i]];

      if (listName === TRASH) continue;
      if (!isObject(links[listName]) || !isObject(links[listName][id])) continue;

      const link = links[listName][id];
      if (link.status !== ADDED) continue;
      if (isObject(link.custom)) continue;
      if (
        isObject(link.extractedResult) && link.extractedResult.status !== EXTRACT_INIT
      ) continue;
      if (validateUrl(link.url) !== VALID_URL) continue;

      const [toListName, toLink] = [listName, newObject(link, LOCAL_LINK_ATTRS)];
      toListNames.push(toListName);
      toLinks.push(toLink);
      if (toLinks.length >= N_LINKS) break;
    }

    return { toListNames, toLinks };
  }

  const listName = getState().display.listName;
  if (listName === TRASH || !isObject(links[listName])) {
    return { toListNames, toLinks };
  }

  const sortedLinks = Object.values(links[listName]).sort((a, b) => {
    return b.addedDT - a.addedDT;
  });
  for (const link of sortedLinks) {
    if (link.status !== ADDED) continue;
    if (isObject(link.custom)) continue;
    if (
      isObject(link.extractedResult) && link.extractedResult.status !== EXTRACT_INIT
    ) continue;
    if (validateUrl(link.url) !== VALID_URL) continue;

    const [toListName, toLink] = [listName, newObject(link, LOCAL_LINK_ATTRS)];
    toListNames.push(toListName);
    toLinks.push(toLink);
    if (toLinks.length >= N_LINKS) break;
  }

  return { toListNames, toLinks };
};

export const extractContents = (listNames, ids) => async (dispatch, getState) => {

  const doExtractContents = getState().settings.doExtractContents;
  if (!doExtractContents) {
    dispatch(runAfterFetchTask());
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (isBulkEditing) return; // likely busy so no after tasks

  const { toListNames, toLinks } = getToExtractLinks(getState, listNames, ids);
  if (toLinks.length === 0) {
    dispatch(runAfterFetchTask());
    return;
  }

  const selectingLinkId = getState().display.selectingLinkId;
  const found = toLinks.some(link => link.id === selectingLinkId);
  if (found && isPopupShown(getState())) return; // likely busy so no after tasks

  const payload = { toListNames, toLinks };
  dispatch({
    type: EXTRACT_CONTENTS,
    payload,
    meta: {
      offline: {
        effect: { method: EXTRACT_CONTENTS, params: payload },
        commit: { type: EXTRACT_CONTENTS_COMMIT },
        rollback: { type: EXTRACT_CONTENTS_ROLLBACK, meta: payload },
      },
    },
  });
};

export const tryUpdateExtractedContents = (payload) => async (dispatch, getState) => {
  const isBulkEditing = getState().display.isBulkEditing;
  const scrollY = vars.scrollPanel.scrollY;
  const canRerender = !isBulkEditing && scrollY === 0 && !isPopupShown(getState());

  dispatch({
    type: UPDATE_EXTRACTED_CONTENTS, payload: { ...payload, canRerender },
  });
  addFetchedToVars(null, payload.successLinks, vars);
};

export const extractContentsDeleteStep = (successListNames, successLinks) => async (
  dispatch, getState
) => {
  const fpaths = [];
  for (let i = 0; i < successListNames.length; i++) {
    const [listName, link] = [successListNames[i], successLinks[i]];
    fpaths.push(createLinkFPath(listName, link.fromId));
  }

  try {
    await dataApi.deleteFiles(fpaths);
  } catch (error) {
    console.log('extractContents clean up error: ', error);
    // error in this step should be fine
  }

  dispatch(runAfterFetchTask());
};

export const runAfterFetchTask = () => async (dispatch, getState) => {
  dispatch(randomHouseworkTasks());
};

export const randomHouseworkTasks = () => async (dispatch, getState) => {
  const now = Date.now();
  if (now - vars.randomHouseworkTasks.dt < 24 * 60 * 60 * 1000) return;

  const rand = Math.random();
  if (rand < 0.25) dispatch(deleteOldLinksInTrash());
  else if (rand < 0.50) dispatch(checkPurchases());
  else if (rand < 0.75) dispatch(cleanUpLinks());
  else dispatch(cleanUpStaticFiles());

  vars.randomHouseworkTasks.dt = now;
};

export const deleteOldLinksInTrash = () => async (dispatch, getState) => {
  const doDeleteOldLinksInTrash = getState().settings.doDeleteOldLinksInTrash;
  if (!doDeleteOldLinksInTrash) return;

  const listName = TRASH;
  if (getState().display.listName === listName) return;

  const allLinkFPaths = getLinkFPaths(getState());
  const linkFPaths = getLastLinkFPaths(allLinkFPaths);

  const trashLinkFPaths = linkFPaths[listName] || [];

  const listNames = [], ids = [];
  for (const fpath of trashLinkFPaths) {
    const { id } = extractLinkFPath(fpath);
    const { updatedDT } = extractLinkId(id);
    const interval = Date.now() - Number(updatedDT);
    const days = interval / 1000 / 60 / 60 / 24;

    if (days <= N_DAYS) continue;

    listNames.push(listName);
    ids.push(id);
    if (ids.length >= N_LINKS) break;
  }

  if (ids.length === 0) return;

  const prevFPathsPerId = getLinkPrevFPathsPerId(ids, allLinkFPaths);
  const payload = {
    listNames, ids, manuallyManageError: true, prevFPathsPerId,
  };
  dispatch({
    type: DELETE_OLD_LINKS_IN_TRASH,
    payload,
    meta: {
      offline: {
        effect: { method: DELETE_LINKS, params: payload },
        commit: { type: DELETE_OLD_LINKS_IN_TRASH_COMMIT },
        rollback: { type: DELETE_OLD_LINKS_IN_TRASH_ROLLBACK, meta: payload },
      },
    },
  });
};

export const cleanUpLinks = () => async (dispatch, getState) => {
  const allLinkFPaths = getLinkFPaths(getState());
  const linkFPaths = getLastLinkFPaths(allLinkFPaths);

  const lastFPaths = [];
  for (const listName in linkFPaths) {
    for (const fpath of linkFPaths[listName]) lastFPaths.push(fpath);
  }

  let unusedFPaths = [];
  for (const listName in allLinkFPaths) {
    for (const fpath of allLinkFPaths[listName]) {
      if (!lastFPaths.includes(fpath)) unusedFPaths.push(fpath);
    }
  }
  unusedFPaths = unusedFPaths.slice(0, N_LINKS);

  if (unusedFPaths.length === 0) return;

  try {
    await dataApi.deleteFiles(unusedFPaths);
  } catch (error) {
    console.log('cleanUpLinks error: ', error);
    // error in this step should be fine
  }
};

const _cleanUpStaticFiles = async (getState) => {
  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
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
    await dataApi.deleteFiles(unusedFPaths);
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

      const tagNameEditors = getState().tagNameEditors;
      const tagNameMap = getState().settings.tagNameMap;
      const editingTNEs = getEditingTagNameEditors(tagNameEditors, tagNameMap);
      if (isObject(editingTNEs)) {
        for (const k in editingTNEs) {
          if (!isNumber(editingTNEs[k].blurCount)) editingTNEs[k].blurCount = 0;
          editingTNEs[k].blurCount += 1;
        }
        dispatch(updateTagNameEditors(editingTNEs));

        dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_TAG_NAME));
        dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
        return;
      }
    }
    dispatch(updateStgsAndInfo());
  }

  dispatch(updatePopup(SETTINGS_POPUP, isShown));

  if (isShown) {
    dispatch(updateFetched(null, false, false));
    dispatch(updateFetchedMore(null, false));
  }
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

export const checkDeleteListName = (listNameEditorKey, listNameObj) => async (
  dispatch, getState
) => {
  const listNames = [listNameObj.listName];
  listNames.push(...getAllListNames(listNameObj.children));

  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
  const inUseListNames = Object.keys(linkFPaths);

  const canDeletes = [];
  for (const listName of listNames) {
    canDeletes.push(!inUseListNames.includes(listName));
  }

  if (!canDeletes.every(canDelete => canDelete === true)) {
    dispatch(updateListNameEditors({
      [listNameEditorKey]: {
        msg: LIST_NAME_MSGS[IN_USE_LIST_NAME], isCheckingCanDelete: false,
      },
    }));
    return;
  }

  dispatch(updateSelectingListName(listNameObj.listName));
  dispatch(updateDeleteAction(DELETE_ACTION_LIST_NAME));
  dispatch(updatePopup(CONFIRM_DELETE_POPUP, true));
  dispatch(updateListNameEditors({
    [listNameEditorKey]: { msg: '', isCheckingCanDelete: false },
  }));
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
  return { type: UPDATE_SELECTING_LIST_NAME, payload: listName };
};

const updateSettings = async (dispatch, getState) => {
  // Can't check with snapshot here as the snapshot might not be the latest version
  //   if there are already other updating settings.
  const settings = getState().settings;
  const payload = { settings };

  dispatch({
    type: TRY_UPDATE_SETTINGS,
    payload,
    meta: {
      offline: {
        effect: { method: TRY_UPDATE_SETTINGS, params: { dispatch, getState } },
        commit: { type: TRY_UPDATE_SETTINGS_COMMIT },
        rollback: { type: TRY_UPDATE_SETTINGS_ROLLBACK },
      },
    },
  });
};

export const updateSettingsDeleteStep = (_settingsFPaths) => async (
  dispatch, getState
) => {
  if (_settingsFPaths.length === 0) return;
  try {
    await dataApi.putFiles(_settingsFPaths, _settingsFPaths.map(() => ({})));
    await cleanUpLocks(dispatch, getState);
  } catch (error) {
    console.log('updateSettings clean up error: ', error);
    // error in this step should be fine
  }
};

const updateInfo = async (dispatch, getState) => {
  // Can't check with snapshot here as the snapshot might not be the latest version
  //   if there are already other updating infos.
  dispatch({
    type: TRY_UPDATE_INFO,
    meta: {
      offline: {
        effect: { method: TRY_UPDATE_INFO, params: { dispatch, getState } },
        commit: { type: TRY_UPDATE_INFO_COMMIT },
        rollback: { type: TRY_UPDATE_INFO_ROLLBACK },
      },
    },
  });
};

export const updateInfoDeleteStep = (_infoFPath) => async (dispatch, getState) => {
  if (!isString(_infoFPath)) return;
  try {
    await dataApi.deleteFiles([_infoFPath]);
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

  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
  const tagFPaths = getTagFPaths(getState());

  const listNames = Object.keys(linkFPaths);
  const tagNames = getInUseTagNames(linkFPaths, tagFPaths);
  const doFetch = settings.doDescendingOrder !== snapshotSettings.doDescendingOrder;
  const payload = { listNames, tagNames, settings: snapshotSettings, doFetch };

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

  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
  const tagFPaths = getTagFPaths(getState());

  const listNames = Object.keys(linkFPaths);
  const tagNames = getInUseTagNames(linkFPaths, tagFPaths);
  const doFetch = settings.doDescendingOrder !== currentSettings.doDescendingOrder;
  const payload = {
    settingsFPath, listNames, tagNames, settings, doFetch, _settingsFPaths,
  };

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
    await dataApi.putFiles(_settingsFPaths, _settingsFPaths.map(() => ({})));
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

const _verifyPurchase = async (rawPurchase) => {
  if (!rawPurchase) return { status: INVALID };

  const source = PADDLE;

  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const userId = sigObj.publicKey;

  const productId = rawPurchase.productId;
  const token = rawPurchase.purchaseToken;
  const paddleUserId = rawPurchase.paddleUserId;
  const passthrough = rawPurchase.passthrough;

  if (!token) {
    console.log('No purchaseToken in rawPurchase');
    return { status: INVALID };
  }

  const reqBody = { source, userId, productId, token, paddleUserId, passthrough };

  let verifyResult;
  try {
    const res = await axios.post(IAP_VERIFY_URL, reqBody);
    verifyResult = res.data;
  } catch (error) {
    console.log(`Error when contact IAP server to verify with reqBody: ${JSON.stringify(reqBody)}, Error: `, error);
    return { status: UNKNOWN };
  }

  return verifyResult;
};

const verifyPurchase = async (rawPurchase) => {
  // Sometimes the servers doesn't return the latest result, so wait and try again.
  const nTries = 3;

  let result;
  for (let currentTry = 1; currentTry <= nTries; currentTry++) {
    result = await _verifyPurchase(rawPurchase);
    if (result.status === VALID) return result;
    if (currentTry < nTries) await sleep(sample([3000, 4500, 6000]));
  }
  return result;
};

const getIapStatus = async (doForce) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const randomId = await lsgApi.getItem(PADDLE_RANDOM_ID);
  const reqBody = {
    source: PADDLE,
    userId: sigObj.publicKey,
    signature: sigObj.signature,
    appId: COM_BRACEDOTTO,
    doForce: doForce,
    randomId: randomId,
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

  dispatch({ type: commitAction, payload: statusResult });
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
    // It's possible that a user completes the purchase,
    //   but iapUpdatedListener doesn't get called and the user just close the popup.
    // PS1. No need redundant in requestPurchase's catch block.
    // PS2. No await, do it in the background, in case really no purchase.
    checkRequestPurchase(dispatch, getState);
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
    registerIapListeners(true, dispatch, getState);

    let products = null;
    if (canMakePayments) {
      products = await iapApi.getSubscriptions([COM_BRACEDOTTO_SUPPORTER]);
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
    await iapApi.requestSubscription(product.productId);
  } catch (error) {
    console.log('Error when request purchase: ', error);
    if (error.code === 'E_USER_CANCELLED') {
      dispatch(updateIapPurchaseStatus(null, null));
    } else {
      dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
    }
  }
};

const checkRequestPurchase = async (dispatch, getState) => {
  const { purchases } = getState().info;
  const purchase = getValidPurchase(purchases);
  if (purchase) return;

  try {
    const res = await getIapStatus(false);
    const statusResult = res.data;

    if (statusResult.status === VALID) {
      const purchase = getValidPurchase(statusResult.purchases);
      if (purchase) {
        dispatch({
          type: REQUEST_PURCHASE_COMMIT,
          payload: { status: statusResult.status, purchase, rawPurchase: null },
        });
        return;
      }
    }
  } catch (error) {
    console.log('checkRequestPurchase error:', error);
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

  const payload = { pins };
  dispatch({
    type: PIN_LINK,
    payload,
    meta: {
      offline: {
        effect: { method: PIN_LINK, params: { ...payload, getState } },
        commit: { type: PIN_LINK_COMMIT, meta: payload },
        rollback: { type: PIN_LINK_ROLLBACK, meta: payload },
      },
    },
  });

  await sortShowingLinkIds(dispatch, getState);
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

  await sortShowingLinkIds(dispatch, getState);
};

export const movePinnedLink = (id, direction) => async (dispatch, getState) => {
  const links = getState().links;
  const showingLinkIds = getState().display.showingLinkIds;
  const pinFPaths = getPinFPaths(getState());
  const pendingPins = getState().pendingPins;

  if (!Array.isArray(showingLinkIds)) {
    console.log('In movePinnedLink, no showingLinkIds found for link id: ', id);
    return;
  }

  let ossLinks = showingLinkIds.map(linkId => getLink(linkId, links));
  ossLinks = ossLinks.filter(link => isObject(link));
  ossLinks = ossLinks.filter(link => SHOWING_STATUSES.includes(link.status));

  const [pinnedValues] = separatePinnedValues(
    ossLinks, pinFPaths, pendingPins, (link) => {
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

      if (pRank === ppRank) nextRank = ppLexoRank.toString();
      else nextRank = ppLexoRank.between(pLexoRank).toString();
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

      if (nRank === nnRank) nextRank = nLexoRank.toString();
      else nextRank = nLexoRank.between(nnLexoRank).toString();
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

  await sortShowingLinkIds(dispatch, getState);
};

export const cancelDiedPins = () => async (dispatch, getState) => {
  dispatch({ type: CANCEL_DIED_PINS });
  await sortShowingLinkIds(dispatch, getState);
};

export const cleanUpPins = () => async (dispatch, getState) => {
  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
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
  const id = getState().display.selectingLinkId;
  const updatedDT = Date.now();

  const { listName, link } = getListNameAndLink(id, links);
  if (!isString(listName) || !isObject(link)) {
    console.log('In updateCustomData, no found listName or link for id:', id);
    return;
  }

  const fromLink = newObject(link, LOCAL_LINK_ATTRS);

  const toLink = /** @type any */({});
  for (const attr in fromLink) {
    if (attr === 'custom') continue;
    toLink[attr] = fromLink[attr];
  }

  if (isString(title) && title.length > 0) {
    if (!('custom' in toLink)) toLink.custom = {};
    toLink.custom.title = title;
  }
  if (isString(image) && image.length > 0) {
    if (!('custom' in toLink)) toLink.custom = {};
    toLink.custom.image = image;
  }

  if (isEqual(fromLink, toLink)) return;

  toLink.id = `${getMainId(fromLink.id)}-${randomString(4)}-${updatedDT}`;
  toLink.fromLink = fromLink;

  const payload = { listName, fromLink, toLink };
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
  addFetchedToVars(null, [toLink], vars);
};

export const updateCustomDataDeleteStep = (
  listName, fromLink, toLink, serverUnusedFPaths, localUnusedFPaths
) => async (dispatch, getState) => {

  const fpaths = [...serverUnusedFPaths];
  if (fromLink.id !== toLink.id) fpaths.push(createLinkFPath(listName, fromLink.id));

  try {
    await dataApi.deleteFiles(fpaths);
    await fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('updateCustomData clean up error: ', error);
    // error in this step should be fine
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
  if (listNames.length === 0) return;

  dispatch({ type: CLEAN_UP_LOCKS, payload: { listNames } });
};

export const updateTagEditorPopup = (isShown, id, isAddTags) => async (
  dispatch, getState
) => {
  if (isShown) {
    if (isAddTags) {
      const purchases = getState().info.purchases;
      if (!doEnableExtraFeatures(purchases)) {
        dispatch(updatePaywallFeature(FEATURE_TAG));
        dispatch(updatePopup(PAYWALL_POPUP, true));
        return;
      }
    }

    dispatch(updateSelectingLinkId(id));
  }

  dispatch(updatePopup(TAG_EDITOR_POPUP, isShown));
};

export const updateTagEditor = (values, hints, displayName, color, msg) => {
  const payload = {};
  if (Array.isArray(values)) {
    payload.values = values;
    payload.didValuesEdit = true;
  }
  if (Array.isArray(hints)) {
    payload.hints = hints;
    payload.didHintsEdit = true;
  }

  if (isString(displayName)) payload.displayName = displayName;
  if (isString(color)) payload.color = color;

  if (isString(msg)) payload.msg = msg;
  else payload.msg = '';

  return { type: UPDATE_TAG_EDITOR, payload };
};

export const addTagEditorTagName = (values, hints, displayName, color) => async (
  dispatch, getState
) => {

  displayName = displayName.trim();

  const result = validateTagNameDisplayName(null, displayName, []);
  if (result !== VALID_TAG_NAME) {
    dispatch(updateTagEditor(null, null, null, null, TAG_NAME_MSGS[result]));
    return;
  }

  const found = values.some(value => value.displayName === displayName);
  if (found) {
    dispatch(
      updateTagEditor(null, null, null, null, TAG_NAME_MSGS[DUPLICATE_TAG_NAME])
    );
    return;
  }

  const tagNameMap = getState().settings.tagNameMap;
  const { tagNameObj } = getTagNameObjFromDisplayName(displayName, tagNameMap);

  let tagName;
  if (isObject(tagNameObj)) tagName = tagNameObj.tagName;
  if (!isString(tagName)) tagName = `${Date.now()}-${randomString(4)}`;

  const newValues = [...values, { tagName, displayName, color }];
  const newHints = hints.map(hint => {
    if (hint.tagName !== tagName) return hint;
    return { ...hint, isBlur: true };
  });

  dispatch(updateTagEditor(newValues, newHints, '', null, ''));
};

export const updateTagDataSStep = (id, values) => async (dispatch, getState) => {
  if (!isString(id)) {
    console.log('In updateTagDataSStep, invalid id: ', id);
    return;
  }

  const tagNameMap = getState().settings.tagNameMap;
  const ssTagNameMap = getState().snapshot.settings.tagNameMap;

  const newTagNameObjs = [];
  for (const value of values) {
    const { tagNameObj } = getTagNameObj(value.tagName, tagNameMap);
    const { tagNameObj: ssTagNameObj } = getTagNameObj(value.tagName, ssTagNameMap);

    if (isObject(tagNameObj) && isObject(ssTagNameObj)) continue;
    newTagNameObjs.push(value);
  }

  if (newTagNameObjs.length === 0) {
    const tagFPaths = getTagFPaths(getState());
    const solvedTags = getTags(tagFPaths, {});
    const mainId = getMainId(id);

    const aTns = [], bTns = [];
    if (isObject(solvedTags[mainId])) {
      for (const value of solvedTags[mainId].values) aTns.push(value.tagName);
    }
    for (const value of values) bTns.push(value.tagName);

    if (isArrayEqual(aTns, bTns)) return;
  }

  const payload = { id, values, newTagNameObjs };
  dispatch({
    type: UPDATE_TAG_DATA_S_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: UPDATE_TAG_DATA_S_STEP, params: { ...payload, getState } },
        commit: { type: UPDATE_TAG_DATA_S_STEP_COMMIT, meta: payload },
        rollback: { type: UPDATE_TAG_DATA_S_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const updateTagDataTStep = (id, values) => async (dispatch, getState) => {
  const payload = { id, values };
  dispatch({
    type: UPDATE_TAG_DATA_T_STEP,
    payload,
    meta: {
      offline: {
        effect: { method: UPDATE_TAG_DATA_T_STEP, params: { ...payload, getState } },
        commit: { type: UPDATE_TAG_DATA_T_STEP_COMMIT },
        rollback: { type: UPDATE_TAG_DATA_T_STEP_ROLLBACK, meta: payload },
      },
    },
  });
};

export const retryDiedTags = () => async (dispatch, getState) => {
  const pendingTags = getState().pendingTags;
  for (const id in pendingTags) {
    const { status, values } = pendingTags[id];
    if (status === UPDATE_TAG_DATA_S_STEP_ROLLBACK) {
      await updateTagDataSStep(id, values)(dispatch, getState);
    } else if (status === UPDATE_TAG_DATA_T_STEP_ROLLBACK) {
      await updateTagDataTStep(id, values)(dispatch, getState);
    }
  }
};

export const cancelDiedTags = () => async (dispatch, getState) => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;
  const pendingTags = getState().pendingTags;

  const isTamEqual = isEqual(settings.tagNameMap, snapshotSettings.tagNameMap);

  const ids = [], newTagNames = [], usedTagNames = [], unusedTagNames = [];
  for (const id in pendingTags) {
    const { status, newTagNameObjs } = pendingTags[id];

    if ([
      UPDATE_TAG_DATA_S_STEP_ROLLBACK, UPDATE_TAG_DATA_T_STEP_ROLLBACK,
    ].includes(status)) {
      ids.push(id);
    }

    if (status === UPDATE_TAG_DATA_S_STEP_ROLLBACK) {
      for (const obj of newTagNameObjs) {
        if (!newTagNames.includes(obj.tagName)) newTagNames.push(obj.tagName);
      }
      continue;
    }
    for (const obj of newTagNameObjs) {
      if (!usedTagNames.includes(obj.tagName)) usedTagNames.push(obj.tagName);
    }
  }

  if (!isTamEqual && newTagNames.length > 0) {
    for (const obj of snapshotSettings.tagNameMap) {
      if (!usedTagNames.includes(obj.tagName)) usedTagNames.push(obj.tagName);
    }

    const tagFPaths = getTagFPaths(getState());
    for (const fpath of tagFPaths) {
      const { tagName } = extractTagFPath(fpath);
      if (!usedTagNames.includes(tagName)) usedTagNames.push(tagName);
    }

    for (const tagName of newTagNames) {
      if (usedTagNames.includes(tagName)) continue;
      unusedTagNames.push(tagName);
    }
  }

  dispatch({ type: CANCEL_DIED_TAGS, payload: { ids, unusedTagNames } });
};

export const cleanUpTags = () => async (dispatch, getState) => {
  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
  const tagFPaths = getTagFPaths(getState());

  const linkMainIds = getLinkMainIds(linkFPaths);
  const tags = getTags(tagFPaths, {});

  let unusedTagFPaths = [];
  for (const fpath of tagFPaths) {
    const { tagName, rank, updatedDT, addedDT, id } = extractTagFPath(fpath);
    const tagMainId = getMainId(id);

    if (
      !isString(tagMainId) ||
      !linkMainIds.includes(tagMainId) ||
      !isObject(tags[tagMainId])
    ) {
      unusedTagFPaths.push(fpath);
      continue;
    }

    const found = tags[tagMainId].values.some(value => {
      return (
        value.tagName === tagName &&
        value.rank === rank &&
        value.updatedDT === updatedDT &&
        value.addedDT === addedDT &&
        value.id === id
      );
    });
    if (!found) unusedTagFPaths.push(fpath);
  }
  unusedTagFPaths = unusedTagFPaths.slice(0, N_LINKS);

  if (unusedTagFPaths.length > 0) {
    // Don't need offline, if no network or get killed, can do it later.
    try {
      await dataApi.deleteTags({ tagFPaths: unusedTagFPaths });
    } catch (error) {
      console.log('cleanUpTags error: ', error);
      // error in this step should be fine
    }
  }
};

export const updateTagNameEditors = (tagNameEditors) => {
  return { type: UPDATE_TAG_NAME_EDITORS, payload: tagNameEditors };
};

export const addTagNames = (newNames, newColors) => {
  let addedDT = Date.now();

  const tagNameObjs = [];
  for (let i = 0; i < newNames.length; i++) {
    const [newName, newColor] = [newNames[i], newColors[i]];

    const tagName = `${addedDT}-${randomString(4)}`;
    const tagNameObj = { tagName, displayName: newName, color: newColor };
    tagNameObjs.push(tagNameObj);

    addedDT += 1;
  }

  return { type: ADD_TAG_NAMES, payload: tagNameObjs };
};

export const updateTagNames = (tagNames, newNames) => {
  return { type: UPDATE_TAG_NAMES, payload: { tagNames, newNames } };
};

export const moveTagName = (tagName, direction) => {
  return { type: MOVE_TAG_NAME, payload: { tagName, direction } };
};

export const updateTagNameColor = (tagName, newColor) => {

};

export const checkDeleteTagName = (tagNameEditorKey, tagNameObj) => async (
  dispatch, getState
) => {
  const linkFPaths = getLastLinkFPaths(getLinkFPaths(getState()));
  const tagFPaths = getTagFPaths(getState());
  const inUseTagNames = getInUseTagNames(linkFPaths, tagFPaths);

  if (inUseTagNames.includes(tagNameObj.tagName)) {
    dispatch(updateTagNameEditors({
      [tagNameEditorKey]: {
        msg: TAG_NAME_MSGS[IN_USE_TAG_NAME], isCheckingCanDelete: false,
      },
    }));
    return;
  }

  dispatch(updateSelectingTagName(tagNameObj.tagName));
  dispatch(updateDeleteAction(DELETE_ACTION_TAG_NAME));
  dispatch(updatePopup(CONFIRM_DELETE_POPUP, true));
  dispatch(updateTagNameEditors({
    [tagNameEditorKey]: { msg: '', isCheckingCanDelete: false },
  }));
};

export const deleteTagNames = (tagNames) => {
  return { type: DELETE_TAG_NAMES, payload: { tagNames } };
};

export const updateSelectingTagName = (tagName) => {
  return { type: UPDATE_SELECTING_TAG_NAME, payload: tagName };
};


export const showSWWUPopup = () => async (dispatch, getState) => {
  dispatch(updatePopup(SWWU_POPUP, true));
};
