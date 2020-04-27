import { createSelector } from 'reselect';

const getAddingLinks = (state) => {
  if (state.searchString === '') {
    return state.links[state.display.listName].adding.map(x => {
      return { ...x, status: 'adding' };
    });
  }

  // TODO: filter with search string
  throw new Error('Not implemented yet');
}
const getAddedLinks = (state) => {
  if (state.searchString === '') {

    let adding_ids = [];
    for (const key in state.links) {
      if (key === state.display.listName) {
        continue;
      }

      adding_ids.push(...state.links[key].adding.map(x => x.id));
    }

    return state.links[state.display.listName].added.filter(x => !adding_ids.includes(x.id))
      .map(x => {
        return { ...x, status: 'added' };
      });
  }

  // TODO: filter with search string
  throw new Error('Not implemented yet');
}

export const getVisibleLinks = createSelector(
  [getAddingLinks, getAddedLinks],
  (adding, added) => {
    return [...adding, ...added].sort((a, b) => {
      if (a.added_dt > b.added_dt) {
        return -1;
      }
      if (a.added_dt < b.added_dt) {
        return 1;
      }
      return 0;
    });
  }
);
