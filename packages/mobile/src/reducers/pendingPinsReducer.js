import { REHYDRATE } from 'redux-persist/constants';
import { loop, Cmd } from 'redux-loop';

import { cleanUpPins } from '../actions';
import {
  PIN_LINK, PIN_LINK_COMMIT, PIN_LINK_ROLLBACK, UNPIN_LINK, UNPIN_LINK_COMMIT,
  UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP, MOVE_PINNED_LINK_ADD_STEP_COMMIT,
  MOVE_PINNED_LINK_ADD_STEP_ROLLBACK, CANCEL_DIED_PINS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

/* {
  [link-id-1]: { status, rank, addedDT, id },
  [link-id-2]: { status, rank, addedDT, id },
  ...
} */
const initialState = {};

const pendingPinsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState, ...action.payload.pendingPins };
  }

  if (action.type === PIN_LINK || action.type === UNPIN_LINK) {
    const { pins } = action.payload;

    const newState = { ...state };
    for (const pin of pins) newState[pin.id] = { ...pin, status: action.type };

    return newState;
  }

  if (action.type === PIN_LINK_COMMIT || action.type === UNPIN_LINK_COMMIT) {
    const { pins } = action.meta;

    const newState = { ...state };
    for (const pin of pins) delete newState[pin.id];

    return loop(newState, Cmd.run(cleanUpPins(), { args: [Cmd.dispatch, Cmd.getState] }));
  }

  if (action.type === PIN_LINK_ROLLBACK || action.type === UNPIN_LINK_ROLLBACK) {
    const { pins } = action.meta;

    const newState = { ...state };
    for (const pin of pins) newState[pin.id] = { ...pin, status: action.type };

    return newState;
  }

  if (action.type === MOVE_PINNED_LINK_ADD_STEP) {
    const pin = action.payload;
    return { ...state, [pin.id]: { ...pin, status: action.type } };
  }

  if (action.type === MOVE_PINNED_LINK_ADD_STEP_COMMIT) {
    const { id } = action.meta;

    const newState = { ...state };
    delete newState[id];

    return loop(
      newState,
      Cmd.run(cleanUpPins(), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === MOVE_PINNED_LINK_ADD_STEP_ROLLBACK) {
    const pin = action.meta;
    return { ...state, [pin.id]: { ...pin, status: action.type } };
  }

  if (action.type === CANCEL_DIED_PINS) {
    const newState = {};
    for (const id in state) {
      if ([
        PIN_LINK_ROLLBACK, UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
      ].includes(state[id].status)) continue;

      newState[id] = { ...state[id] };
    }
    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default pendingPinsReducer;
