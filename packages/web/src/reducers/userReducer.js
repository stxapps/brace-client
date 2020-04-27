import { INIT, UPDATE_USER } from '../types/actionTypes';
import { REHYDRATE } from 'redux-persist/constants'

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

  return state;
};
