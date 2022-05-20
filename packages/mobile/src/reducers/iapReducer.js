import { REHYDRATE } from 'redux-persist/constants';

import {
  GET_PRODUCTS, GET_PRODUCTS_COMMIT, GET_PRODUCTS_ROLLBACK,
  REQUEST_PURCHASE, REQUEST_PURCHASE_COMMIT, REQUEST_PURCHASE_ROLLBACK,
  RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
  REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
  UPDATE_IAP_PUBLIC_KEY, UPDATE_IAP_PRODUCT_STATUS, UPDATE_IAP_RESTORE_STATUS,
  UPDATE_IAP_REFRESH_STATUS, UPDATE_POPUP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { ALL, SETTINGS_POPUP } from '../types/const';

const initialState = {
  publicKey: null,
  canMakePayments: null,
  products: null,
  productStatus: null,
  purchaseStatus: null,
  restoreStatus: null,
  refreshStatus: null,
  rawPurchase: null,
};

const iapReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === GET_PRODUCTS) {
    return { ...state, productStatus: GET_PRODUCTS };
  }

  if (action.type === GET_PRODUCTS_COMMIT) {
    const { canMakePayments, products } = action.payload;
    return { ...state, productStatus: GET_PRODUCTS_COMMIT, canMakePayments, products };
  }

  if (action.type === GET_PRODUCTS_ROLLBACK) {
    return { ...state, productStatus: GET_PRODUCTS_ROLLBACK };
  }

  if (action.type === REQUEST_PURCHASE) {
    return { ...state, purchaseStatus: REQUEST_PURCHASE };
  }

  if (action.type === REQUEST_PURCHASE_COMMIT) {
    const { status, rawPurchase } = action.payload;
    return { ...state, purchaseStatus: status, rawPurchase };
  }

  if (action.type === REQUEST_PURCHASE_ROLLBACK) {
    if (state.purchaseStatus === null) return state;
    return { ...state, purchaseStatus: REQUEST_PURCHASE_ROLLBACK };
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

  if (action.type === REFRESH_PURCHASES) {
    return { ...state, refreshStatus: REFRESH_PURCHASES };
  }

  if (action.type === REFRESH_PURCHASES_COMMIT) {
    return { ...state, refreshStatus: REFRESH_PURCHASES_COMMIT };
  }

  if (action.type === REFRESH_PURCHASES_ROLLBACK) {
    return { ...state, refreshStatus: REFRESH_PURCHASES_ROLLBACK };
  }

  if (action.type === UPDATE_IAP_PUBLIC_KEY) {
    return { ...state, publicKey: action.payload };
  }

  if (action.type === UPDATE_IAP_PRODUCT_STATUS) {
    return { ...state, productStatus: action.payload };
  }

  if (action.type === UPDATE_IAP_RESTORE_STATUS) {
    return { ...state, restoreStatus: action.payload };
  }

  if (action.type === UPDATE_IAP_REFRESH_STATUS) {
    return { ...state, refreshStatus: action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id } = action.payload;

    if ([ALL, SETTINGS_POPUP].includes(id)) {
      return { ...state, restoreStatus: null, refreshStatus: null };
    }
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
