import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { retryDiedSettings, cancelDiedSettings } from '../actions';
import { HASH_SUPPORT, DIED_UPDATING } from '../types/const';

import { useTailwind } from '.';

const SettingsErrorPopup = () => {

  const settingsStatus = useSelector(state => state.display.settingsStatus);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onRetryBtnClick = () => {
    if (didClick.current) return;
    dispatch(retryDiedSettings());
    didClick.current = true;
  };

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(cancelDiedSettings());
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [settingsStatus]);

  if (settingsStatus !== DIED_UPDATING) return null;

  return (
    <div className={tailwind('fixed inset-x-0 top-14 z-40 flex items-start justify-center md:top-0')}>
      <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
        <div className={tailwind('flex')}>
          <div className={tailwind('flex-shrink-0')}>
            <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={tailwind('ml-3 lg:mt-0.5')}>
            <h3 className={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Updating Settings Error!</h3>
            <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please wait a moment and try again. <br className={tailwind('hidden sm:inline')} />If the problem persists, please <a className={tailwind('rounded underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
              <svg className={tailwind('mb-2 inline-block w-4')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
              </svg></a>.
            </p>
            <div className={tailwind('mt-4')}>
              <div className={tailwind('-mx-2 -my-1.5 flex')}>
                <button onClick={onRetryBtnClick} className={tailwind('rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 transition duration-150 ease-in-out hover:bg-red-100 focus:bg-red-100 focus:outline-none')}>Retry</button>
                <button onClick={onCancelBtnClick} className={tailwind('ml-3 rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 transition duration-150 ease-in-out hover:bg-red-100 focus:bg-red-100 focus:outline-none')}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SettingsErrorPopup);
