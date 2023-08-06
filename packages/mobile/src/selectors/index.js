import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import {
  FETCH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT,
  UPDATE_SETTINGS_COMMIT,
} from '../types/actionTypes';
import {
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, PINNED, WHT_MODE, BLK_MODE, SYSTEM_MODE,
  CUSTOM_MODE, FROM_LINK, LOCKED, UNLOCKED, MY_LIST,
} from '../types/const';
import {
  isStringIn, isObject, isString, isArrayEqual, isEqual, getListNameObj, getStatusCounts,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  getFilteredLinks, getSortedLinks, sortWithPins, getPinFPaths, getPins,
  doEnableExtraFeatures, isNumber, isMobile as _isMobile,
} from '../utils';
import { _ } from '../utils/obj';
import { tailwind } from '../stylesheets/tailwind';
import { initialListNameEditorState } from '../types/initialStates';

const createSelectorListNameMap = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {
    if (!isObject(prevVal['links']) || !isObject(val['links'])) {
      if (prevVal['links'] !== val['links']) return false;
    }

    if (!isArrayEqual(
      Object.keys(prevVal['links']).sort(),
      Object.keys(val['links']).sort()
    )) return false;

    return isEqual(prevVal['settings']['listNameMap'], val['settings']['listNameMap']);
  }
);

export const getListNameMap = createSelectorListNameMap(
  state => state,
  (state) => {
    return [...state.settings.listNameMap];
  }
);

/** @return {function(any, any): any} */
export const makeIsLinkIdSelected = () => {
  return createSelector(
    state => state.display.selectedLinkIds,
    (__, props) => props.linkId,
    (selectedLinkIds, linkId) => {
      return selectedLinkIds.includes(linkId);
    }
  );
};

// This doesn't depend on props
//   so no need to create an instance of this selector per componenet instance.
export const getSelectedLinkIdsLength = createSelector(
  state => state.display.selectedLinkIds,
  selectedLinkIds => {
    return selectedLinkIds.length;
  }
);

export const getStatus = createSelector(
  state => state.display.statuses,
  statuses => {
    if (statuses.length === 0) return null;

    const lastStatus = statuses[statuses.length - 1];
    if (![
      FETCH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT,
      UPDATE_SETTINGS_COMMIT, null,
    ].includes(lastStatus)) {
      return lastStatus;
    }

    const statusCounts = getStatusCounts(statuses);

    let finalCount = { count: 0, index: -1, value: lastStatus };
    for (const statusCount of statusCounts) {
      if (statusCount.count > 0 && statusCount.index > finalCount.index) {
        finalCount = statusCount;
      }
    }

    return finalCount.value;
  }
);

const createSelectorLinks = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {

    if (prevVal['settings'].doDescendingOrder !== val['settings'].doDescendingOrder) {
      return false;
    }

    if (prevVal['display'].listName !== val['display'].listName) return false;
    if (prevVal['display'].searchString !== val['display'].searchString) return false;

    if (prevVal['cachedFPaths'].fpaths !== val['cachedFPaths'].fpaths) {
      if (!prevVal['cachedFPaths'].fpaths || !val['cachedFPaths'].fpaths) return false;
      if (!isArrayEqual(
        prevVal['cachedFPaths'].fpaths.pinFPaths,
        val['cachedFPaths'].fpaths.pinFPaths
      )) return false;
    }

    if (prevVal['pendingPins'] !== val['pendingPins']) return false;

    if (prevVal['links'] === val['links']) return true;
    if (!isArrayEqual(Object.keys(prevVal['links']).sort(), Object.keys(val['links']).sort())) {
      return false;
    }

    for (const key in val['links']) {

      if (!prevVal['links'][key] || !val['links'][key]) {
        if (prevVal['links'][key] !== val['links'][key]) return false;
        continue;
      }

      // Deep equal without attributes: popup and popupAnchorPosition.
      const res = isEqual(
        _.ignore(
          prevVal['links'][key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK],
        ),
        _.ignore(
          val['links'][key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, FROM_LINK],
        )
      );
      if (!res) return false;
    }

    return true;
  }
);

export const getLinks = createSelectorLinks(
  state => state,
  (state) => {

    const links = state.links;
    const listName = state.display.listName;
    const searchString = state.display.searchString;
    const doDescendingOrder = state.settings.doDescendingOrder;
    const pinFPaths = getPinFPaths(state);
    const pendingPins = state.pendingPins;

    let sortedLinks = getSortedLinks(links, listName, doDescendingOrder);
    if (!sortedLinks) return null;

    sortedLinks = sortWithPins(sortedLinks, pinFPaths, pendingPins, (link) => {
      return getMainId(link.id);
    });

    if (searchString === '') return sortedLinks;

    const searchLinks = sortedLinks.filter(link => {
      return isStringIn(link, searchString);
    });

    return searchLinks;
  }
);

const createSelectorPopupLink = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {

    // doDescendingOrder shouldn't change which link its popup shown

    if (prevVal['display'].listName !== val['display'].listName) return false;
    if (prevVal['display'].searchString !== val['display'].searchString) return false;

    // cachedFPaths shouldn't change which link its popup shown
    // pendingPins shouldn't change which link its popup shown

    if (prevVal['links'] === val['links']) return true;
    if (!isArrayEqual(Object.keys(prevVal['links']).sort(), Object.keys(val['links']).sort())) {
      return false;
    }

    for (const key in val['links']) {

      if (!prevVal['links'][key] || !val['links'][key]) {
        if (prevVal['links'][key] !== val['links'][key]) return false;
        continue;
      }

      // Deep equal only attributes: popup and popupAnchorPosition.
      const res = isEqual(
        _.choose(prevVal['links'][key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]),
        _.choose(val['links'][key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION])
      );
      if (!res) return false;
    }

    return true;
  }
);

export const getPopupLink = createSelectorPopupLink(
  state => state,
  (state) => {

    const links = state.links;
    const listName = state.display.listName;
    const searchString = state.display.searchString;

    const filteredLinks = getFilteredLinks(links, listName);
    if (!filteredLinks) return null;

    const popupLinks = _.select(filteredLinks, IS_POPUP_SHOWN, true);

    let popupLink = null;
    for (const key in popupLinks) {
      popupLink = popupLinks[key];
      break;
    }

    if (popupLink && searchString !== '') {
      if (!isStringIn(popupLink, searchString)) {
        popupLink = null;
      }
    }

    return popupLink;
  }
);

export const getIsFetchingMore = createSelector(
  state => state.display.listName,
  state => state.isFetchMoreInterrupted,
  (listName, isFetchMoreInterrupted) => {
    const obj = isFetchMoreInterrupted[listName];
    if (isObject(obj) && !isEqual(obj, {})) return true;
    return false;
  }
);

/** @return {function(any, any): initialListNameEditorState} */
export const makeGetListNameEditor = () => {
  return createSelector(
    state => state.settings.listNameMap,
    state => state.listNameEditors,
    (__, key) => key,
    (listNameMap, listNameEditors, key) => {
      const state = { ...initialListNameEditorState };

      const { listNameObj } = getListNameObj(key, listNameMap);
      if (listNameObj) state.value = listNameObj.displayName;

      return { ...state, ...listNameEditors[key] };
    },
    { memoizeOptions: { resultEqualityCheck: isEqual } },
  );
};

export const getLayoutType = createSelector(
  state => state.settings.layoutType,
  state => state.localSettings.doUseLocalLayout,
  state => state.localSettings.layoutType,
  (layoutType, doUseLocalLayout, localLayoutType) => {
    if (doUseLocalLayout) return localLayoutType;
    return layoutType;
  },
);

export const getSafeAreaFrame = createSelector(
  state => state.window.width,
  state => state.window.height,
  state => state.window.visualWidth,
  state => state.window.visualHeight,
  (windowWidth, windowHeight, visualWidth, visualHeight) => {
    const isMobile = _isMobile();

    [windowWidth, windowHeight] = [Math.round(windowWidth), Math.round(windowHeight)];
    [visualWidth, visualHeight] = [Math.round(visualWidth), Math.round(visualHeight)];

    const width = isMobile && isNumber(visualWidth) ? visualWidth : windowWidth;
    const height = isMobile && isNumber(visualHeight) ? visualHeight : windowHeight;

    return {
      x: 0, y: 0, width, height, windowWidth, windowHeight, visualWidth, visualHeight,
    };
  }
);

export const getSafeAreaWidth = createSelector(
  state => state.window.width,
  state => state.window.visualWidth,
  (windowWidth, visualWidth) => {
    const isMobile = _isMobile();
    [windowWidth, visualWidth] = [Math.round(windowWidth), Math.round(visualWidth)];
    return isMobile && isNumber(visualWidth) ? visualWidth : windowWidth;
  }
);

export const getSafeAreaHeight = createSelector(
  state => state.window.height,
  state => state.window.visualHeight,
  (windowHeight, visualHeight) => {
    const isMobile = _isMobile();
    [windowHeight, visualHeight] = [Math.round(windowHeight), Math.round(visualHeight)];
    return isMobile && isNumber(visualHeight) ? visualHeight : windowHeight;
  }
);

export const getValidProduct = createSelector(
  state => state.iap.products,
  products => _getValidProduct(products),
);

export const getValidPurchase = createSelector(
  state => state.info.purchases,
  purchases => _getValidPurchase(purchases),
);

export const getDoEnableExtraFeatures = createSelector(
  state => state.info.purchases,
  purchases => doEnableExtraFeatures(purchases),
);

/** @return {function(any, any): any} */
export const makeGetPinStatus = () => {
  return createSelector(
    state => getPinFPaths(state),
    state => state.pendingPins,
    (__, link) => isObject(link) ? link.id : null,
    (pinFPaths, pendingPins, linkId) => {
      if (!isString(linkId)) return null;

      const pins = getPins(pinFPaths, pendingPins, false);
      const linkMainId = getMainId(linkId);
      if (linkMainId in pins) {
        if ('status' in pins[linkMainId]) return pins[linkMainId].status;
        return PINNED;
      }

      return null;
    }
  );
};

export const getRawThemeMode = createSelector(
  state => state.settings.themeMode,
  state => state.localSettings.doUseLocalTheme,
  state => state.localSettings.themeMode,
  (themeMode, doUseLocalTheme, localThemeMode) => {
    if (doUseLocalTheme) return localThemeMode;
    return themeMode;
  },
);

export const getRawThemeCustomOptions = createSelector(
  state => state.settings.themeCustomOptions,
  state => state.localSettings.doUseLocalTheme,
  state => state.localSettings.themeCustomOptions,
  (customOptions, doUseLocalTheme, localCustomOptions) => {
    if (doUseLocalTheme) return localCustomOptions;
    return customOptions;
  },
);

let lastCustomOptions = null, lastCurHH = null, lastCurMM = null, lastCurMode = null;
export const getThemeMode = createSelector(
  state => state.user.isUserSignedIn,
  state => getDoEnableExtraFeatures(state),
  state => state.window.themeMode,
  state => {
    const mode = getRawThemeMode(state);
    if (mode !== CUSTOM_MODE) {
      [lastCustomOptions, lastCurHH, lastCurMM, lastCurMode] = [null, null, null, null];
      return WHT_MODE;
    }

    const customOptions = getRawThemeCustomOptions(state);

    const d = new Date();
    const curHH = d.getHours();
    const curMM = d.getMinutes();

    if (
      customOptions === lastCustomOptions &&
      curHH === lastCurHH && curMM < lastCurMM + 12 && lastCurMode !== null
    ) {
      return lastCurMode;
    }

    [lastCustomOptions, lastCurHH, lastCurMM] = [customOptions, curHH, curMM];
    for (let i = 0; i < customOptions.length; i++) {
      const startOption = customOptions[i];

      const j = i + 1 < customOptions.length ? i + 1 : 0;
      const endOption = customOptions[j];

      const [startHHStr, startMMStr] = startOption.startTime.trim().split(':');
      const [endHHStr, endMMStr] = endOption.startTime.trim().split(':');

      const startHH = parseInt(startHHStr, 10);
      const startMM = parseInt(startMMStr, 10);
      const endHH = parseInt(endHHStr, 10);
      const endMM = parseInt(endMMStr, 10);

      if (startHH < endHH || (startHH === endHH && startMM < endMM)) {
        if (curHH > startHH || (curHH === startHH && curMM >= startMM)) {
          if (curHH < endHH || (curHH === endHH && curMM < endMM)) {
            lastCurMode = startOption.mode;
            return lastCurMode;
          }
        }
      } else {
        if (curHH > startHH || (curHH === startHH && curMM >= startMM)) {
          lastCurMode = startOption.mode;
          return lastCurMode;
        }
        if (curHH < endHH || (curHH === endHH && curMM < endMM)) {
          lastCurMode = startOption.mode;
          return lastCurMode;
        }
      }
    }

    console.log('Could not find startTime and endTime in themeCustomOptions!');
    [lastCustomOptions, lastCurHH, lastCurMM, lastCurMode] = [null, null, null, null];
    return WHT_MODE;
  },
  state => getRawThemeMode(state),
  (isSignedIn, doEnable, systemMode, customMode, mode) => {
    if (!isSignedIn || !doEnable) return WHT_MODE;

    if (mode === SYSTEM_MODE) return systemMode;
    if (mode === CUSTOM_MODE) return customMode;
    if ([WHT_MODE, BLK_MODE].includes(mode)) return mode;

    return WHT_MODE;
  },
);

/** @type {function(any, any): any} */
export const getTailwind = createSelector(
  safeAreaWidth => safeAreaWidth,
  (__, themeMode) => themeMode,
  (safeAreaWidth, themeMode) => {
    return (classStr) => {
      return tailwind(classStr, safeAreaWidth, themeMode);
    };
  },
);

/** @return {function(any, any): any} */
export const makeIsTimePickHourItemSelected = () => {
  return createSelector(
    state => state.timePick.hour,
    (__, item) => item,
    (hour, item) => {
      return hour === item;
    }
  );
};

/** @return {function(any, any): any} */
export const makeIsTimePickMinuteItemSelected = () => {
  return createSelector(
    state => state.timePick.minute,
    (__, item) => item,
    (minute, item) => {
      return minute === item;
    }
  );
};

export const getCustomEditor = createSelector(
  state => state.links,
  state => state.display.listName,
  state => state.display.selectingLinkId,
  state => state.images,
  state => state.customEditor,
  (links, listName, selectingLinkId, images, customEditor) => {
    const editor = { ...customEditor };

    if (isObject(links[listName]) && isObject(links[listName][selectingLinkId])) {
      const link = links[listName][selectingLinkId];
      if (isObject(link.custom)) {
        if (!editor.didTitleEdit && isString(link.custom.title)) {
          editor.title = link.custom.title;
        }
        if (
          !editor.didImageEdit &&
          isString(link.custom.image) &&
          isString(images[link.custom.image])
        ) {
          editor.image = link.custom.image;
          editor.imageUrl = images[link.custom.image];
        }
      }
    }

    return editor;
  },
  { memoizeOptions: { resultEqualityCheck: isEqual } },
);

/** @return {function(any, any): any} */
export const makeGetCustomImage = () => {
  return createSelector(
    state => state.images,
    (__, link) => link,
    (images, link) => {
      if (!isObject(link.custom) || !isString(link.custom.image)) return null;

      if (isString(images[link.custom.image])) return images[link.custom.image];
      return null;
    }
  );
};

export const makeGetLockListStatus = () => {
  return createSelector(
    state => state.display.doForceLock,
    state => state.lockSettings.lockedLists,
    (__, listName) => listName,
    (doForceLock, lockedLists, listName) => {
      if (!isString(listName)) return null;

      if (isObject(lockedLists[listName])) {
        if (isString(lockedLists[listName].password)) {
          if (doForceLock) return LOCKED;
          if (isNumber(lockedLists[listName].unlockedDT)) return UNLOCKED;
          return LOCKED;
        }
      }
      return null;
    },
  );
};

const _getCurrentLockListStatus = makeGetLockListStatus();
export const getCurrentLockListStatus = (state) => {
  return _getCurrentLockListStatus(state, state.display.listName);
};

export const getCanChangeListNames = createSelector(
  state => state.display.doForceLock,
  state => state.display.listName,
  state => state.lockSettings.lockedLists,
  (doForceLock, listName, lockedLists) => {
    if (listName !== MY_LIST) return true;

    if (isObject(lockedLists[listName])) {
      if (!doForceLock && isNumber(lockedLists[listName].unlockedDT)) return true;
      if ([true, false].includes(lockedLists[listName].canChangeListNames)) {
        return lockedLists[listName].canChangeListNames;
      }
    }
    return true;
  },
);
