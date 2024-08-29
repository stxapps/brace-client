import axios from '../axiosWrapper';
import iapApi from '../paddleWrapper';
import lsgApi from '../apis/localSg';
import ecApi from '../apis/encryption';
import {
  GET_PRODUCTS, GET_PRODUCTS_COMMIT, GET_PRODUCTS_ROLLBACK, REQUEST_PURCHASE,
  REQUEST_PURCHASE_COMMIT, REQUEST_PURCHASE_ROLLBACK, RESTORE_PURCHASES,
  RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK, REFRESH_PURCHASES,
  REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK, UPDATE_IAP_PUBLIC_KEY,
  UPDATE_IAP_PRODUCT_STATUS, UPDATE_IAP_PURCHASE_STATUS, UPDATE_IAP_RESTORE_STATUS,
  UPDATE_IAP_REFRESH_STATUS,
} from '../types/actionTypes';
import {
  N_DAYS, IAP_VERIFY_URL, IAP_STATUS_URL, PADDLE, COM_BRACEDOTTO,
  COM_BRACEDOTTO_SUPPORTER, SIGNED_TEST_STRING, VALID, INVALID, ACTIVE, UNKNOWN,
  PADDLE_RANDOM_ID,
} from '../types/const';
import { sleep, sample, getLatestPurchase, getValidPurchase } from '../utils';
import vars from '../vars';

const _verifyPurchase = async (rawPurchase) => {
  if (!rawPurchase) return { status: INVALID };

  const source = PADDLE;

  const sigObj = await ecApi.signECDSA(SIGNED_TEST_STRING);
  const userId = sigObj.publicKey;

  const productId = rawPurchase.productId;
  const token = rawPurchase.purchaseToken;
  const paddleUserId = rawPurchase.paddleUserId;
  const passthrough = rawPurchase.passthrough;

  if (!token) {
    console.log('No purchaseToken in rawPurchase');
    return { status: INVALID };
  }

  const reqBody = { source, userId, productId, token, paddleUserId, passthrough };

  let verifyResult;
  try {
    const res = await axios.post(IAP_VERIFY_URL, reqBody);
    verifyResult = res.data;
  } catch (error) {
    console.log(`Error when contact IAP server to verify with reqBody: ${JSON.stringify(reqBody)}, Error: `, error);
    return { status: UNKNOWN };
  }

  return verifyResult;
};

const verifyPurchase = async (rawPurchase) => {
  // Sometimes the servers doesn't return the latest result, so wait and try again.
  const nTries = 3;

  let result;
  for (let currentTry = 1; currentTry <= nTries; currentTry++) {
    result = await _verifyPurchase(rawPurchase);
    if (result.status === VALID) return result;
    if (currentTry < nTries) await sleep(sample([3000, 4500, 6000]));
  }
  return result;
};

const getIapStatus = async (doForce) => {
  const sigObj = await ecApi.signECDSA(SIGNED_TEST_STRING);
  const randomId = await lsgApi.getItem(PADDLE_RANDOM_ID);
  const reqBody = {
    source: PADDLE,
    userId: sigObj.publicKey,
    signature: sigObj.signature,
    appId: COM_BRACEDOTTO,
    doForce: doForce,
    randomId: randomId,
  };

  const res = await axios.post(IAP_STATUS_URL, reqBody);
  return res;
};

const getPurchases = (
  action, commitAction, rollbackAction, doForce, serverOnly
) => async (dispatch, getState) => {

  const { purchaseState, restoreStatus, refreshStatus } = getState().iap;
  if (
    purchaseState === REQUEST_PURCHASE ||
    restoreStatus === RESTORE_PURCHASES ||
    refreshStatus === REFRESH_PURCHASES
  ) return;

  dispatch({ type: action });

  let statusResult;
  try {
    const res = await getIapStatus(doForce);
    statusResult = res.data;

    if (serverOnly) {
      dispatch({ type: commitAction, payload: statusResult });
      return;
    }

    if (statusResult.status === VALID) {
      const purchase = getLatestPurchase(statusResult.purchases);
      if (purchase && purchase.status === ACTIVE) {
        dispatch({ type: commitAction, payload: statusResult });
        return;
      }
    }
  } catch (error) {
    console.log('Error when contact IAP server to get purchases: ', error);
    dispatch({ type: rollbackAction });
    return;
  }

  dispatch({ type: commitAction, payload: statusResult });
};

const iapUpdatedListener = (dispatch, getState) => async (rawPurchase) => {
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

const iapErrorListener = (dispatch, getState) => async (error) => {
  console.log('Error in iapErrorListener: ', error);
  if (error.code === 'E_USER_CANCELLED') {
    // It's possible that a user completes the purchase,
    //   but iapUpdatedListener doesn't get called and the user just close the popup.
    // PS1. No need redundant in requestPurchase's catch block.
    // PS2. No await, do it in the background, in case really no purchase.
    checkRequestPurchase(dispatch, getState);
    dispatch(updateIapPurchaseStatus(null, null));
  } else {
    dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
  }
};

const registerIapListeners = (doRegister, dispatch, getState) => {
  if (doRegister) {
    if (!vars.iap.updatedEventEmitter) {
      vars.iap.updatedEventEmitter = iapApi.purchaseUpdatedListener(
        iapUpdatedListener(dispatch, getState)
      );
    }
    if (!vars.iap.errorEventEmitter) {
      vars.iap.errorEventEmitter = iapApi.purchaseErrorListener(
        iapErrorListener(dispatch, getState)
      );
    }
  } else {
    if (vars.iap.updatedEventEmitter) {
      vars.iap.updatedEventEmitter.remove();
      vars.iap.updatedEventEmitter = null;
    }
    if (vars.iap.errorEventEmitter) {
      vars.iap.errorEventEmitter.remove();
      vars.iap.errorEventEmitter = null;
    }
  }
};

export const endIapConnection = (isInit = false) => async (dispatch, getState) => {
  registerIapListeners(false, dispatch, getState);

  if (!isInit) {
    vars.iap.didGetProducts = false;
    dispatch(updateIapProductStatus(null, null, null));
  }
};

export const initIapConnectionAndGetProducts = (doForce) => async (
  dispatch, getState
) => {
  if (vars.iap.didGetProducts && !doForce) return;
  vars.iap.didGetProducts = true;
  dispatch({ type: GET_PRODUCTS });

  if (doForce) await endIapConnection(true)(dispatch, getState);

  try {
    const canMakePayments = await iapApi.initConnection();
    registerIapListeners(true, dispatch, getState);

    let products = null;
    if (canMakePayments) {
      products = await iapApi.getSubscriptions([COM_BRACEDOTTO_SUPPORTER]);
    }

    dispatch({
      type: GET_PRODUCTS_COMMIT,
      payload: { canMakePayments, products },
    });
  } catch (error) {
    console.log('Error when init iap and get products: ', error);
    dispatch({ type: GET_PRODUCTS_ROLLBACK });
  }
};

export const requestPurchase = (product) => async (dispatch, getState) => {
  dispatch({ type: REQUEST_PURCHASE });
  try {
    await iapApi.requestSubscription(product.productId);
  } catch (error) {
    console.log('Error when request purchase: ', error);
    if (error.code === 'E_USER_CANCELLED') {
      dispatch(updateIapPurchaseStatus(null, null));
    } else {
      dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
    }
  }
};

const checkRequestPurchase = async (dispatch, getState) => {
  const { purchases } = getState().info;
  const purchase = getValidPurchase(purchases);
  if (purchase) return;

  try {
    const res = await getIapStatus(false);
    const statusResult = res.data;

    if (statusResult.status === VALID) {
      const purchase = getValidPurchase(statusResult.purchases);
      if (purchase) {
        dispatch({
          type: REQUEST_PURCHASE_COMMIT,
          payload: { status: statusResult.status, purchase, rawPurchase: null },
        });
        return;
      }
    }
  } catch (error) {
    console.log('checkRequestPurchase error:', error);
  }
};

export const restorePurchases = () => async (dispatch, getState) => {
  await getPurchases(
    RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
    false, false
  )(dispatch, getState);
};

export const refreshPurchases = () => async (dispatch, getState) => {
  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    true, false
  )(dispatch, getState);
};

export const checkPurchases = () => async (dispatch, getState) => {
  const { purchases, checkPurchasesDT } = getState().info;

  const purchase = getValidPurchase(purchases);
  if (!purchase) return;

  const now = Date.now();
  const expiryDT = (new Date(purchase.expiryDate)).getTime();

  let doCheck = false;
  if (now >= expiryDT || !checkPurchasesDT) doCheck = true;
  else {
    let p = 1.0 / (N_DAYS * 24 * 60 * 60 * 1000) * Math.abs(now - checkPurchasesDT);
    p = Math.max(0.01, Math.min(p, 0.99));
    doCheck = p > Math.random();
  }
  if (!doCheck) return;

  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    false, true
  )(dispatch, getState);
};

export const retryVerifyPurchase = () => async (dispatch, getState) => {
  const rawPurchase = getState().iap.rawPurchase;

  dispatch({ type: REQUEST_PURCHASE });
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

export const updateIapPublicKey = () => async (dispatch, getState) => {
  const sigObj = await ecApi.signECDSA(SIGNED_TEST_STRING);
  dispatch({ type: UPDATE_IAP_PUBLIC_KEY, payload: sigObj.publicKey });
};

export const updateIapProductStatus = (status, canMakePayments, products) => {
  return {
    type: UPDATE_IAP_PRODUCT_STATUS,
    payload: { status, canMakePayments, products },
  };
};

export const updateIapPurchaseStatus = (status, rawPurchase) => {
  return {
    type: UPDATE_IAP_PURCHASE_STATUS,
    payload: { status, rawPurchase },
  };
};

export const updateIapRestoreStatus = (status) => {
  return {
    type: UPDATE_IAP_RESTORE_STATUS,
    payload: status,
  };
};

export const updateIapRefreshStatus = (status) => {
  return {
    type: UPDATE_IAP_REFRESH_STATUS,
    payload: status,
  };
};
