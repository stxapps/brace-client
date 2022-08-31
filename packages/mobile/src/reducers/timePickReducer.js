import {
  UPDATE_UPDATING_THEME_MODE, UPDATE_TIME_PICK, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {
  updatingThemeMode: null,
  hour: null,
  minute: null,
  period: null,
};

const timePickReducer = (state = initialState, action) => {

  if (action.type === UPDATE_UPDATING_THEME_MODE) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_TIME_PICK) {
    return { ...state, ...action.payload };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default timePickReducer;
