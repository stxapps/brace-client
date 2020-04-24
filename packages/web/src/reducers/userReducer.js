import { INIT, UPDATE_USER } from '../types/actions';
import { REHYDRATE } from 'redux-persist/constants'

const initialState = {
  isUserSignedIn: null,
};

export default (state=initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...action.payload.user, isUserSignedIn: null };
  }

  if (action.type === INIT) {
    return { ...state, isUserSignedIn: action.payload.isUserSignedIn };
  }

  if (action.type === UPDATE_USER) {
    return { ...state, isUserSignedIn: action.payload.isUserSignedIn };
  }

  return state;
};
