import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import {
  ID, STATUS,
  ADDED, MOVED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING,
  DIED_REMOVING, DIED_DELETING,
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
} from '../types/const';
import { FETCH_MORE } from '../types/actionTypes';
import {
  _, isStringIn, excludeWithMainIds,
  isObject, isArrayEqual, isEqual,
  doContainListName, isOfflineAction,
} from '../utils';

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

    const listNames = Object.keys(state.links);
    const listNameMap = [...state.settings.listNameMap.filter(listNameObj => {
      return [ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING].includes(listNameObj.status);
    })];

    let i = 1;
    for (const listName of listNames) {
      // Not in listNameMap and also deleting list name in state.settings.listNameMap.
      if (!doContainListName(listName, state.settings.listNameMap)) {
        listNameMap.push({ listName: listName, displayName: `<missing-name-${i}>` });
        i += 1;
      }
    }

    return listNameMap;
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
      )
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
    const sortedLinks = Object.values(filteredLinks).sort((a, b) => {
      if (a.addedDT > b.addedDT) {
        return -1;
      }
      if (a.addedDT < b.addedDT) {
        return 1;
      }
      return 0;
    });
    if (!doDescendingOrder) sortedLinks.reverse();

    if (searchString === '') {
      return sortedLinks;
    }

    const searchLinks = sortedLinks.filter(link => {
      return isStringIn(link, searchString);
    });

    return searchLinks;
  }
);

const createSelectorPopupLink = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {

    if (prevVal['display'].listName !== val['display'].listName) return false;
    if (prevVal['display'].searchString !== val['display'].searchString) return false;

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
      )
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

/** @return {function(any, any): any} */
export const makeIsLinkIdSelected = () => {
  return createSelector(
    state => state.display.selectedLinkIds,
    (_, props) => props.linkId,
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

const createSelectorIsFetchingMore = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {

    // Return false(different) only if list name changed or FETCH_MORE changed!
    if (prevVal['display'].listName !== val['display'].listName) return false;

    const listName = val['display'].listName;

    let prevOutbox = prevVal['offline'].outbox;
    let outbox = val['offline'].outbox;

    if (Array.isArray(prevOutbox)) prevOutbox = prevOutbox.filter(action => {
      return isOfflineAction(action, FETCH_MORE, listName);
    });
    if (Array.isArray(outbox)) outbox = outbox.filter(action => {
      return isOfflineAction(action, FETCH_MORE, listName);
    });

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
