import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { mergeSettings } from '../actions';
import { HASH_SUPPORT, MERGING, DIED_MERGING } from '../types/const';
import { initialSettingsState } from '../types/initialStates';
import { extractDataId, getFormattedDT } from '../utils';
import { popupFMV } from '../types/animConfigs';

import { useTailwind } from '.';

const SettingsPopupConflict = (props) => {

  const conflictedSettings = useSelector(state => state.conflictedSettings);
  const didClick = useRef(false);
  const tailwind = useTailwind();

  const renderLoading = () => {
    if (!(conflictedSettings.status === MERGING)) return null;

    return (
      <React.Fragment>
        <div className={tailwind('absolute inset-0 bg-white bg-opacity-25 blk:bg-gray-900 blk:bg-opacity-25')} />
        <div className={tailwind('absolute top-1/3 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center')}>
          <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
            <div />
          </div>
        </div>
      </React.Fragment>
    );
  };

  const renderMergeError = () => {
    if (!(conflictedSettings.status === DIED_MERGING)) return (
      <AnimatePresence key="AP_SPC_mergeError" />
    );

    return (
      <AnimatePresence key="AP_SPC_mergeError">
        <motion.div className={tailwind('absolute inset-x-0 top-10 flex items-start justify-center lg:top-0')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
            <div className={tailwind('flex')}>
              <div className={tailwind('flex-shrink-0')}>
                <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={tailwind('ml-3 lg:mt-0.5')}>
                <h3 className={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Oops..., something went wrong!</h3>
                <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please wait a moment and try again.<br />If the problem persists, please <a className={tailwind('rounded-sm underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  useEffect(() => {
    didClick.current = false;
  }, [conflictedSettings]);

  return (
    <React.Fragment>
      <div className={tailwind('relative mx-auto max-w-3xl px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8')}>
        <div className={tailwind('h-16 w-full')} />
        <h3 className={tailwind('pt-5 text-lg font-medium text-gray-800 blk:text-gray-200')}>{conflictedSettings.contents.length} Versions of Settings found</h3>
        <p className={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Please choose the correct version of the settings.</p>
        {conflictedSettings.contents.map(content => <ConflictItem key={content.id} content={content} status={conflictedSettings.status} />)}
      </div>
      {renderLoading()}
      {renderMergeError()}
    </React.Fragment>
  );
};

const _ConflictItem = (props) => {

  const { content, status } = props;
  const [isOpen, setIsOpen] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const updatedDTStr = useMemo(() => {
    const { dt } = extractDataId(content.id);
    return getFormattedDT(dt);
  }, [content.id]);

  const contentStr = useMemo(() => {
    const filteredContent = {};
    for (const k in initialSettingsState) {
      if (['purchases', 'checkPurchasesDT'].includes(k)) continue;
      filteredContent[k] = initialSettingsState[k];
    }

    for (const k in filteredContent) {
      if (k in content) filteredContent[k] = content[k];
    }
    return JSON.stringify(filteredContent, null, 2);
  }, [content]);

  const onOpenBtnClick = () => {
    setIsOpen(!isOpen);
  };

  const onChooseBtnClick = () => {
    if (didClick.current) return;
    dispatch(mergeSettings(content.id));
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [status]);

  let arrowSvg;
  if (isOpen) {
    arrowSvg = (
      <svg className={tailwind('h-5 w-5 text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M5.29303 7.29302C5.48056 7.10555 5.73487 7.00023 6.00003 7.00023C6.26519 7.00023 6.5195 7.10555 6.70703 7.29302L10 10.586L13.293 7.29302C13.3853 7.19751 13.4956 7.12133 13.6176 7.06892C13.7396 7.01651 13.8709 6.98892 14.0036 6.98777C14.1364 6.98662 14.2681 7.01192 14.391 7.0622C14.5139 7.11248 14.6255 7.18673 14.7194 7.28062C14.8133 7.37452 14.8876 7.48617 14.9379 7.60907C14.9881 7.73196 15.0134 7.86364 15.0123 7.99642C15.0111 8.1292 14.9835 8.26042 14.9311 8.38242C14.8787 8.50443 14.8025 8.61477 14.707 8.70702L10.707 12.707C10.5195 12.8945 10.2652 12.9998 10 12.9998C9.73487 12.9998 9.48056 12.8945 9.29303 12.707L5.29303 8.70702C5.10556 8.51949 5.00024 8.26518 5.00024 8.00002C5.00024 7.73486 5.10556 7.48055 5.29303 7.29302V7.29302Z" />
      </svg>
    );
  } else {
    arrowSvg = (
      <svg className={tailwind('h-5 w-5 text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.707C7.10556 14.5195 7.00024 14.2651 7.00024 14C7.00024 13.7348 7.10556 13.4805 7.29303 13.293L10.586 9.99998L7.29303 6.70698C7.11087 6.51838 7.01008 6.26578 7.01236 6.00358C7.01463 5.74138 7.1198 5.49057 7.30521 5.30516C7.49062 5.11975 7.74143 5.01458 8.00363 5.01231C8.26583 5.01003 8.51843 5.11082 8.70703 5.29298L12.707 9.29298C12.8945 9.48051 12.9998 9.73482 12.9998 9.99998C12.9998 10.2651 12.8945 10.5195 12.707 10.707L8.70703 14.707C8.5195 14.8945 8.26519 14.9998 8.00003 14.9998C7.73487 14.9998 7.48056 14.8945 7.29303 14.707Z" />
      </svg>
    );
  }

  return (
    <div className={tailwind('mt-6 rounded-lg border border-gray-200 blk:border-gray-700')}>
      <div className={tailwind(`rounded-t-lg bg-gray-50 blk:bg-gray-800 sm:flex sm:items-center sm:justify-between ${!isOpen ? 'rounded-b-lg' : ''}`)}>
        <div className={tailwind('sm:flex-shrink sm:flex-grow')}>
          <button onClick={onOpenBtnClick} type="button" className={tailwind('group flex w-full items-center rounded-lg py-3 pl-2 focus:outline-none focus-visible:ring focus-visible:ring-inset')}>
            {arrowSvg}
            <div className={tailwind('ml-1')}>
              <div className={tailwind('text-left text-base font-medium text-gray-800 group-hover:underline blk:text-gray-200 lg:text-sm')}>Last updated on {updatedDTStr}</div>
            </div>
          </button>
        </div>
        <div className={tailwind('py-3 pl-2.5 sm:flex-shrink-0 sm:flex-grow-0 sm:pl-6 sm:pr-4')}>
          <button onClick={onChooseBtnClick} style={{ height: '2.125rem', paddingLeft: '0.625rem', paddingRight: '0.75rem' }} className={tailwind('inline-flex items-center rounded-full border border-gray-400 bg-white text-sm text-gray-500 hover:border-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200')} type="button">
            <svg style={{ width: '1.125rem', height: '1.125rem' }} className={tailwind('mr-1')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M16.7069 5.29303C16.8944 5.48056 16.9997 5.73487 16.9997 6.00003C16.9997 6.26519 16.8944 6.5195 16.7069 6.70703L8.70692 14.707C8.51939 14.8945 8.26508 14.9998 7.99992 14.9998C7.73475 14.9998 7.48045 14.8945 7.29292 14.707L3.29292 10.707C3.11076 10.5184 3.00997 10.2658 3.01224 10.0036C3.01452 9.74143 3.11969 9.49062 3.3051 9.30521C3.49051 9.1198 3.74132 9.01464 4.00352 9.01236C4.26571 9.01008 4.51832 9.11087 4.70692 9.29303L7.99992 12.586L15.2929 5.29303C15.4804 5.10556 15.7348 5.00024 15.9999 5.00024C16.2651 5.00024 16.5194 5.10556 16.7069 5.29303Z" />
            </svg>
            Choose
          </button>
        </div>
      </div>
      {isOpen && <div className={tailwind('w-full overflow-x-auto')}>
        <pre className={tailwind('inline-block px-4 py-5 text-base font-normal text-gray-600 blk:text-gray-300')}>{contentStr}</pre>
      </div>}
    </div>
  );
};

const ConflictItem = React.memo(_ConflictItem);

export default React.memo(SettingsPopupConflict);
