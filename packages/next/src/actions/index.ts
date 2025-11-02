import {
  RESET_STATE as OFFLINE_RESET_STATE,
} from '@redux-offline/redux-offline/lib/constants';
import PQueue from 'p-queue';

import userSession from '../userSession';
import cacheApi from '../apis/localCache';
import fileApi from '../apis/localFile';
import lsgApi from '../apis/localSg';
import { updateStgsAndInfo } from '../importWrapper';
import {
  INIT, UPDATE_USER, UPDATE_HREF, UPDATE_WINDOW, UPDATE_STACKS_ACCESS,
  INCREASE_REDIRECT_TO_MAIN_COUNT, UPDATE_SEARCH_STRING, UPDATE_POPUP,
  UPDATE_BULK_EDITING, ADD_SELECTED_LINK_IDS, DELETE_SELECTED_LINK_IDS,
  REFRESH_FETCHED, ADD_LINKS, DELETE_LINKS, MOVE_LINKS_ADD_STEP,
  MOVE_LINKS_DELETE_STEP, TRY_UPDATE_SETTINGS, MERGE_SETTINGS, PIN_LINK, UNPIN_LINK,
  MOVE_PINNED_LINK_ADD_STEP, UPDATE_SYSTEM_THEME_MODE, UPDATE_IS_24H_FORMAT,
  UPDATE_CUSTOM_DATA, UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_T_STEP,
  INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  CARD_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, BULK_EDIT_MENU_POPUP,
  CUSTOM_EDITOR_POPUP, TAG_EDITOR_POPUP, PAYWALL_POPUP, CONFIRM_DELETE_POPUP,
  CONFIRM_DISCARD_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP,
  SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP, LOCK_EDITOR_POPUP, SWWU_POPUP, WHT_MODE,
  BLK_MODE, PADDLE_RANDOM_ID,
} from '../types/const';
import {
  isEqual, isObject, isFldStr, throttle, getUserUsername, getUserImageUrl,
  getWindowInsets, getEditingListNameEditors, getEditingTagNameEditors, randomString,
  getPopupHistoryStateIndex, reorderPopupHistoryStates,
} from '../utils';
import vars from '../vars';

const navQueue = new PQueue({ concurrency: 1, timeout: 1200, throwOnTimeout: true });
const navQueueAdd = async (task) => {
  try {
    await navQueue.add(task);
  } catch (e) {
    console.log('navQueue error:', e);
  }
};

let _didInit;
export const init = () => async (dispatch, getState) => {
  if (_didInit) return;
  _didInit = true;

  const isUserSignedIn = userSession.isUserSignedIn();
  let username = null, userImage = null, userHubUrl = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = getUserUsername(userData);
    userImage = getUserImageUrl(userData);
    userHubUrl = userData.hubUrl;
  }

  const darkMatches = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const is24HFormat = null;

  dispatch({
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

  window.addEventListener('popstate', function () {
    onPopStateChange(dispatch, getState);
  });

  window.addEventListener('resize', throttle(() => {
    const insets = getWindowInsets();
    dispatch({
      type: UPDATE_WINDOW,
      payload: {
        width: window.innerWidth,
        height: window.innerHeight,
        insetTop: insets.top,
        insetRight: insets.right,
        insetBottom: insets.bottom,
        insetLeft: insets.left,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      const insets = getWindowInsets();
      dispatch({
        type: UPDATE_WINDOW,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
          visualScale: window.visualViewport.scale,
          insetTop: insets.top,
          insetRight: insets.right,
          insetBottom: insets.bottom,
          insetLeft: insets.left,
        },
      });
    }, 16));
  }

  window.addEventListener('beforeunload', (e) => {
    const isUserSignedIn = userSession.isUserSignedIn();
    if (!isUserSignedIn) return;

    const { busy, online, outbox, retryScheduled } = getState().offline;
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

    if (!getState().display.isSettingsPopupShown) return;

    const settings = getState().settings;
    const snapshotSettings = getState().snapshot.settings;
    if (!isEqual(settings, snapshotSettings)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the settings haven\'t been saved. Do you want to leave immediately and discard your changes?';
    }

    const listNameEditors = getState().listNameEditors;
    const listNameMap = getState().settings.listNameMap;
    const editingLNEs = getEditingListNameEditors(listNameEditors, listNameMap);
    if (isObject(editingLNEs)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the list names haven\'t been saved. Do you want to leave this site and discard your changes?';
    }

    const tagNameEditors = getState().tagNameEditors;
    const tagNameMap = getState().settings.tagNameMap;
    const editingTNEs = getEditingTagNameEditors(tagNameEditors, tagNameMap);
    if (isObject(editingTNEs)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the tag names haven\'t been saved. Do you want to leave this site and discard your changes?';
    }
  }, { capture: true });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const systemThemeMode = e.matches ? BLK_MODE : WHT_MODE;
    dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
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

const getCanBckPopups = (getState) => {
  const state = getState();
  const canBckPopups = {
    [SIGN_UP_POPUP]: {
      canFwd: true, isShown: state.display.isSignUpPopupShown,
    },
    [SIGN_IN_POPUP]: {
      canFwd: true, isShown: state.display.isSignInPopupShown,
    },
    [ADD_POPUP]: {
      canFwd: false, isShown: state.display.isAddPopupShown,
    },
    [SEARCH_POPUP]: {
      canFwd: true, isShown: state.display.isSearchPopupShown,
    },
    [PROFILE_POPUP]: {
      canFwd: false, isShown: state.display.isProfilePopupShown,
    },
    [CARD_ITEM_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isCardItemMenuPopupShown,
    },
    [LIST_NAMES_POPUP]: {
      canFwd: false, isShown: state.display.isListNamesPopupShown,
    },
    [PIN_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isPinMenuPopupShown,
    },
    [BULK_EDIT_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isBulkEditMenuPopupShown,
    },
    [CUSTOM_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isCustomEditorPopupShown,
    },
    [TAG_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isTagEditorPopupShown,
    },
    [SETTINGS_POPUP]: {
      canFwd: true, isShown: state.display.isSettingsPopupShown,
    },
    [SETTINGS_LISTS_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isSettingsListsMenuPopupShown,
    },
    [SETTINGS_TAGS_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isSettingsTagsMenuPopupShown,
    },
    [TIME_PICK_POPUP]: {
      canFwd: false, isShown: state.display.isTimePickPopupShown,
    },
    [CONFIRM_DELETE_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmDeletePopupShown,
    },
    [CONFIRM_DISCARD_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmDiscardPopupShown,
    },
    [PAYWALL_POPUP]: {
      canFwd: false, isShown: state.display.isPaywallPopupShown,
    },
    [LOCK_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isLockEditorPopupShown,
    },
  };
  return canBckPopups;
};

const canPopupBckBtn = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return true;
  return false;
};

const canPopupFwdBtn = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return canBckPopups[id].canFwd;
  return false;
};

const isPopupShownWthId = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return canBckPopups[id].isShown;
  console.log('Called isPopupShownWthId with unsupported id:', id);
  return false;
};

const onPopStateChange = (dispatch, getState) => {
  const chs = window.history.state;
  const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);

  // Bulk edit
  let isBulkEditing = false;
  if (idx >= 0) {
    for (let i = idx; i >= 0; i--) {
      const phs = vars.popupHistory.states[i];
      if (phs.type === UPDATE_BULK_EDITING) isBulkEditing = true;
    }
  }

  const curIsBulkEditing = getState().display.isBulkEditing;

  /* bulkEdit  curBulkEdit
      false      false               do nothing
      false      true                set false
      true       false               set true
      true       true                do nothing
  */
  if (
    (!isBulkEditing && curIsBulkEditing) ||
    (isBulkEditing && !curIsBulkEditing)
  ) {
    dispatch({ type: UPDATE_BULK_EDITING, payload: isBulkEditing });
  }

  // Popups
  const canBckPopups = getCanBckPopups(getState);

  const hss = vars.popupHistory.states.slice(idx + 1);
  const cPopupIds = hss.filter(s => s.type === UPDATE_POPUP).map(s => s.id);
  const uPopupIds = [...new Set(cPopupIds)];
  for (const id of uPopupIds) {
    if (isPopupShownWthId(canBckPopups, id)) {
      if (id === SETTINGS_POPUP) {
        // Must keep align with updateSettingsPopup(false, false)
        //   and if forward, must keep align with updateSettingsPopup(true).
        dispatch(updateStgsAndInfo());
      }
      dispatch({
        type: UPDATE_POPUP, payload: { id, isShown: false },
      });

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
    }
  }

  /* action    canPopupFwdBtn    isShown
     forward       true           true       do nothing
     forward       true           false      set show
     forward       false          true       Impossible (do nothing)
     forward       false          false      go back
     back          true           true       do nothing
     back          true           false      Impossible (set show)
     back          false          true       do nothing
     back          false          false      Impossible (set show)
  */
  if (idx >= 0) { // Support forward by open the current one if can.
    const phs = vars.popupHistory.states[idx];
    if (phs.type === UPDATE_POPUP) {
      if (canPopupFwdBtn(canBckPopups, phs.id)) {
        if (!isPopupShownWthId(canBckPopups, phs.id)) {
          dispatch({
            type: UPDATE_POPUP, payload: { id: phs.id, isShown: true },
          });
        }
      } else {
        if (!isPopupShownWthId(canBckPopups, phs.id)) {
          window.history.back();
        }
      }
    }
  }
};

export const signOut = () => async (dispatch, getState) => {
  // Wait for profilePopup to close first so the popup does not get already unmount.
  const task = async () => {
    userSession.signUserOut();
    await resetState(dispatch);
  };
  navQueueAdd(task);
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
      username: getUserUsername(userData),
      image: getUserImageUrl(userData),
      hubUrl: userData.hubUrl,
    },
  });

  dispatch({ type: INCREASE_REDIRECT_TO_MAIN_COUNT });
};

const resetState = async (dispatch) => {
  lsgApi.removeItemSync(PADDLE_RANDOM_ID);

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

const updatePopupInQueue = (
  id, isShown, anchorPosition, replaceId, dispatch, getState
) => () => {
  return new Promise<void>((resolve) => {
    const canBckPopups = getCanBckPopups(getState);

    dispatch({
      type: UPDATE_POPUP, payload: { id, isShown, anchorPosition },
    });
    if (isShown && isFldStr(replaceId)) {
      dispatch({
        type: UPDATE_POPUP, payload: { id: replaceId, isShown: false },
      });
    }

    if (!canPopupBckBtn(canBckPopups, id)) {
      resolve();
      return;
    }

    /* isShown   currShown   replaceId
         true       true       null       do nothing
         true       true       str        back (Paywall to already open SettingsPopup)
         true       false      null       history.push
         true       false      str        history.replace
         false      true       null       back
         false      true       str        invalid (back)
         false      false      null       do nothing
         false      false      str        invalid (do nothing)
    */
    const chs = window.history.state;
    const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);
    const type = UPDATE_POPUP;
    if (isShown && !isPopupShownWthId(canBckPopups, id)) {
      const phs = { phsId: `${Date.now()}-${randomString(4)}`, type, id };

      if (isFldStr(replaceId)) {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx),
            phs,
            ...vars.popupHistory.states.slice(idx + 1)
          ];
        } else {
          console.log('In updatePopupInQueue, invalid replaceId:', replaceId);
          vars.popupHistory.states = [phs];
        }
        window.history.replaceState({ phsId: phs.phsId }, '', window.location.href);
      } else {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx + 1), phs,
          ];
        } else {
          vars.popupHistory.states = [phs];
        }
        window.history.pushState({ phsId: phs.phsId }, '', window.location.href);
      }

      resolve();
      return;
    }
    if (
      (isShown && isPopupShownWthId(canBckPopups, id) && isFldStr(replaceId)) ||
      (!isShown && isPopupShownWthId(canBckPopups, id))
    ) {
      const backId = !isShown ? id : replaceId;
      vars.popupHistory.states = reorderPopupHistoryStates(
        vars.popupHistory.states, idx, type, backId
      );

      const onPopState = () => {
        window.removeEventListener('popstate', onPopState);
        resolve();
      };
      window.addEventListener('popstate', onPopState);
      window.history.back();
      return;
    }

    resolve();
  });
};

export const updatePopup = (
  id, isShown, anchorPosition = null, replaceId = null
) => async (dispatch, getState) => {
  const task = updatePopupInQueue(
    id, isShown, anchorPosition, replaceId, dispatch, getState
  );
  navQueueAdd(task);
};

export const updateSearchString = (searchString) => {
  return { type: UPDATE_SEARCH_STRING, payload: searchString };
};

export const updateHref = (href) => {
  return { type: UPDATE_HREF, payload: href };
};

const updateBulkEditInQueue = (
  isBulkEditing, selectedLinkId, popupToReplace, dispatch, getState
) => () => {
  return new Promise<void>((resolve) => {
    const curValue = getState().display.isBulkEditing;

    dispatch({ type: UPDATE_BULK_EDITING, payload: isBulkEditing });
    if (isBulkEditing && isFldStr(selectedLinkId)) {
      dispatch(addSelectedLinkIds([selectedLinkId]));
    }
    if (isBulkEditing && isFldStr(popupToReplace)) {
      dispatch({
        type: UPDATE_POPUP, payload: { id: popupToReplace, isShown: false },
      });
    }

    /* isBulkEditing   curValue   popupToReplace
        true             true         null          do nothing
        true             true         str           back
        true             false        null          history.push
        true             false        str           history.replace
        false            true         null          back
        false            true         str           not support
        false            false        null          do nothing
        false            false        str           not support
    */
    const chs = window.history.state;
    const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);
    const type = UPDATE_BULK_EDITING, id = 'true';
    if (isBulkEditing && !curValue) {
      const phs = { phsId: `${Date.now()}-${randomString(4)}`, type, id };

      if (isFldStr(popupToReplace)) {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx),
            phs,
            ...vars.popupHistory.states.slice(idx + 1)
          ];
        } else {
          console.log('In updateBulkEditInQueue, invalid replaceId:', popupToReplace);
          vars.popupHistory.states = [phs];
        }
        window.history.replaceState({ phsId: phs.phsId }, '', window.location.href);
      } else {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx + 1), phs,
          ];
        } else {
          vars.popupHistory.states = [phs];
        }
        window.history.pushState({ phsId: phs.phsId }, '', window.location.href);
      }

      resolve();
      return;
    }
    if (
      (isBulkEditing && curValue && isFldStr(popupToReplace)) ||
      (!isBulkEditing && curValue)
    ) {
      vars.popupHistory.states = reorderPopupHistoryStates(
        vars.popupHistory.states, idx, type, id
      );

      const onPopState = () => {
        window.removeEventListener('popstate', onPopState);
        resolve();
      };
      window.addEventListener('popstate', onPopState);
      window.history.back();
      return;
    }

    resolve();
  });
};

export const updateBulkEdit = (
  isBulkEditing, selectedLinkId = null, popupToReplace = null,
) => async (dispatch, getState) => {
  const task = updateBulkEditInQueue(
    isBulkEditing, selectedLinkId, popupToReplace, dispatch, getState
  );
  navQueueAdd(task);
};

export const addSelectedLinkIds = (ids) => {
  return { type: ADD_SELECTED_LINK_IDS, payload: ids };
};

export const deleteSelectedLinkIds = (ids) => {
  return { type: DELETE_SELECTED_LINK_IDS, payload: ids };
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

const linkToInQueue = (router, href) => () => {
  return new Promise<void>((resolve) => {
    const wUrl = window.location;
    const tUrl = new URL(href, window.location.origin);

    if (wUrl.pathname === tUrl.pathname && wUrl.search === tUrl.search) {
      const wHash = wUrl.hash === '#' ? '' : wUrl.hash;
      const tHash = tUrl.hash === '#' ? '' : tUrl.hash;

      if (wHash === tHash) {
        resolve();
        return;
      }

      const onHashchange = () => {
        window.removeEventListener('hashchange', onHashchange);
        resolve();
      };
      window.addEventListener('hashchange', onHashchange);
      window.location.hash = tUrl.hash; // if '', the url still has '#'. Fine for now.
      return;
    }

    const onRouteChangeComplete = () => {
      window.removeEventListener('routeChangeComplete', onRouteChangeComplete);
      resolve();
    };
    window.addEventListener('routeChangeComplete', onRouteChangeComplete);
    router.push(href);
  });
};

export const linkTo = (router, href) => async () => {
  const task = linkToInQueue(router, href);
  navQueueAdd(task);
};

export const queueDeleteAllData = () => async (dispatch, getState) => {
  // Wait for SettingsPopup to close first so history.back() works correctly.
  const task = async () => {
    dispatch({ type: DELETE_ALL_DATA });
  };
  navQueueAdd(task);
};
