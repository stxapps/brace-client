import { Platform } from 'react-native';
import FlagSecure from 'react-native-flag-secure';

import {
  REQUEST_PURCHASE, UPDATE_LOCKS_FOR_ACTIVE_APP, UPDATE_LOCKS_FOR_INACTIVE_APP,
} from '../types/actionTypes';
import {
  MY_LIST, APP_STATE_ACTIVE, APP_STATE_INACTIVE, APP_STATE_BACKGROUND,
  SETTINGS_LISTS_MENU_POPUP, SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP,
  LIST_NAMES_POPUP, LOCK_EDITOR_POPUP, CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP,
  PAYWALL_POPUP,
} from '../types/const';
import { isObject, doListContainUnlocks } from '../utils';
import vars from '../vars';

import {
  isPopupShown, updatePopup, refreshFetched, is24HourFormat, updateIs24HFormat,
} from '.';
import { updateSettingsPopup } from '../importWrapper';

export const handleAppStateChange = (appState, pathname) => async (
  dispatch, getState
) => {
  // Debounce on active and '/' for performance.
  // In case, when switch to app, active as '/' then to share.
  clearTimeout(vars.appState.timeoutId);

  if (appState === APP_STATE_ACTIVE && pathname === '/') {
    vars.appState.timeoutId = setTimeout(async () => {
      await _handleAppStateChange(appState, pathname, dispatch, getState);
      vars.appState.lastChangeDT = Date.now();
    }, 400);
  } else {
    await _handleAppStateChange(appState, pathname, dispatch, getState);
    vars.appState.lastChangeDT = Date.now();
  }
};

const _handleAppStateChange = async (appState, pathname, dispatch, getState) => {
  // 1. active       app       check
  // 2. active       share     no check
  // 3. background   app       check
  // 4. background   share     check
  // 5. app -> any (like 2.)   no check
  // 6. any -> app (like 1.)   check
  const isUserSignedIn = getState().user.isUserSignedIn;

  if (appState === APP_STATE_ACTIVE && pathname === '/') {
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

    const interval = (Date.now() - vars.fetch.dt) / 1000 / 60 / 60;
    if (interval < 0.6) return;
    if (isPopupShown(getState()) && interval < 0.9) return;

    dispatch(refreshFetched());
  }

  let isInactive = appState === APP_STATE_INACTIVE;
  if (Platform.OS === 'android') isInactive = appState === APP_STATE_BACKGROUND;
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

export const resetPopupsForAdding = () => async (dispatch, getState) => {
  dispatch(updatePopup(SETTINGS_LISTS_MENU_POPUP, false));
  dispatch(updatePopup(SETTINGS_TAGS_MENU_POPUP, false));
  dispatch(updatePopup(TIME_PICK_POPUP, false));
  dispatch(updatePopup(LIST_NAMES_POPUP, false));
  dispatch(updatePopup(LOCK_EDITOR_POPUP, false));
  dispatch(updatePopup(CONFIRM_DELETE_POPUP, false));
  dispatch(updatePopup(CONFIRM_DISCARD_POPUP, false));
  dispatch(updatePopup(PAYWALL_POPUP, false));

  const { isSettingsPopupShown } = getState().display;
  if (isSettingsPopupShown) dispatch(updateSettingsPopup(false, true));
};
