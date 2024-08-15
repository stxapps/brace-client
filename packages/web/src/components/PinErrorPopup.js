import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { retryDiedPins, cancelDiedPins } from '../actions/chunk';
import {
  PIN_LINK_ROLLBACK, UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
} from '../types/actionTypes';
import { HASH_SUPPORT } from '../types/const';

import { useTailwind } from '.';

const PinErrorPopup = () => {

  const pendingPins = useSelector(state => state.pendingPins);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const haveDiedPins = useMemo(() => {
    for (const id in pendingPins) {
      if ([
        PIN_LINK_ROLLBACK, UNPIN_LINK_ROLLBACK, MOVE_PINNED_LINK_ADD_STEP_ROLLBACK,
      ].includes(pendingPins[id].status)) return true;
    }
    return false;
  }, [pendingPins]);

  const onRetryBtnClick = () => {
    if (didClick.current) return;
    dispatch(retryDiedPins());
    didClick.current = true;
  };

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(cancelDiedPins());
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [pendingPins]);

  if (!haveDiedPins) return null;

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
            <h3 className={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Updating Pins Error!</h3>
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

export default React.memo(PinErrorPopup);
