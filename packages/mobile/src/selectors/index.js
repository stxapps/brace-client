import { createSelectorCreator, defaultMemoize } from 'reselect';

import {
  ID, STATUS,
  ADDING, ADDED, MOVING, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
} from '../types/const';
import {
  _, isStringIn, excludeWithMainIds,
  isObject, isArrayEqual, isEqual,
} from '../utils';

const createSelectorListNames = createSelectorCreator(
  defaultMemoize,
  (prevLinks, links) => {
    if (!isObject(prevLinks) || !isObject(links)) {
      return prevLinks === links;
    }
    return isArrayEqual(Object.keys(prevLinks).sort(), Object.keys(links).sort());
  }
);

export const getListNames = createSelectorListNames(
  state => state.links,
  links => Object.keys(links)
);

const createSelectorLinks = createSelectorCreator(
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

    if (!links || !links[listName]) return null;

    const selectedLinks = _.select(links[listName], STATUS, [ADDING, ADDED, MOVING, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING]);

    const moving_ids = [];
    for (const key in links) {
      if (key === listName || !links[key]) {
        continue;
      }
      moving_ids.push(..._.extract(_.select(links[key], STATUS, [MOVING, DIED_MOVING]), ID));
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

    const selectedLinks = _.select(links[listName], STATUS, [ADDING, ADDED, MOVING, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING]);

    const moving_ids = [];
    for (const key in links) {
      if (key === listName || !links[key]) {
        continue;
      }
      moving_ids.push(..._.extract(_.select(links[key], STATUS, [MOVING, DIED_MOVING]), ID));
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
