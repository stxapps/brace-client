import { REHYDRATE } from 'redux-persist/constants'

import { INIT, UPDATE_USER, RESET_STATE } from '../types/actionTypes';

const initialState = {
  isUserSignedIn: null,
  username: null,
  image: null,
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === INIT) {
    return { ...state, isUserSignedIn: action.payload.isUserSignedIn };
  }

  if (action.type === UPDATE_USER) {
    return { ...state, ...action.payload };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};
