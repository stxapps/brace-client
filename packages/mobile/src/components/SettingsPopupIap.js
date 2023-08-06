import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Svg, Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import {
  initIapConnectionAndGetProducts, requestPurchase, restorePurchases, refreshPurchases,
  retryVerifyPurchase, updateIapPublicKey, updateIapPurchaseStatus,
  updateIapRestoreStatus, updateIapRefreshStatus,
} from '../actions';
import {
  GET_PRODUCTS_ROLLBACK, REQUEST_PURCHASE, RESTORE_PURCHASES, REFRESH_PURCHASES,
  REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, HASH_TERMS, HASH_PRIVACY, HASH_SUPPORT, VALID, INVALID, UNKNOWN, ERROR,
  ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED, APPSTORE, PLAYSTORE, PADDLE, SM_WIDTH,
  BLK_MODE,
} from '../types/const';
import { getValidProduct, getValidPurchase, getThemeMode } from '../selectors';
import { getFormattedDate, isString } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const _SettingsPopupIap = (props) => {

  const { onSidebarOpenBtnClick, onToRestoreIapViewBtnClick } = props;
  const purchase = useSelector(state => getValidPurchase(state));
  const tailwind = useTailwind();

  return (
    <View style={tailwind('p-4 md:p-6')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100')}>Subscription</Text>
      </View>
      {purchase ? <IapPurchased purchase={purchase} /> : <IapHome onToRestoreIapViewBtnClick={onToRestoreIapViewBtnClick} />}
    </View >
  );
};

const IapHome = (props) => {
  const { onToRestoreIapViewBtnClick } = props;
  const publicKey = useSelector(state => state.iap.publicKey);
  const productStatus = useSelector(state => state.iap.productStatus);
  const canMakePayments = useSelector(state => state.iap.canMakePayments);
  const product = useSelector(state => getValidProduct(state));
  const purchaseStatus = useSelector(state => state.iap.purchaseStatus);
  const themeMode = useSelector(state => getThemeMode(state));
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  // To make sure useEffect is componentWillUnmount
  const purchaseStatusRef = useRef(purchaseStatus);
  const dispatchRef = useRef(dispatch);

  const onRequestBtnClick = () => {
    if (didClick.current) return;
    dispatch(requestPurchase(product));
    didClick.current = true;
  };

  const onRetryGetProductsBtnClick = () => {
    if (didClick.current) return;
    dispatch(initIapConnectionAndGetProducts(true));
    didClick.current = true;
  };

  const onRetryRequestPurchaseBtnClick = () => {
    if (didClick.current) return;
    dispatch(initIapConnectionAndGetProducts(true));
    didClick.current = true;
  };

  const onRetryVerifyPurchaseBtnClick = () => {
    if (didClick.current) return;
    dispatch(retryVerifyPurchase());
    didClick.current = true;
  };

  useEffect(() => {
    if (!publicKey) dispatch(updateIapPublicKey());
  }, [publicKey, dispatch]);

  useEffect(() => {
    dispatch(initIapConnectionAndGetProducts());
  }, [dispatch]);

  useEffect(() => {
    didClick.current = false;
  }, [product, canMakePayments, purchaseStatus, productStatus]);

  useEffect(() => {
    purchaseStatusRef.current = purchaseStatus;
    dispatchRef.current = dispatch;
  }, [purchaseStatus, dispatch]);

  useEffect(() => {
    return () => {
      if (![null, REQUEST_PURCHASE].includes(purchaseStatusRef.current)) {
        dispatchRef.current(updateIapPurchaseStatus(null, null));
      }
    };
  }, []);

  let publicKeyText = (
    <View style={tailwind('flex-shrink flex-grow pt-1 sm:pl-3')}>
      <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
    </View>
  );
  if (publicKey) {
    publicKeyText = (
      <View style={tailwind('flex-shrink flex-grow pt-1 sm:pt-0 sm:pl-3')}>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{publicKey}</Text>
      </View>
    );
  }

  let actionPanel;
  if (product && canMakePayments) {
    if (purchaseStatus === null) {
      //subscriptionPeriodNumberIOS
      //subscriptionPeriodUnitIOS
      //subscriptionPeriodAndroid
      //freeTrialPeriodAndroid

      actionPanel = (
        <View style={tailwind('mt-6 items-start justify-start')}>
          <TouchableOpacity onPress={onRequestBtnClick} style={tailwind('rounded-full border border-gray-400 bg-white px-3.5 py-1.5 blk:border-gray-400 blk:bg-gray-900')}>
            <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Subscribe for {product.localizedPrice} / year</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (purchaseStatus === REQUEST_PURCHASE) {
      actionPanel = (
        <View style={tailwind('mt-6 flex-row items-start justify-start border border-transparent py-1')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Subscribing...</Text>
        </View>
      );
    } else if (purchaseStatus === INVALID) {
      // verify and it's invalid
      actionPanel = (
        <View style={tailwind('mt-6')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Unable to verify the purchase</Text>
          </View>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please check with the App Store that the purchase has been processed successfully. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text> with your app public key below and order ID in your order confirmation email.</Text>
          <View style={tailwind('mt-6 sm:flex-row')}>
            <Text style={tailwind('flex-shrink-0 flex-grow-0 text-base font-normal text-gray-500 blk:text-gray-400')}>App public key:</Text>
            {publicKeyText}
          </View>
        </View>
      );
    } else if (purchaseStatus === UNKNOWN || purchaseStatus === ERROR) {
      // got rawPurchase, can retry to verify
      actionPanel = (
        <View style={tailwind('mt-6')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
          </View>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and <Text onPress={onRetryVerifyPurchaseBtnClick} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>try again</Text>.</Text>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text> with your app public key below and order ID in your order confirmation email.</Text>
          <View style={tailwind('mt-6 sm:flex-row')}>
            <Text style={tailwind('flex-shrink-0 flex-grow-0 text-base font-normal text-gray-500 blk:text-gray-400')}>App public key:</Text>
            {publicKeyText}
          </View>
        </View>
      );
    } else {
      // have nothing, can retry by re-init iap connection and re-purchase
      actionPanel = (
        <View style={tailwind('mt-6')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
          </View>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and <Text onPress={onRetryRequestPurchaseBtnClick} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>try again</Text>.</Text>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
        </View>
      );
    }
  } else if (canMakePayments === false) {
    actionPanel = (
      <View style={tailwind('mt-6')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Cannot subscribe with the current setup of the App Store</Text>
        </View>
      </View>
    );
  } else {
    if (productStatus === GET_PRODUCTS_ROLLBACK) {
      actionPanel = (
        <View style={tailwind('mt-6')}>
          <View style={tailwind('flex-row items-center')}>
            <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
            <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., unable to connect to the App Store</Text>
          </View>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and <Text onPress={onRetryGetProductsBtnClick} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>try again</Text>.</Text>
          <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
        </View>
      );
    } else {
      actionPanel = (
        <View style={tailwind('mt-6 flex-row items-start justify-start border border-transparent py-1')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Loading...</Text>
        </View>
      );
    }
  }

  return (
    <View style={tailwind('mt-6 mb-4 md:mt-0')}>
      <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Purchase subscription</Text>
      <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Brace.to is free and we offer a paid subscription for use of extra features. It's our intention to never show advertisements and we don't rent, sell or share your information with other companies. Our optional paid subscription is the only way we make money.</Text>
      <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Support us and unlock extra features: pin to the top, dark appearance, change title & image, and lock lists.</Text>
      <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Start with a 14 day free trial.</Text>
      {actionPanel}
      <Text style={tailwind('mt-6 text-sm font-normal leading-6.5 text-gray-400 blk:text-gray-500')}>By subscribing, you agree to our <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_TERMS)} style={tailwind('text-sm font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Terms of Service</Text> and <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_PRIVACY)} style={tailwind('text-sm font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Privacy Policy</Text>. Only one free trial per user, the App Store's Terms and Conditions apply.</Text>
      <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>If you've already purchased the subscription, try <Text onPress={onToRestoreIapViewBtnClick} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Restore purchases</Text></Text>
    </View>
  );
};

const IapPurchased = (props) => {

  const { purchase } = props;
  const publicKey = useSelector(state => state.iap.publicKey);
  const refreshStatus = useSelector(state => state.iap.refreshStatus);
  const themeMode = useSelector(state => getThemeMode(state));
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  // To make sure useEffect is componentWillUnmount
  const refreshStatusRef = useRef(refreshStatus);
  const dispatchRef = useRef(dispatch);

  const onRefreshBtnClick = () => {
    if (didClick.current) return;
    dispatch(refreshPurchases());
    didClick.current = true;
  };

  useEffect(() => {
    if (!publicKey) dispatch(updateIapPublicKey());
  }, [publicKey, dispatch]);

  useEffect(() => {
    didClick.current = false;
  }, [refreshStatus]);

  useEffect(() => {
    refreshStatusRef.current = refreshStatus;
    dispatchRef.current = dispatch;
  }, [refreshStatus, dispatch]);

  useEffect(() => {
    return () => {
      if (![null, REFRESH_PURCHASES].includes(refreshStatusRef.current)) {
        dispatchRef.current(updateIapRefreshStatus(null));
      }
    };
  }, []);

  let appStoreLink = (
    <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>N/A</Text>
  );
  if (purchase.source === APPSTORE) {
    appStoreLink = (
      <Text onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>App Store</Text>
    );
  } else if (purchase.source === PLAYSTORE) {
    appStoreLink = (
      <Text onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions?sku=com.bracedotto.supporter&package=com.bracedotto')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Google Play</Text>
    );
  } else if (purchase.source === PADDLE) {
    if (purchase.status === NO_RENEW) {
      appStoreLink = (
        <Text onPress={() => Linking.openURL('https://paddle.net/')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Paddle</Text>
      );
    } else {
      let link = purchase.receiptUrl;
      if (isString(purchase.updateUrl) && purchase.updateUrl.endsWith('/update')) {
        link = purchase.updateUrl.slice(0, '/update'.length * -1);
        link += '/manage-subscription';
      } else if (
        isString(purchase.cancelUrl) && purchase.cancelUrl.endsWith('/cancel')
      ) {
        link = purchase.cancelUrl.slice(0, '/cancel'.length * -1);
        link += '/manage-subscription';
      }
      appStoreLink = (
        <Text onPress={() => Linking.openURL(link)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Paddle</Text>
      );
    }
  }

  let publicKeyText = (
    <View style={tailwind('flex-shrink flex-grow pt-1 sm:pl-3')}>
      <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
    </View>
  );
  if (publicKey) {
    publicKeyText = (
      <View style={tailwind('flex-shrink flex-grow pt-1 sm:pt-0 sm:pl-3')}>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{publicKey}</Text>
      </View>
    );
  }

  let infoText, isUnknown = false;
  if (purchase.status === ACTIVE) {
    infoText = (
      <React.Fragment>
        <View style={tailwind('mt-4')}>
          <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>     <Text style={tailwind('text-base font-normal leading-6.5 text-green-600 blk:text-green-500')}>Thank you very much for supporting us.</Text> You've unlocked extra features: pin to the top, dark appearance, change title & image, and lock lists.</Text>
          <View style={[tailwind('absolute'), { top: 3, left: 0 }]}>
            <Svg style={tailwind('font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </Svg>
          </View>
        </View>
        <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Your subscription will be expired on {getFormattedDate(new Date(purchase.expiryDate))} and it'll be automatically renewed. You can manage your subscription at {appStoreLink}.</Text>
      </React.Fragment>
    );
  } else if (purchase.status === NO_RENEW) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Thank you very much for supporting us. You've unlocked extra features: pin to the top, dark appearance, change title & image, and lock lists.</Text>
        <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Your subscription will be expired on {getFormattedDate(new Date(purchase.expiryDate))} and it won't be automatically renewed. If you want to enable automatically renewal, please go to {appStoreLink} to manage your subscription.</Text>
      </React.Fragment>
    );
  } else if (purchase.status === GRACE) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Thank you very much for supporting us. You've unlocked extra features: pin to the top, dark appearance, change title & image, and lock lists.</Text>
        <View style={tailwind('mt-4')}>
          <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>     <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>Your subscription has been expired</Text> and you won't be able to use extra features soon. Please go to {appStoreLink} now to renew your subscription to continue supporting us and using extra features.</Text>
          <View style={[tailwind('absolute'), { top: 3, left: 0 }]}>
            <Svg style={tailwind('font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
          </View>
        </View>
      </React.Fragment>
    );
  } else if (purchase.status === ON_HOLD) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Thank you very much for supporting us.</Text>
        <View style={tailwind('mt-4')}>
          <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>     <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>Your subscription has been expired.</Text> Please go to {appStoreLink} now to renew your subscription to continue supporting us and using extra features.
          </Text>
          <View style={[tailwind('absolute'), { top: 3, left: 0 }]}>
            <Svg style={tailwind('font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </Svg>
          </View>
        </View>
      </React.Fragment>
    );
  } else if (purchase.status === PAUSED) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Thank you very much for supporting us.</Text>
        <Text style={tailwind('mt-4 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Your subscription is paused. If you want to resume, please go to {appStoreLink} to manage your subscription.</Text>
      </React.Fragment>
    );
  } else {
    infoText = (
      <React.Fragment>
        <View style={tailwind('mt-6 flex-row items-center')}>
          <Svg style={tailwind('mt-0.5 flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>We cannot determine your subscription's status.</Text>
        </View>
      </React.Fragment>
    );
    isUnknown = true;
  }

  let refreshPanel = (
    <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>{isUnknown ? 'Please wait a moment and try' : 'If your subscription is not up to date, try'} <Text onPress={onRefreshBtnClick} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Refresh purchases</Text>.</Text>
  );
  if (refreshStatus === REFRESH_PURCHASES) {
    refreshPanel = (
      <View style={tailwind('mt-6')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Refresh...</Text>
        </View>
      </View>
    );
  } else if (refreshStatus === REFRESH_PURCHASES_COMMIT) {
    refreshPanel = (
      <View style={tailwind('mt-6')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Your subscription is up to date.</Text>
        </View>
      </View>
    );
  } else if (refreshStatus === REFRESH_PURCHASES_ROLLBACK) {
    refreshPanel = (
      <View style={tailwind('mt-6')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tailwind('mt-6 mb-4 md:mt-0')}>
      <Text style={tailwind('text-base font-medium leading-4 text-gray-800 blk:text-gray-100')}>Your subscription</Text>
      {infoText}
      {refreshPanel}
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>{isUnknown ? 'If the problem persists' : 'If you have any questions'}, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text> with your app public key below and order ID in your order confirmation email.</Text>
      <View style={tailwind('mt-6 sm:flex-row')}>
        <Text style={tailwind('flex-shrink-0 flex-grow-0 text-base font-normal text-gray-500 blk:text-gray-400')}>App public key:</Text>
        {publicKeyText}
      </View>
    </View>
  );
};

const _SettingsPopupIapRestore = (props) => {

  const { onBackToIapViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const purchase = useSelector(state => getValidPurchase(state));
  const publicKey = useSelector(state => state.iap.publicKey);
  const restoreStatus = useSelector(state => state.iap.restoreStatus);
  const themeMode = useSelector(state => getThemeMode(state));
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  // To make sure useEffect is componentWillUnmount
  const restoreStatusRef = useRef(restoreStatus);
  const dispatchRef = useRef(dispatch);

  const onRestoreBtnClick = () => {
    if (didClick.current) return;
    dispatch(restorePurchases());
    didClick.current = true;
  };

  useEffect(() => {
    if (!publicKey) dispatch(updateIapPublicKey());
  }, [publicKey, dispatch]);

  useEffect(() => {
    if (purchase) onBackToIapViewBtnClick();
  }, [purchase, onBackToIapViewBtnClick]);

  useEffect(() => {
    didClick.current = false;
  }, [restoreStatus]);

  useEffect(() => {
    restoreStatusRef.current = restoreStatus;
    dispatchRef.current = dispatch;
  }, [restoreStatus, dispatch]);

  useEffect(() => {
    return () => {
      if (![null, RESTORE_PURCHASES].includes(restoreStatusRef.current)) {
        dispatchRef.current(updateIapRestoreStatus(null));
      }
    };
  }, []);

  let actionPanel;
  if (restoreStatus === null) {
    actionPanel = (
      <View style={tailwind('mt-7 mb-4 items-start justify-start')}>
        <TouchableOpacity onPress={onRestoreBtnClick} style={tailwind('rounded-full border border-gray-400 bg-white px-3.5 py-1.5 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Restore my purchases</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (restoreStatus === RESTORE_PURCHASES || purchase) {
    actionPanel = (
      <View style={tailwind('mt-7 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Restoring...</Text>
        </View>
      </View>
    );
  } else if (restoreStatus === VALID) {
    let publicKeyText = (
      <View style={tailwind('flex-shrink flex-grow pt-1 sm:pl-3')}>
        <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
      </View>
    );
    if (publicKey) {
      publicKeyText = (
        <View style={tailwind('flex-shrink flex-grow pt-1 sm:pt-0 sm:pl-3')}>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{publicKey}</Text>
        </View>
      );
    }

    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No purchase found.</Text>
        </View>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>If there should be a purchase, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text> with your app public key below and order ID in your order confirmation email.</Text>
        <View style={tailwind('mt-6 sm:flex-row')}>
          <Text style={tailwind('flex-shrink-0 flex-grow-0 text-base font-normal text-gray-500 blk:text-gray-400')}>App public key:</Text>
          {publicKeyText}
        </View>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <TouchableOpacity onPress={onBackToIapViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Subscription</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100 md:pb-0')}>Restore Purchases</Text>
      </View>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to restore your purchases.</Text>
      {actionPanel}
    </View>
  );
};

export const SettingsPopupIap = React.memo(_SettingsPopupIap);
export const SettingsPopupIapRestore = React.memo(_SettingsPopupIapRestore);
