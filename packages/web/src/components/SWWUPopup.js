import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup } from '../actions';
import { DOMAIN_NAME, SWWU_POPUP } from '../types/const';

import { useTailwind } from '.';

const SWWUPopup = () => {

  const isShown = useSelector(state => state.display.isSWWUPopupShown);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(SWWU_POPUP, false));
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [isShown]);

  if (!isShown) return null;

  return (
    <div className={tailwind('fixed inset-x-0 top-14 z-40 flex items-start justify-center md:top-0')}>
      <div className={tailwind('relative m-4 max-w-[25rem] rounded-md bg-yellow-50 p-4 shadow-lg')}>
        <div className={tailwind('flex')}>
          <div className={tailwind('flex-shrink-0')}>
            <svg className={tailwind('h-6 w-6 text-yellow-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={tailwind('ml-3 lg:mt-0.5')}>
            <h3 className={tailwind('text-left text-base font-medium text-yellow-800 lg:text-sm')}>A new version is available.</h3>
            <p className={tailwind('mt-2.5 text-sm text-yellow-700')}>Please close all tabs opening {DOMAIN_NAME} to activate the new version.</p>
          </div>
        </div>
        <button onClick={onCloseBtnClick} className={tailwind('absolute top-1 right-1 rounded-md bg-yellow-50 p-1 hover:bg-yellow-100 focus:bg-yellow-100 focus:outline-none')} type="button">
          <span className={tailwind('sr-only')}>Dismiss</span>
          <svg className={tailwind('h-5 w-5 text-yellow-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(SWWUPopup);
