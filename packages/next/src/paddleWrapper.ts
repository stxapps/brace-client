import lsgApi from './apis/localSg';
import ecApi from './apis/encryption';
import {
  DOMAIN_NAME, COM_BRACEDOTTO_SUPPORTER, SIGNED_TEST_STRING, PADDLE_RANDOM_ID,
  IAP_PADDLE_PRE_URL,
} from './types/const';
import { isObject, isString, randomString } from './utils';

let doSandbox = false;
if (typeof window !== 'undefined') {
  doSandbox = !window.location.href.startsWith(DOMAIN_NAME);
}

const getVendor = () => {
  return doSandbox ? 11185 : 163987;
};

const getProduct = (productId) => {
  if (productId !== COM_BRACEDOTTO_SUPPORTER) {
    throw new Error(`In paddleWrapper.getProduct, invalid productId: ${productId}`);
  }
  return doSandbox ? 46920 : 811082;
};

const getProductId = (product) => {
  if (![46920, 811082].includes(product)) {
    throw new Error(`In paddleWrapper.getProductId, invalid product: ${product}`);
  }
  return COM_BRACEDOTTO_SUPPORTER;
};

let api = null;

const eventCallback = (data) => {
  try {
    if (data.event === 'Checkout.Complete') {
      const productId = getProductId(data.eventData.product.id);
      const purchaseToken = data.eventData.checkout.id;
      const paddleUserId = data.eventData.user.id;
      const passthrough = data.eventData.checkout.passthrough;

      const rawPurchase = { id: productId, purchaseToken, paddleUserId, passthrough };
      iapUpdatedListener(rawPurchase);
      return;
    }

    if (data.event === 'Checkout.Close' && !data.eventData.checkout.completed) {
      iapErrorListener({ code: 'E_USER_CANCELLED' });
      return;
    }
  } catch (error) {
    iapErrorListener(error);
    return;
  }
};

const initConnection = async () => {
  // @ts-expect-error
  api = window.Paddle;
  if (!isObject(api)) {
    throw new Error('Invalid window.Paddle');
  }

  if (doSandbox) api.Environment.set('sandbox');
  api.Setup({ vendor: getVendor(), eventCallback });

  return true;
};

let iapUpdatedListener = null;
const purchaseUpdatedListener = (listener) => {
  iapUpdatedListener = listener;
  return {
    remove: () => {
      iapUpdatedListener = null;
    },
  };
};

let iapErrorListener;
const purchaseErrorListener = (listener) => {
  iapErrorListener = listener;
  return {
    remove: () => {
      iapErrorListener = null;
    },
  };
};

const getSubscription = (productId) => new Promise((resolve, reject) => {
  api.Product.Prices(getProduct(productId), (prices) => {
    if (!isObject(prices)) {
      reject(new Error(`Invalid prices: ${prices}`));
      return;
    }

    resolve({ id: productId, localizedPrice: prices.recurring.price.gross });
  });
});

const getSubscriptions = async (productIds) => {
  const products = await Promise.all(productIds.map(productId => {
    return getSubscription(productId);
  }));
  return products;
};

const requestPurchase = async (productId) => {
  // get user id, gen random id, save to iap-server
  // only the first time, check in localStorage first
  let randomId = lsgApi.getItemSync(PADDLE_RANDOM_ID);
  if (!isString(randomId)) {
    const sigObj = await ecApi.signECDSA(SIGNED_TEST_STRING);
    const userId = sigObj.publicKey;

    randomId = `${randomString(8)}-${randomString(8)}-${randomString(8)}-${randomString(8)}`;
    try {
      await global.fetch(IAP_PADDLE_PRE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, randomId }),
      });
    } catch (error) {
      console.log('Error when contact Iap server to store paddle pre with : ', userId, randomId, ' Error: ', error);
    }

    lsgApi.setItemSync(PADDLE_RANDOM_ID, randomId);
  }

  const passthrough = { randomId };
  api.Checkout.open({
    product: getProduct(productId), passthrough: JSON.stringify(passthrough),
  });
};

const paddleWrapper = {
  initConnection, purchaseUpdatedListener, purchaseErrorListener, getSubscriptions,
  requestPurchase,
};

export default paddleWrapper;
