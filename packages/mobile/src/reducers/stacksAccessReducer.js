import {
  UPDATE_POPUP, UPDATE_STACKS_ACCESS,
} from '../types/actionTypes';
import { REHYDRATE } from 'redux-persist/constants';

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
    return { ...state };
  }

  return state;
};

export default stacksAccessReducer;
