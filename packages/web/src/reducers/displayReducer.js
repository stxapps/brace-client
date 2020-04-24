import { UPDATE_POPUP } from '../types/actions';
import { REHYDRATE } from 'redux-persist/constants'

const initialState = {
  'isPopupShown': false,
  'showingList': 'My List',
  'My List': [],
  'Trash': [],
  'Archive': [],
};

export default (state=initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...action.payload.display, isPopupShown: false };
  }

  if (action.type === UPDATE_POPUP) {
    return { ...state, isPopupShown: action.payload };
  }

  return state;
};
