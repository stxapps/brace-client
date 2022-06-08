import { REHYDRATE } from 'redux-persist/constants';

import { RESET_STATE } from '../types/actionTypes';
import { cachedFPaths } from '../vars';

const initialState = {
  fpaths: null,
};

const cachedFPathsReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    if (action.payload.cachedFPaths && action.payload.cachedFPaths.fpaths) {
      // No new object for fpaths for reference comparison
      cachedFPaths.fpaths = action.payload.cachedFPaths.fpaths;
      return { ...initialState, fpaths: cachedFPaths.fpaths };
    }
    return { ...initialState };
  }

  if (action.type === RESET_STATE) {
    // Only RESET_STATE, no need to reset state for DELETE_ALL_DATA
    cachedFPaths.fpaths = null;
    return { ...initialState };
  }

  if (state.fpaths !== cachedFPaths.fpaths) {
    // No new object for fpaths for reference comparison
    return { ...state, fpaths: cachedFPaths.fpaths };
  }

  return state;
};

export default cachedFPathsReducer;
