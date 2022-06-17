import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import { IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION, PINNED } from '../types/const';
import {
  isStringIn, isObject, isArrayEqual, isEqual,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  getFilteredLinks, getSortedLinks, sortWithPins, getPinFPaths, getPins,
  doEnableExtraFeatures,
} from '../utils';
import { _ } from '../utils/obj';
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

export const getDoEnableExtraFeatures = createSelector(
  state => state.settings.purchases,
  purchases => doEnableExtraFeatures(purchases),
);

/** @return {function(any, any): any} */
export const makeGetPinStatus = () => {
  return createSelector(
    state => getPinFPaths(state),
    state => state.pendingPins,
    (__, link) => link ? link.id : null,
    (pinFPaths, pendingPins, linkId) => {

      if (!linkId) return null;

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
