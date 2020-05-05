import { createSelector } from 'reselect';

import {
  ID, STATUS,
  ADDING, ADDED, DIED_ADDING, DIED_REMOVING, IS_POPUP_SHOWN,
} from '../types/const';
import { _ } from '../utils';

export const getListNames = createSelector(
  state => Object.keys(state.links),
  listNames => listNames
);

export const getLinks = createSelector(
  state => state.links,
  state => state.display.listName,
  state => state.display.searchString,
  (links, listName, searchString) => {
    if (!links || !links[listName]) return null;

    const selectedLinks = _.select(links[listName], STATUS, [ADDING, ADDED, DIED_ADDING, DIED_REMOVING]);
    const adding_ids = [];
    for (const key in links) {
      if (key === listName || !links[key]) {
        continue;
      }
      adding_ids.push(..._.extract(_.select(links[key], STATUS, ADDING), ID));
    }
    const filteredLinks = _.exclude(selectedLinks, ID, adding_ids);

    const popupLinks = _.select(filteredLinks, IS_POPUP_SHOWN, true);
    let popupLink = null;
    for (const key in popupLinks) {
      popupLink = popupLinks[key];
      break;
    }

    const sortedLinks = Object.values(filteredLinks).sort((a, b) => {
      if (a.added_dt > b.added_dt) {
        return -1;
      }
      if (a.added_dt < b.added_dt) {
        return 1;
      }
      return 0;
    });

    if (searchString === '') {
      return { links: sortedLinks, popupLink: popupLink };
    }

    // TODO: filter with search string
    throw new Error('Not implemented yet');
  }
);
