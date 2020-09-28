import { createSelectorCreator, defaultMemoize } from 'reselect';

import {
  ID, STATUS,
  ADDING, ADDED, MOVING, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION,
} from '../types/const';
import {
  _, isStringIn, excludeWithMainIds,
  isObject, isString, isArrayEqual, isEqual,
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

    if (isString(prevVal) || isString(val)) return prevVal === val;
    if (prevVal === val) return true;
    if (isObject(prevVal) && isObject(val)) {

      // Assume these are prevLinks and links
      if (!isArrayEqual(Object.keys(prevVal).sort(), Object.keys(val).sort())) {
        return false;
      }

      const results = [];
      for (const key in val) {
        // Deep equal without attributes: popup and popupAnchorPosition.
        const res = isEqual(
          _.ignore(prevVal[key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]),
          _.ignore(val[key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION])
        )
        results.push(res);
      }

      return results.every(res => res === true);
    }

    return prevVal === val;
  }
);

export const getLinks = createSelectorLinks(
  state => state.links,
  state => state.display.listName,
  state => state.display.searchString,
  (links, listName, searchString) => {

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

    if (isString(prevVal) || isString(val)) return prevVal === val;
    if (prevVal === val) return true;
    if (isObject(prevVal) && isObject(val)) {

      // Assume these are prevLinks and links
      if (!isArrayEqual(Object.keys(prevVal).sort(), Object.keys(val).sort())) {
        return false;
      }

      const results = [];
      for (const key in val) {
        // Deep equal only attributes: popup and popupAnchorPosition.
        const res = isEqual(
          _.choose(prevVal[key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION]),
          _.choose(val[key], [IS_POPUP_SHOWN, POPUP_ANCHOR_POSITION])
        )
        results.push(res);
      }

      return results.every(res => res === true);
    }

    return prevVal === val;
  }
);

export const getPopupLink = createSelectorPopupLink(
  state => state.links,
  state => state.display.listName,
  state => state.display.searchString,
  (links, listName, searchString) => {

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
