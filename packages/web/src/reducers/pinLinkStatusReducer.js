import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import { movePinnedLinkDeleteStep } from '../actions';
import {
  PIN_LINK, PIN_LINK_COMMIT, PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_COMMIT,
  UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_COMMIT,
  MOVE_PINNED_LINK_ADD_STEP_ROLLBACK, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

/* {
  [link-id-1]: status,
  [link-id-2]: status,
  ...
} */
const initialState = {};

const pinLinkStatusReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.pinLinkStatus };
  }

  if (action.type === PIN_LINK || action.type === UNPIN_LINK) {
    const { pins } = action.payload;

    const newState = { ...state };
    for (const pin of pins) newState[pin.id] = action.type;

    return newState;
  }

  if (action.type === PIN_LINK_COMMIT || action.type === UNPIN_LINK_COMMIT) {
    const { pins } = action.meta;

    const newState = { ...state };
    for (const pin of pins) delete newState[pin.id];

    return newState;
  }

  if (action.type === PIN_LINK_ROLLBACK || action.type === UNPIN_LINK_ROLLBACK) {
    const { pins } = action.meta;

    const newState = { ...state };
    for (const pin of pins) newState[pin.id] = action.type;

    return newState;
  }

  if (action.type === MOVE_PINNED_LINK_ADD_STEP) {
    const { id } = action.payload;
    return { ...state, [id]: action.type };
  }

  if (action.type === MOVE_PINNED_LINK_ADD_STEP_COMMIT) {
    const { addedDT, id, fromRank } = action.meta;

    const newState = { ...state }
    delete newState[id];

    return loop(
      newState,
      Cmd.run(
        movePinnedLinkDeleteStep(fromRank, addedDT, id),
        { args: [Cmd.dispatch, Cmd.getState] }
      ),
    );
  }

  if (action.type === MOVE_PINNED_LINK_ADD_STEP_ROLLBACK) {
    const { id } = action.meta;
    return { ...state, [id]: action.type };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default pinLinkStatusReducer;
