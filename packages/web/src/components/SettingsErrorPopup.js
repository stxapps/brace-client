import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  retryDiedSettings, cancelDiedSettings, updateSettingsPopup,
} from '../actions/chunk';
import { HASH_SUPPORT, DIED_UPDATING } from '../types/const';

import { useSafeAreaInsets, useTailwind } from '.';

const _SettingsUpdateErrorPopup = () => {

  const insets = useSafeAreaInsets();
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

  const canvasStyle = {
    paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
  };

  return (
    <div style={canvasStyle} className={tailwind('fixed inset-x-0 top-14 z-40 flex items-start justify-center md:top-0')}>
      <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
        <div className={tailwind('flex')}>
          <div className={tailwind('flex-shrink-0')}>
            <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={tailwind('ml-3 lg:mt-0.5')}>
            <h3 className={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Updating Settings Error!</h3>
            <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please wait a moment and try again. <br className={tailwind('hidden sm:inline')} />If the problem persists, please <a className={tailwind('rounded underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
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

const _SettingsConflictErrorPopup = () => {

  const insets = useSafeAreaInsets();
  const isSettingsPopupShown = useSelector(state => state.display.isSettingsPopupShown);
  const conflictedSettingsContents = useSelector(
    state => state.conflictedSettings.contents
  );
  const [didClose, setDidClose] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onOpenBtnClick = () => {
    if (didClick.current) return;
    dispatch(updateSettingsPopup(true));
    didClick.current = true;
  };

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    setDidClose(true);
    didClick.current = true;
  };

  useEffect(() => {
    if (
      Array.isArray(conflictedSettingsContents) &&
      conflictedSettingsContents.length > 0
    ) {
      setDidClose(false);
    }
    didClick.current = false;
  }, [isSettingsPopupShown, conflictedSettingsContents]);

  if (
    isSettingsPopupShown ||
    !Array.isArray(conflictedSettingsContents) ||
    conflictedSettingsContents.length === 0 ||
    didClose
  ) return null;

  const canvasStyle = {
    paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
  };

  return (
    <div style={canvasStyle} className={tailwind('fixed inset-x-0 top-14 z-40 flex items-start justify-center md:top-0')}>
      <div className={tailwind('relative m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
        <div className={tailwind('flex')}>
          <div className={tailwind('flex-shrink-0')}>
            <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={tailwind('ml-3 lg:mt-0.5')}>
            <h3 className={tailwind('mr-4 text-left text-base font-medium text-red-800 lg:text-sm')}>Settings version conflicts!</h3>
            <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please go to Settings and manually choose the correct version.</p>
            <div className={tailwind('mt-4')}>
              <div className={tailwind('-mx-2 -my-1.5 flex')}>
                <button onClick={onOpenBtnClick} className={tailwind('rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 transition duration-150 ease-in-out hover:bg-red-100 focus:bg-red-100 focus:outline-none')}>Settings</button>
              </div>
            </div>
          </div>
        </div>
        <button onClick={onCloseBtnClick} className={tailwind('absolute top-1 right-1 rounded-md bg-red-50 p-1 hover:bg-red-100 focus:bg-red-100 focus:outline-none')} type="button">
          <span className={tailwind('sr-only')}>Dismiss</span>
          <svg className={tailwind('h-5 w-5 text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const SettingsUpdateErrorPopup = React.memo(_SettingsUpdateErrorPopup);
export const SettingsConflictErrorPopup = React.memo(_SettingsConflictErrorPopup);
