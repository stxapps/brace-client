import {
  createSelectorCreator, lruMemoize as defaultMemoize, createSelector,
} from 'reselect';

import {
  FETCH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT, EXTRACT_CONTENTS_COMMIT,
  UPDATE_SETTINGS_COMMIT,
} from '../types/actionTypes';
import {
  SHOWING_STATUSES, PINNED, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE, MY_LIST,
  TAGGED, LOCKED,
} from '../types/const';
import {
  isStringIn, isObject, isString, isEqual, getListNameObj, getStatusCounts, getMainId,
  getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  getPinFPaths, getPins, doEnableExtraFeatures, isNumber, getLink,
  doesIncludeFetchingMore, getTagFPaths, getTags, getTagNameObj, getLockListStatus,
} from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import {
  initialListNameEditorState, initialTagNameEditorState,
} from '../types/initialStates';
import vars from '../vars';

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

export const getIsShowingLinkIdsNull = createSelector(
  state => state.display.showingLinkIds,
  (showingLinkIds) => {
    return showingLinkIds === null;
  }
);

const createSelectorLinks = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {
    if (prevVal.links !== val.links) return false;
    if (prevVal.display.queryString !== val.display.queryString) return false;
    if (prevVal.pendingTags !== val.pendingTags) return false;
    if (prevVal.display.searchString !== val.display.searchString) return false;
    if (!isEqual(prevVal.display.showingLinkIds, val.display.showingLinkIds)) {
      return false;
    }
    return true;
  }
);

export const getLinks = createSelectorLinks(
  state => state,
  (state) => {
    const links = state.links;
    const queryString = state.display.queryString;
    const pendingTags = state.pendingTags;
    const searchString = state.display.searchString;
    const showingLinkIds = state.display.showingLinkIds;

    if (!Array.isArray(showingLinkIds)) return null;

    const sortedLinks = [];
    for (const linkId of showingLinkIds) {
      if (queryString && isObject(pendingTags[linkId])) {
        // Only tag name for now
        const tagName = queryString.trim();
        const values = pendingTags[linkId].values;
        const found = values.some(value => value.tagName === tagName);
        if (!found) continue;
      }

      const link = getLink(linkId, links);
      if (!isObject(link)) continue;
      if (!SHOWING_STATUSES.includes(link.status)) continue;

      sortedLinks.push(link);
    }

    if (searchString === '') return sortedLinks;

    const searchLinks = sortedLinks.filter(link => {
      return isStringIn(link, searchString);
    });

    return searchLinks;
  }
);

export const getIsFetchingMore = createSelector(
  state => state.display.listName,
  state => state.display.queryString,
  state => state.display.fetchingInfos,
  (listName, queryString, fetchingInfos) => {
    const lnOrQt = queryString ? queryString : listName;
    if (doesIncludeFetchingMore(lnOrQt, false, fetchingInfos)) return true;
    return false;
  }
);

export const getHasFetchedMore = createSelector(
  state => state.display.listName,
  state => state.display.queryString,
  state => state.fetchedMore,
  (listName, queryString, fetchedMore) => {
    let obj;
    if (queryString) {
      obj = fetchedMore[queryString];
      if (isObject(obj) && !isEqual(obj, {})) return true;
    }

    obj = fetchedMore[listName];
    if (isObject(obj) && !isEqual(obj, {})) return true;

    return false;
  }
);

export const getPopupLink = createSelector(
  state => state.links,
  state => state.display.selectingLinkId,
  (links, selectingLinkId) => {
    return getLink(selectingLinkId, links);
  }
);

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

const _getInsets = (insetTop, insetRight, insetBottom, insetLeft) => {
  let [top, right, bottom, left] = [0, 0, 0, 0];
  if (isNumber(insetTop)) top = Math.round(insetTop);
  if (isNumber(insetRight)) right = Math.round(insetRight);
  if (isNumber(insetBottom)) bottom = Math.round(insetBottom);
  if (isNumber(insetLeft)) left = Math.round(insetLeft);
  return { left, top, right, bottom };
};

const getSafeAreaFrameFromState = createSelector(
  state => state.window.width,
  state => state.window.height,
  state => state.window.visualWidth,
  state => state.window.visualHeight,
  state => state.window.visualScale,
  state => state.window.insetTop,
  state => state.window.insetRight,
  state => state.window.insetBottom,
  state => state.window.insetLeft,
  (
    windowWidth, windowHeight, visualWidth, visualHeight, visualScale,
    insetTop, insetRight, insetBottom, insetLeft,
  ) => {
    [windowWidth, windowHeight] = [Math.round(windowWidth), Math.round(windowHeight)];

    if (!isNumber(visualScale)) visualScale = 1;

    let [width, height] = [windowWidth, windowHeight];
    if (isNumber(visualWidth)) {
      visualWidth = Math.round(visualWidth);
      width = Math.round(visualWidth * visualScale);
    } else {
      visualWidth = windowWidth;
    }
    if (isNumber(visualHeight)) {
      visualHeight = Math.round(visualHeight);
      height = Math.round(visualHeight * visualScale);
    } else {
      visualHeight = windowHeight;
    }

    const assumeKeyboard = windowHeight - height > 150;

    const insets = _getInsets(insetTop, insetRight, insetBottom, insetLeft);
    width = width - insets.left - insets.right;
    height = height - insets.top - (assumeKeyboard ? 0 : insets.bottom);

    return {
      x: insets.left, y: insets.top, width, height,
      windowWidth, windowHeight, visualWidth, visualHeight, visualScale,
    };
  },
);

const getSafeAreaInsetsFromState = createSelector(
  state => state.window.insetTop,
  state => state.window.insetRight,
  state => state.window.insetBottom,
  state => state.window.insetLeft,
  (insetTop, insetRight, insetBottom, insetLeft) => {
    const insets = _getInsets(insetTop, insetRight, insetBottom, insetLeft);
    return insets;
  },
);

const getSafeAreaWidthFromState = (state) => {
  const { width: safeAreaWidth } = getSafeAreaFrameFromState(state);
  return safeAreaWidth;
};

const getSafeAreaHeightFromState = (state) => {
  const { height: safeAreaHeight } = getSafeAreaFrameFromState(state);
  return safeAreaHeight;
};

const getSafeAreaFrameFromArgs = createSelector(
  (...args) => args[0],
  (...args) => args[1],
  (...args) => args[2],
  (windowWidth, windowHeight, safeAreaInsets) => {
    const safeAreaX = safeAreaInsets.left;
    const safeAreaY = safeAreaInsets.top;
    const safeAreaWidth = windowWidth - safeAreaInsets.left - safeAreaInsets.right;
    const safeAreaHeight = windowHeight - safeAreaInsets.top - safeAreaInsets.bottom;

    return {
      x: safeAreaX, y: safeAreaY, width: safeAreaWidth, height: safeAreaHeight,
      windowWidth, windowHeight,
    };
  },
);

const getSafeAreaInsetsFromArgs = createSelector(
  (...args) => args[0],
  (...args) => args[1],
  (...args) => args[2],
  (...args) => args[3],
  (...args) => args[4],
  (...args) => args[5],
  (...args) => args[6],
  (
    windowX, windowY, windowWidth, windowHeight,
    screenWidth, screenHeight, screenInsets,
  ) => {
    const left = Math.max(screenInsets.left - windowX, 0);
    const top = Math.max(screenInsets.top - windowY, 0);
    const right = Math.max(
      (windowX + windowWidth) - (screenWidth - screenInsets.right), 0
    );
    const bottom = Math.max(
      (windowY + windowHeight) - (screenHeight - screenInsets.bottom), 0
    );
    return { left, top, right, bottom };
  },
);

const getSafeAreaWidthFromArgs = (...args) => {
  /** @ts-expect-error */
  const { width: safeAreaWidth } = getSafeAreaFrameFromArgs(...args);
  return safeAreaWidth;
};

const getSafeAreaHeightFromArgs = (...args) => {
  /** @ts-expect-error */
  const { height: safeAreaHeight } = getSafeAreaFrameFromArgs(...args);
  return safeAreaHeight;
};

export const getSafeAreaFrame = (
  vars.platform.isReactNative ? getSafeAreaFrameFromArgs : getSafeAreaFrameFromState
);

export const getSafeAreaInsets = (
  vars.platform.isReactNative ? getSafeAreaInsetsFromArgs : getSafeAreaInsetsFromState
);

export const getSafeAreaWidth = (
  vars.platform.isReactNative ? getSafeAreaWidthFromArgs : getSafeAreaWidthFromState
);

export const getSafeAreaHeight = (
  vars.platform.isReactNative ? getSafeAreaHeightFromArgs : getSafeAreaHeightFromState
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

export const getTailwind = createSelector(
  safeAreaWidth => safeAreaWidth,
  (__, themeMode) => themeMode,
  (safeAreaWidth, themeMode) => {
    return (classStr) => {
      return tailwind(classStr, safeAreaWidth, themeMode);
    };
  },
);

export const makeIsTimePickHourItemSelected = () => {
  return createSelector(
    state => state.timePick.hour,
    (__, item) => item,
    (hour, item) => {
      return hour === item;
    }
  );
};

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
  state => state.display.selectingLinkId,
  state => state.images,
  state => state.customEditor,
  (links, selectingLinkId, images, customEditor) => {
    const editor = { ...customEditor };

    const link = getLink(selectingLinkId, links);
    if (isObject(link)) {
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
    (_, listName) => listName,
    (doForceLock, lockedLists, listName) => {
      return getLockListStatus(doForceLock, lockedLists, listName);
    },
  );
};

export const getCurrentLockListStatus = createSelector(
  state => state.display.doForceLock,
  state => state.lockSettings.lockedLists,
  state => state.display.listName,
  state => state.display.queryString,
  (doForceLock, lockedLists, listName, queryString) => {
    if (queryString) {
      if (doForceLock) return LOCKED;
      return null;
    }
    return getLockListStatus(doForceLock, lockedLists, listName);
  },
);

export const getCanChangeListNames = createSelector(
  state => state.display.doForceLock,
  state => state.lockSettings.lockedLists,
  state => state.display.listName,
  state => state.display.queryString,
  (doForceLock, lockedLists, listName, queryString) => {
    if (queryString) return true;
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

export const makeGetTagStatus = () => {
  return createSelector(
    state => getTagFPaths(state),
    state => state.pendingTags,
    (__, linkIdOrObj) => isObject(linkIdOrObj) ? linkIdOrObj.id : linkIdOrObj,
    (tagFPaths, pendingTags, linkId) => {
      if (!isString(linkId)) return null;

      const tags = getTags(tagFPaths, pendingTags);
      const linkMainId = getMainId(linkId);
      if (linkMainId in tags) {
        if ('status' in tags[linkMainId]) return tags[linkMainId].status;
        return TAGGED;
      }

      return null;
    }
  );
};

export const makeGetTnAndDns = () => {
  return createSelector(
    state => getTagFPaths(state),
    state => state.pendingTags,
    state => state.settings.tagNameMap,
    (__, link) => isObject(link) ? link.id : null,
    (tagFPaths, pendingTags, tagNameMap, linkId) => {
      if (!isString(linkId)) return [];

      const tags = getTags(tagFPaths, pendingTags);
      const mainId = getMainId(linkId);
      if (!isObject(tags[mainId])) return [];

      const tnAndDns = [];
      for (const { tagName } of tags[mainId].values) {
        const { tagNameObj } = getTagNameObj(tagName, tagNameMap);
        if (!isObject(tagNameObj)) continue;
        tnAndDns.push({
          tagName, displayName: tagNameObj.displayName, color: tagNameObj.color,
        });
      }
      return tnAndDns;
    },
    {
      memoizeOptions: {
        resultEqualityCheck: (x, y) => {
          if (x.length !== y.length) return false;
          for (let i = 0; i < x.length; i++) {
            if (!isEqual(x[i], y[i])) return false;
          }
          return true;
        },
      },
    },
  );
};

export const makeGetTagNameEditor = () => {
  return createSelector(
    state => state.settings.tagNameMap,
    state => state.tagNameEditors,
    (__, key) => key,
    (tagNameMap, tagNameEditors, key) => {
      const state = { ...initialTagNameEditorState };

      const { tagNameObj } = getTagNameObj(key, tagNameMap);
      if (tagNameObj) state.value = tagNameObj.displayName;

      return { ...state, ...tagNameEditors[key] };
    },
    { memoizeOptions: { resultEqualityCheck: isEqual } },
  );
};
