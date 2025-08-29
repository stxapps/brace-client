import { REHYDRATE } from 'redux-persist/constants';

import {
  MOVE_LINKS_ADD_STEP, MOVE_LINKS_ADD_STEP_COMMIT, MOVE_LINKS_ADD_STEP_ROLLBACK,
  CANCEL_DIED_LINKS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { MOVING, DIED_MOVING } from '../types/const';

const initialState = {};

const pendingSsltsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.pendingSslts };
  }

  if (action.type === MOVE_LINKS_ADD_STEP) {
    const { listNames, links } = action.payload;

    const newState = { ...state };
    for (let i = 0; i < listNames.length; i++) {
      const [listName, link] = [listNames[i], links[i]];
      newState[link.id] = { listName, status: MOVING };
    }
    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP_COMMIT) {
    const {
      successListNames, successLinks, errorListNames, errorLinks,
    } = action.payload;

    const newState = { ...state };
    for (let i = 0; i < successListNames.length; i++) {
      const link = successLinks[i];
      delete newState[link.id];
    }
    for (let i = 0; i < errorListNames.length; i++) {
      const [listName, link] = [errorListNames[i], errorLinks[i]];
      newState[link.id] = { listName, status: DIED_MOVING };
    }
    return newState;
  }

  if (action.type === MOVE_LINKS_ADD_STEP_ROLLBACK) {
    const { listNames, links } = action.meta;

    const newState = { ...state };
    for (let i = 0; i < listNames.length; i++) {
      const [listName, link] = [listNames[i], links[i]];
      newState[link.id] = { listName, status: DIED_MOVING };
    }
    return newState;
  }

  if (action.type === CANCEL_DIED_LINKS) {
    const { ids } = action.payload;

    const newState = { ...state };
    for (const id of ids) {
      delete newState[id];
    }
    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default pendingSsltsReducer;
