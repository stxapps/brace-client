import { REHYDRATE } from 'redux-persist/constants';

import { addNextAction } from '../store-next';
import { cleanUpPins } from '../importWrapper';
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
    const { successPins, errorPins } = action.payload;

    let errorStatus = PIN_LINK_ROLLBACK;
    if (action.type === UNPIN_LINK_COMMIT) errorStatus = UNPIN_LINK_ROLLBACK;

    const newState = { ...state };
    for (const pin of successPins) delete newState[pin.id];
    for (const pin of errorPins) newState[pin.id] = { ...pin, status: errorStatus };

    if (errorPins.length === 0) {
      addNextAction(cleanUpPins());
      return newState;
    }
    return newState;
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
    const { successPins, errorPins } = action.payload;

    const newState = { ...state };
    for (const pin of successPins) delete newState[pin.id];
    for (const pin of errorPins) {
      newState[pin.id] = { ...pin, status: MOVE_PINNED_LINK_ADD_STEP_ROLLBACK };
    }

    if (errorPins.length === 0) {
      addNextAction(cleanUpPins());
      return newState;
    }
    return newState;
  }

  if (action.type === MOVE_PINNED_LINK_ADD_STEP_ROLLBACK) {
    const { rank, updatedDT, addedDT, id } = action.meta;
    return { ...state, [id]: { rank, updatedDT, addedDT, id, status: action.type } };
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
