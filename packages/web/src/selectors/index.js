import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import { extractPinFPath } from '../apis/blockstack';
import {
  ID, STATUS,
  ADDED, MOVED, ADDING, MOVING, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, PINNED,
} from '../types/const';
import { FETCH_MORE } from '../types/actionTypes';
import {
  _, isStringIn, excludeWithMainIds, isObject, isArrayEqual, isEqual, isOfflineAction,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
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

const doLinksEqual = (prevVal, val) => {

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
};

const createSelectorLinks = createSelectorCreator(defaultMemoize, doLinksEqual);

export const _getLinks = (state) => {
  const links = state.links;
  const listName = state.display.listName;

  if (!links || !links[listName]) return null;

  const selectedLinks = _.select(links[listName], STATUS, [ADDED, MOVED, ADDING, MOVING, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING]);

  const moving_ids = [];
  for (const key in links) {
    if (key === listName || !links[key]) {
      continue;
    }
    moving_ids.push(..._.extract(_.select(links[key], STATUS, [MOVED, MOVING, DIED_MOVING]), ID));
  }

  const filteredLinks = excludeWithMainIds(selectedLinks, moving_ids);

  return filteredLinks;
};

export const getLinks = createSelectorLinks(
  state => state,
  (state) => {

    const searchString = state.display.searchString;
    const doDescendingOrder = state.settings.doDescendingOrder;

    const filteredLinks = _getLinks(state);
    if (!filteredLinks) return null;

    const sortedLinks = Object.values(filteredLinks).sort((a, b) => {
      return b.addedDT - a.addedDT;
    });
    if (!doDescendingOrder) sortedLinks.reverse();

    let pinFPaths = [];
    if (
      state.cachedFPaths.fpaths && Array.isArray(state.cachedFPaths.fpaths.pinFPaths)
    ) {
      pinFPaths = state.cachedFPaths.fpaths.pinFPaths;
    }

    const pinData = {};
    for (const fpath of pinFPaths) {
      const { addedDT, rank, fname, ext } = extractPinFPath(fpath);
      const id = getMainId(fname);

      // duplicate id, choose the latest addedDT
      if (id in pinData && pinData[id].addedDT > addedDT) continue;
      pinData[id] = { addedDT, rank, ext };
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
      return objA.pinInfo.rank - objB.pinInfo.rank;
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

const createSelectorPopupLink = createSelectorCreator(defaultMemoize, doLinksEqual);

export const getPopupLink = createSelectorPopupLink(
  state => state,
  (state) => {

    const searchString = state.display.searchString;

    const filteredLinks = _getLinks(state);
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
    (__, props) => props.linkId,
    (pinLinkStatus, pinFPaths, linkId) => {

      if (linkId in pinLinkStatus) return pinLinkStatus[linkId];

      if (!Array.isArray(pinFPaths)) return null;

      const linkMainId = getMainId(linkId);
      for (const fpath of pinFPaths) {
        const { fname } = extractPinFPath(fpath);
        const id = getMainId(fname);
        if (linkMainId === id) return PINNED;
      }

      return null;
    }
  );
};
