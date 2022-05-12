import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { restorePurchases, updateIapRestoreStatus } from '../actions';
import { RESTORE_PURCHASES } from '../types/actionTypes';
import { HASH_LANDING_MOBILE, HASH_SUPPORT, VALID, SM_WIDTH } from '../types/const';
import { getValidPurchase } from '../selectors';

import { useSafeAreaFrame } from '.';

const _SettingsPopupIap = (props) => {

  const { onSidebarOpenBtnClick, onToRestoreIapViewBtnClick } = props;
  const purchase = useSelector(state => getValidPurchase(state));

  const renderHome = () => {
    return (
      <div className="mt-6 md:mt-0">
        <h4 className="text-base text-gray-800 font-medium leading-none">Purchase subscription</h4>
        <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Brace.to is free and we offer a paid subscription for use of extra feature(s). It's our intention to never show advertisments and we don't rent, sell or share your information with other companies. Our optional paid subscription is the only way we make money.</p>
        <p className="mt-4 text-base text-gray-500 leading-relaxed">Support us and unlock extra feature: pin an item at the top. It's around $4.99 per year (may vary between countries depending on taxes and exchange rates). You can purchase a subscription in our <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_LANDING_MOBILE} target="_blank" rel="noreferrer">Mobile apps</a>.</p>
        <p className="mt-5 text-base text-gray-500 leading-relaxed">If you've already purchased the subscription, try <button onClick={onToRestoreIapViewBtnClick} className="underline rounded hover:text-gray-700 focus:outline-none focus:ring">Restore purchases</button>.</p>
      </div>
    );
  };

  const renderPurchased = () => {
    return (
      <div><h4>Your subscription</h4></div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="border-b border-gray-200 md:hidden">
        <button onClick={onSidebarOpenBtnClick} className="pb-1 group focus:outline-none">
          <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">Settings</span></span>
        </button>
        <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none">Subscription</h3>
      </div>
      {purchase ? renderPurchased() : renderHome()}
    </div>
  );
};

const _SettingsPopupIapRestore = (props) => {

  const { onBackToIapViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const purchase = useSelector(state => getValidPurchase(state));
  const restoreStatus = useSelector(state => state.iap.restoreStatus);
  const dispatch = useDispatch();

  const onRestoreBtnClick = () => {
    dispatch(restorePurchases());
  };

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
      <button onClick={onRestoreBtnClick} type="button" className="mt-7 mb-4 px-3.5 py-1.5 block bg-white text-sm text-gray-500 border border-gray-400 rounded-full hover:text-gray-600 hover:border-gray-500 focus:outline-none focus:ring">
        Restore my purchases
      </button>
    );
  } else if (restoreStatus === RESTORE_PURCHASES || purchase) {
    actionPanel = (
      <div className="mt-7 mb-4 ">
        <div className="flex items-center">
          <div className="ball-clip-rotate">
            <div />
          </div>
          <p className="ml-1 text-base text-gray-500">Restoring...</p>
        </div>
      </div>
    );
  } else if (restoreStatus === VALID) {
    actionPanel = (
      <div className="mt-6 mb-4">
        <div className="flex items-center">
          <svg className="w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </svg>
          <p className="ml-1 text-base text-gray-500">No purchase found.</p>
        </div>
        <p className="mt-6 text-base text-gray-500">Please try to restore purchases in our <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_LANDING_MOBILE} target="_blank" rel="noreferrer">Mobile apps</a> where you've made the purchase.</p>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">If there's still no purchase found, please <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
          <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </svg></a>.
        </p>
      </div>
    );
  } else {
    actionPanel = (
      <div className="mt-6 mb-4">
        <div className="flex items-center">
          <svg className="w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </svg>
          <p className="ml-1 text-base text-red-600">Oops..., something went wrong!</p>
        </div>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">Please wait a moment and try again. If the problem persists, please <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
          <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </svg></a>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 md:pt-4">
      <div className="border-b border-gray-200 md:border-b-0">
        <button onClick={onBackToIapViewBtnClick} className="pb-1 group focus:outline-none md:pb-0">
          <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Subscription</span></span>
        </button>
        <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none md:pb-0">Restore Purchases</h3>
      </div>
      <p className="mt-6 text-base text-gray-500 leading-relaxed">It may take several minutes to restore your purchases.</p>
      {actionPanel}
    </div>
  );
};

export const SettingsPopupIap = React.memo(_SettingsPopupIap);
export const SettingsPopupIapRestore = React.memo(_SettingsPopupIapRestore);
