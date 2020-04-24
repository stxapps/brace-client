import { INIT, UPDATE_WINDOW, UPDATE_HISTORY_POSITION } from '../types/actions';
import { REHYDRATE } from 'redux-persist/constants'

const initialState = {
  href: null,
  historyPosition: null,
};

export default (state=initialState, action) => {

  if (action.type === REHYDRATE) {
    return {...initialState};
  }

  if (action.type === INIT) {
    return {
      ...state,
      href: action.payload.href,
    };
  }

  if (action.type === UPDATE_WINDOW) {
    return {
      ...state,
      href: action.payload.href,
      historyPosition: action.payload.historyPosition,
    };
  }

  if (action.type === UPDATE_HISTORY_POSITION) {
    return { ...state, historyPosition: action.payload }
  }

  return state;
};
