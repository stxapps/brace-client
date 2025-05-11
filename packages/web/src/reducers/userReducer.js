import { REHYDRATE } from 'redux-persist/constants';

import { INIT, UPDATE_USER, UPDATE_HUB_ADDR, RESET_STATE } from '../types/actionTypes';
import vars from '../vars';

const initialState = {
  isUserSignedIn: null,
  username: null,
  image: null,
  hubUrl: null,
  hubAddr: null,
};

const userReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    vars.user.hubUrl = initialState.hubUrl;
    return { ...initialState };
  }

  if (action.type === INIT) {
    vars.user.hubUrl = action.payload.userHubUrl;
    return {
      ...state,
      isUserSignedIn: action.payload.isUserSignedIn,
      username: action.payload.username,
      image: action.payload.userImage,
      hubUrl: action.payload.userHubUrl,
    };
  }

  if (action.type === UPDATE_USER) {
    vars.user.hubUrl = action.payload.hubUrl;
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_HUB_ADDR) {
    return { ...state, hubAddr: action.payload.hubAddr };
  }

  if (action.type === RESET_STATE) {
    vars.user.hubUrl = initialState.hubUrl;
    return { ...initialState, isUserSignedIn: false };
  }

  return state;
};

export default userReducer;
