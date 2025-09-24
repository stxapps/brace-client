import { REHYDRATE } from 'redux-persist/constants';

import {
  ACK_PERSIST_CALLBACK, INCREASE_REDIRECT_TO_MAIN_COUNT,
} from '../types/actionTypes';

const initialState = {
  didPersistCallback: false,
  redirectToMainCount: 0,
};

const appStateReducer = (state = initialState, action) => {
  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === ACK_PERSIST_CALLBACK) {
    return { ...state, didPersistCallback: true };
  }

  if (action.type === INCREASE_REDIRECT_TO_MAIN_COUNT) {
    return { ...state, redirectToMainCount: state.redirectToMainCount + 1 };
  }

  return state;
};

export default appStateReducer;
