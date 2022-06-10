import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import { IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, PINNED } from '../types/const';
import { FETCH_MORE } from '../types/actionTypes';
import {
  _, isStringIn, isObject, isArrayEqual, isEqual, isOfflineAction,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  extractPinFPath, getFilteredLinks, getSortedLinks,
} from '../utils';
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
        _.ignore(prevVal['links'][key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]),
        _.ignore(val['links'][key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION])
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

    const sortedLinks = getSortedLinks(links, listName, doDescendingOrder);
    if (!sortedLinks) return null;

    let pinFPaths = [];
    if (
      state.cachedFPaths.fpaths && Array.isArray(state.cachedFPaths.fpaths.pinFPaths)
    ) {
      pinFPaths = state.cachedFPaths.fpaths.pinFPaths;
    }

    const pinData = {};
    for (const fpath of pinFPaths) {
      const { addedDT, rank, id, ext } = extractPinFPath(fpath);
      const pinMainId = getMainId(id);

      // duplicate id, choose the latest addedDT
      if (pinMainId in pinData && pinData[pinMainId].addedDT > addedDT) continue;
      pinData[pinMainId] = { addedDT, rank, ext };
    }

    let processedLinks = [], pinnedLinks = [];
    for (const link of sortedLinks) {
      const id = getMainId(link.id);

      if (id in pinData) {
        pinnedLinks.push({ link, pinInfo: pinData[id] });
      } else {
        processedLinks.push(link);
      }
    }

    // sort pinnedLinks
    pinnedLinks = pinnedLinks.sort((objA, objB) => {
      if (objA.pinInfo.rank < objB.pinInfo.rank) return -1;
      if (objA.pinInfo.rank > objB.pinInfo.rank) return 1;
      return 0;
    }).map(obj => obj.link);

    processedLinks = [...pinnedLinks, ...processedLinks];

    if (searchString === '') {
      return processedLinks;
    }

    const searchLinks = processedLinks.filter(link => {
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

const createSelectorIsFetchingMore = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {

    // Return false(different) only if list name changed or FETCH_MORE changed!
    if (prevVal['display'].listName !== val['display'].listName) return false;

    const listName = val['display'].listName;

    let prevOutbox = prevVal['offline'].outbox;
    let outbox = val['offline'].outbox;

    if (Array.isArray(prevOutbox)) {
      prevOutbox = prevOutbox.filter(action => {
        return isOfflineAction(action, FETCH_MORE, listName);
      });
    }
    if (Array.isArray(outbox)) {
      outbox = outbox.filter(action => {
        return isOfflineAction(action, FETCH_MORE, listName);
      });
    }

    const x1 = Array.isArray(prevOutbox) && prevOutbox.length > 0 ? 1 : 0;
    const x2 = Array.isArray(outbox) && outbox.length > 0 ? 1 : 0;

    if (x1 + x2 === 0) return true;
    if (x1 + x2 === 1) return false;
    if (prevOutbox.length !== outbox.length) return false;

    for (let i = 0, l = outbox.length; i < l; i++) {
      if (!isEqual(prevOutbox[i], outbox[i])) return false;
    }
    return true;
  }
);

export const getIsFetchingMore = createSelectorIsFetchingMore(
  state => state,
  (state) => {

    const outbox = state.offline.outbox;
    if (!outbox || !Array.isArray(outbox)) return false;

    const listName = state.display.listName;
    for (const action of outbox) {
      if (isOfflineAction(action, FETCH_MORE, listName)) return true;
    }

    return false;
  }
);

/** @return {function(any, any): initialListNameEditorState} */
export const makeGetListNameEditor = () => {
  return createSelector(
    state => state.listNameEditors,
    (__, key) => key,
    (listNameEditors, key) => {
      return { ...initialListNameEditorState, ...listNameEditors[key] };
    },
    { memoizeOptions: { resultEqualityCheck: isEqual } },
  );
};

export const getValidProduct = createSelector(
  state => state.iap.products,
  products => _getValidProduct(products),
);

export const getValidPurchase = createSelector(
  state => state.settings.purchases,
  purchases => _getValidPurchase(purchases),
);

/** @return {function(any, any): any} */
export const makeGetPinLinkStatus = () => {
  return createSelector(
    state => state.pinLinkStatus,
    state => {
      if (
        state.cachedFPaths.fpaths && Array.isArray(state.cachedFPaths.fpaths.pinFPaths)
      ) {
        return state.cachedFPaths.fpaths.pinFPaths;
      }
      return null;
    },
    (__, link) => {
      if (link) return link.id;
      return null;
    },
    (pinLinkStatus, pinFPaths, linkId) => {

      if (!linkId) return null;
      if (linkId in pinLinkStatus) return pinLinkStatus[linkId];
      if (!Array.isArray(pinFPaths)) return null;

      const linkMainId = getMainId(linkId);
      for (const fpath of pinFPaths) {
        const { id } = extractPinFPath(fpath);
        const pinMainId = getMainId(id);
        if (linkMainId === pinMainId) return PINNED;
      }

      return null;
    }
  );
};
