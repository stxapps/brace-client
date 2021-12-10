import { REHYDRATE } from 'redux-persist/constants';

import { UPDATE_POPUP, UPDATE_STACKS_ACCESS } from '../types/actionTypes';
import { ALL, SIGN_UP_POPUP, SIGN_IN_POPUP } from '../types/const';

const initialState = {
  // As transfer btw RN and Webview, all values are string
  viewId: '1',
  walletData: '',
};

const stacksAccessReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_STACKS_ACCESS) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id } = action.payload;

    if ([ALL, SIGN_UP_POPUP, SIGN_IN_POPUP].includes(id)) return { ...initialState };
    return state;
  }

  return state;
};

export default stacksAccessReducer;
