import { FETCH_LINKS, ADD_LINK, MOVE_LINKS_ADD_STEP, MOVE_LINKS_DELETE_STEP, DELETE_LINKS } from '../types/actionTypes';

const initialState = {
  'My List': null,
  'Trash': null,
  'Archive': null,
};

export default (state = initialState, action) => {

  if (action.type === FETCH_LINKS) {

  }

  if (action.type === ADD_LINK) {

  }

  if (action.type === MOVE_LINKS_ADD_STEP) {

  }

  if (action.type === MOVE_LINKS_DELETE_STEP) {

  }

  if (action.type === DELETE_LINKS) {

  }

  return state;
};
