import { REHYDRATE } from 'redux-persist/constants';

import { INIT, UPDATE_USER, RESET_STATE } from '../types/actionTypes';

const initialState = {
  isUserSignedIn: null,
  username: null,
  image: null,
  hubUrl: null,
};

const userReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === INIT) {
    return {
      ...state,
      isUserSignedIn: action.payload.isUserSignedIn,
      username: action.payload.username,
      image: action.payload.userImage,
      hubUrl: action.payload.userHubUrl,
    };
  }

  if (action.type === UPDATE_USER) {
    return { ...state, ...action.payload };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState, isUserSignedIn: false };
  }

  return state;
};

export default userReducer;
