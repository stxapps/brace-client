import { UPDATE_POPUP } from '../types/actionTypes';
import { REHYDRATE } from 'redux-persist/constants'

const initialState = {
  'listName': 'My List',
  'listSize': 30,
  'searchString': '',
  'isPopupShown': false,
};

export default (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...state, ...action.payload.display, isPopupShown: false };
  }

  if (action.type === UPDATE_POPUP) {
    return { ...state, isPopupShown: action.payload };
  }

  return state;
};
