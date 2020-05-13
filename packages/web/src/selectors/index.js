import { createSelector } from 'reselect';

import {
  ID, STATUS,
  ADDING, ADDED, MOVING, DIED_ADDING, DIED_MOVING, DIED_REMOVING, DIED_DELETING,
  IS_POPUP_SHOWN,
} from '../types/const';
import { _, isStringIn, excludeWithMainIds } from '../utils';

export const getListNames = createSelector(
  state => Object.keys(state.links),
  listNames => listNames
);

export const getLinks = createSelector(
  state => state.links,
  state => state.display.listName,
  state => state.display.searchString,
  (links, listName, searchString) => {
    if (!links || !links[listName]) return { links: null, popupLink: null };

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
      return { links: sortedLinks, popupLink: popupLink };
    }

    if (popupLink) {
      if (!isStringIn(popupLink, searchString)) {
        popupLink = null;
      }
    }

    const searchLinks = sortedLinks.filter(link => {
      return isStringIn(link, searchString);
    });

    return { links: searchLinks, popupLink: popupLink };
  }
);
