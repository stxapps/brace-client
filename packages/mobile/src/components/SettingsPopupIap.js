import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Svg, Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import {
  restorePurchases, refreshPurchases, updateIapPublicKey, updateIapRestoreStatus,
  updateIapRefreshStatus,
} from '../actions';
import {
  RESTORE_PURCHASES, REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT,
  REFRESH_PURCHASES_ROLLBACK,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, HASH_SUPPORT, VALID, ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED,
  APPSTORE, PLAYSTORE, SM_WIDTH,
} from '../types/const';
import { getValidPurchase } from '../selectors';
import { getFormattedDate } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import { useSafeAreaFrame } from '.';

const _SettingsPopupIap = (props) => {

  const { onSidebarOpenBtnClick, onToRestoreIapViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const purchase = useSelector(state => getValidPurchase(state));

  return (
    <View style={tailwind('p-4 md:p-6', safeAreaWidth)}>
      <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-6')}>Subscription</Text>
      </View>
      {purchase ? <IapPurchased purchase={purchase} /> : <IapHome onToRestoreIapViewBtnClick={onToRestoreIapViewBtnClick} />}
    </View >
  );
};

const IapHome = (props) => {
  const { onToRestoreIapViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();

  return (
    <View style={tailwind('mt-6 mb-4 md:mt-0', safeAreaWidth)}>
      <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Purchase subscription</Text>
      <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Brace.to is free and we offer a paid subscription for use of extra feature(s). It's our intention to never show advertisments and we don't rent, sell or share your information with other companies. Our optional paid subscription is the only way we make money.</Text>
      <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Support us and unlock extra feature: pin an item at the top.</Text>
      <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>If you've already purchased the subscription, try <Text onPress={onToRestoreIapViewBtnClick} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>Restore purchases</Text></Text>
    </View>
  );
};

const IapPurchased = (props) => {

  const { purchase } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const publicKey = useSelector(state => state.iap.publicKey);
  const refreshStatus = useSelector(state => state.iap.refreshStatus);
  const dispatch = useDispatch();

  const onRefreshBtnClick = () => {
    dispatch(refreshPurchases());
  };

  useEffect(() => {
    if (!publicKey) dispatch(updateIapPublicKey());
  }, [publicKey, dispatch]);

  useEffect(() => {
    return () => {
      if (![null, REFRESH_PURCHASES].includes(refreshStatus)) {
        dispatch(updateIapRefreshStatus(null));
      }
    };
  }, [refreshStatus, dispatch]);

  let appStoreLink = (
    <Text style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>N/A</Text>
  );
  if (purchase.source === APPSTORE) {
    appStoreLink = (
      <Text onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>App Store</Text>
    );
  } else if (purchase.source === PLAYSTORE) {
    appStoreLink = (
      <Text onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions?sku=com.bracedotto.supporter&package=com.bracedotto')} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>Google Play</Text>
    );
  }

  let publicKeyText = (
    <View style={tailwind('pt-1 flex-shrink flex-grow sm:pl-3', safeAreaWidth)}>
      <Circle size={20} color="rgb(107, 114, 128)" />
    </View>
  );
  if (publicKey) publicKeyText = (
    <View style={tailwind('pt-1 flex-shrink flex-grow sm:pt-0 sm:pl-3', safeAreaWidth)}>
      <Text style={tailwind('text-base text-gray-500 font-normal')}>{publicKey}</Text>
    </View>
  );

  const markStyle = { transform: [{ translateY: 4 }] };

  let infoText, isUnknown = false;
  if (purchase.status === ACTIVE) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Thank you very much for supporting us. You've unlocked extra feature: pin an item at the top.</Text>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Your subscription will be expired on {getFormattedDate(purchase.expiryDate)} and it'll be automatically renewed. You can manage your subscription at {appStoreLink}.</Text>
      </React.Fragment>
    );
  } else if (purchase.status === NO_RENEW) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Thank you very much for supporting us. You've unlocked extra feature: pin an item at the top.</Text>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Your subscription will be expired on {getFormattedDate(purchase.expiryDate)} and it won't be automatically renewed. If you want to enable automatically renewal, please go to {appStoreLink} to manage your subscription.</Text>
      </React.Fragment>
    );
  } else if (purchase.status === GRACE) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Thank you very much for supporting us. You've unlocked extra feature: pin an item at the top.</Text>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>
          <Svg style={[tailwind('text-red-500 font-normal'), markStyle]} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('text-base text-red-600 font-normal leading-6.5')}> Your subscription has been expired</Text> and you won't be able to use extra feature(s) soon. Please go to {appStoreLink} now to renew your subscription to continue supporting us and using extra feature(s).
        </Text>
      </React.Fragment>
    );
  } else if (purchase.status === ON_HOLD) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Thank you very much for supporting us.</Text>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>
          <Svg style={[tailwind('text-red-500 font-normal'), markStyle]} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('text-base text-red-600 font-normal leading-6.5')}> Your subscription has been expired.</Text> Please go to {appStoreLink} now to renew your subscription to continue supporting us and using extra feature(s).
        </Text>
      </React.Fragment>
    );
  } else if (purchase.status === PAUSED) {
    infoText = (
      <React.Fragment>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Thank you very much for supporting us.</Text>
        <Text style={tailwind('mt-4 text-base text-gray-500 font-normal leading-6.5')}>Your subscription is paused. If you want to resume, please go to {appStoreLink} to manage your subscription.</Text>
      </React.Fragment>
    );
  } else {
    infoText = (
      <React.Fragment>
        <View style={tailwind('mt-6 flex-row items-center')}>
          <Svg style={tailwind('flex-grow-0 flex-shrink-0 mt-0.5 text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-red-600 font-normal leading-6.5')}>We cannot determine  your subscription's status.</Text>
        </View>
      </React.Fragment>
    );
    isUnknown = true;
  }

  let refreshPanel = (
    <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>{isUnknown ? 'Please wait a moment and try' : 'If your subscription is not up to date, try'} <Text onPress={onRefreshBtnClick} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>Refresh purchases</Text>.</Text>
  );
  if (refreshStatus === REFRESH_PURCHASES) {
    refreshPanel = (
      <View style={tailwind('mt-6')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color="rgb(107, 114, 128)" />
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Refresh...</Text>
        </View>
      </View>
    );
  } else if (refreshStatus === REFRESH_PURCHASES_COMMIT) {
    refreshPanel = (
      <View style={tailwind('mt-6')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-grow-0 flex-shrink-0 text-green-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Your subscription is up to date.</Text>
        </View>
      </View>
    );
  } else if (refreshStatus === REFRESH_PURCHASES_ROLLBACK) {
    refreshPanel = (
      <View style={tailwind('mt-6')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-grow-0 flex-shrink-0 text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-red-600 font-normal')}>Oops..., something went wrong!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tailwind('mt-6 mb-4 md:mt-0', safeAreaWidth)}>
      <Text style={tailwind('text-base text-gray-800 font-medium leading-4')}>Your subscription</Text>
      {infoText}
      {refreshPanel}
      <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>{isUnknown ? 'If the problem persists' : 'If you have any question'}, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>contact us</Text>
        <Svg style={tailwind('mb-2 text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
          <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
          <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
        </Svg> with your app public key below and order ID in your order confirmation email.
      </Text>
      <View style={tailwind('mt-6 mb-4 sm:flex-row', safeAreaWidth)}>
        <Text style={tailwind('flex-shrink-0 flex-grow-0 text-base text-gray-500 font-normal')}>App public key:</Text>
        {publicKeyText}
      </View>
    </View>
  );
};

const _SettingsPopupIapRestore = (props) => {

  const { onBackToIapViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const publicKey = useSelector(state => state.iap.publicKey);
  const purchase = useSelector(state => getValidPurchase(state));
  const restoreStatus = useSelector(state => state.iap.restoreStatus);
  const dispatch = useDispatch();

  const onRestoreBtnClick = () => {
    dispatch(restorePurchases());
  };

  useEffect(() => {
    if (!publicKey) dispatch(updateIapPublicKey());
  }, [publicKey, dispatch]);

  useEffect(() => {
    if (purchase) onBackToIapViewBtnClick();
  }, [purchase, onBackToIapViewBtnClick]);

  useEffect(() => {
    return () => {
      if (![null, RESTORE_PURCHASES, VALID].includes(restoreStatus)) {
        dispatch(updateIapRestoreStatus(null));
      }
    };
  }, [restoreStatus, dispatch]);

  let actionPanel;
  if (restoreStatus === null) {
    actionPanel = (
      <View style={tailwind('mt-7 mb-4 justify-start items-start')}>
        <TouchableOpacity onPress={onRestoreBtnClick} style={tailwind('px-3.5 py-1.5 border border-gray-400 rounded-full bg-white shadow-sm')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>Restore my purchases</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (restoreStatus === RESTORE_PURCHASES || purchase) {
    actionPanel = (
      <View style={tailwind('mt-7 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color="rgba(107, 114, 128, 1)" />
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Restoring...</Text>
        </View>
      </View>
    );
  } else if (restoreStatus === VALID) {
    let publicKeyText = (
      <View style={tailwind('pt-1 flex-shrink flex-grow sm:pl-3', safeAreaWidth)}>
        <Circle size={20} color="rgba(107, 114, 128, 1)" />
      </View>
    );
    if (publicKey) publicKeyText = (
      <View style={tailwind('pt-1 flex-shrink flex-grow sm:pt-0 sm:pl-3', safeAreaWidth)}>
        <Text style={tailwind('text-base text-gray-500 font-normal')}>{publicKey}</Text>
      </View>
    );

    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-grow-0 flex-shrink-0 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>No purchase found.</Text>
        </View>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>If there should be a purchase, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>contact us</Text>
          <Svg style={tailwind('mb-2 text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </Svg> with your app public key below and order ID in your order confirmation email.
        </Text>
        <View style={tailwind('mt-6 mb-4 sm:flex-row', safeAreaWidth)}>
          <Text style={tailwind('flex-shrink-0 flex-grow-0 text-base text-gray-500 font-normal')}>App public key:</Text>
          {publicKeyText}
        </View>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-grow-0 flex-shrink-0 text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-red-600 font-normal')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>contact us</Text>
          <Svg style={tailwind('mb-2 text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </Svg>.
        </Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
      <View style={tailwind('border-b border-gray-200 md:border-b-0', safeAreaWidth)}>
        <TouchableOpacity onPress={onBackToIapViewBtnClick} style={tailwind('pb-1 md:pb-0', safeAreaWidth)}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Subscription</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-6 md:pb-0', safeAreaWidth)}>Restore Purchases</Text>
      </View>
      <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>It may take several minutes to restore your purchases.</Text>
      {actionPanel}
    </View >
  );
};

export const SettingsPopupIap = React.memo(_SettingsPopupIap);
export const SettingsPopupIapRestore = React.memo(_SettingsPopupIapRestore);
