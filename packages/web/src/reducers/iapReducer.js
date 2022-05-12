import { REHYDRATE } from 'redux-persist/constants';

import {
  RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
  UPDATE_IAP_RESTORE_STATUS, UPDATE_POPUP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { ALL, SETTINGS_POPUP } from '../types/const';

const initialState = {
  canMakePayments: null,
  products: null,
  purchaseStatus: null,
  restoreStatus: null,
};

const iapReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === RESTORE_PURCHASES) {
    return { ...state, restoreStatus: RESTORE_PURCHASES };
  }

  if (action.type === RESTORE_PURCHASES_COMMIT) {
    const { status } = action.payload;
    return { ...state, restoreStatus: status };
  }

  if (action.type === RESTORE_PURCHASES_ROLLBACK) {
    return { ...state, restoreStatus: RESTORE_PURCHASES_ROLLBACK };
  }

  if (action.type === UPDATE_IAP_RESTORE_STATUS) {
    return { ...state, restoreStatus: action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id } = action.payload;

    if ([ALL, SETTINGS_POPUP].includes(id)) return { ...state, restoreStatus: null };
    return state;
  }

  if (action.type === DELETE_ALL_DATA) {
    return state;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default iapReducer;
