'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import { addLink, cancelDiedLinks } from '../actions/chunk';
import {
  HASH_SUPPORT, SIGN_UP_POPUP, SIGN_IN_POPUP, MY_LIST, ADDED, DIED_ADDING,
  URL_QUERY_CLOSE_KEY, URL_QUERY_CLOSE_WINDOW, SHOW_BLANK, VALID_URL, NO_URL, BLK_MODE,
} from '../types/const';
import { getThemeMode } from '../selectors';
import {
  getUrlPathQueryHash, validateUrl, separateUrlAndParam, ensureContainUrlProtocol,
  isObject, isString, isEqual, truncateString,
} from '../utils';

import { useTailwind } from '.';
import TopBar from './TopBar';
import Link from './CustomLink';

const SignUpPopup = dynamic(() => import('./SignUpPopup'), { ssr: false });
const SignInPopup = dynamic(() => import('./SignInPopup'), { ssr: false });

const MAX_LINK_LENGTH = 157;

const RENDER_ADDING = 'RENDER_ADDING';
const RENDER_ADDED = 'RENDER_ADDED';
const RENDER_IN_OTHER_PROCESSING = 'RENDER_IN_OTHER_PROCESSING';
const RENDER_NOT_SIGNED_IN = 'RENDER_NOT_SIGNED_IN';
const RENDER_INVALID = 'RENDER_INVALID';
const RENDER_ERROR = 'RENDER_ERROR';

const getLinkFromAddingUrl = (addingUrl, links) => {
  if (!isString(addingUrl)) return null;

  for (const _id in links) {
    if (links[_id].url === addingUrl) {
      return links[_id];
    }
  }

  return null;
};

const processAddingUrl = (addingUrl) => {
  if (!isString(addingUrl)) return { addingPUrl: '', addingTUrl: '' };

  return {
    addingPUrl: ensureContainUrlProtocol(addingUrl),
    addingTUrl: truncateString(addingUrl, MAX_LINK_LENGTH),
  };
};

const Adding = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);
  const links = useSelector(state => state.links[MY_LIST]);
  const themeMode = useSelector(state => getThemeMode(state));
  const [type, setType] = useState(null);
  const [urlState, setUrlState] = useState({
    addingUrl: null, param: null, urlValidatedResult: null,
  });
  const doCancelDiedLink = useRef(true);
  const didDispatch = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const updateType = useCallback((newType) => {
    if (newType !== type) setType(newType);
  }, [type, setType]);

  const updateUrlState = useCallback((newValues) => {
    let doUpdate = false;
    for (const key in newValues) {
      if (!isEqual(newValues[key], urlState[key])) {
        doUpdate = true;
        break;
      }
    }

    if (doUpdate) setUrlState({ ...urlState, ...newValues });
  }, [urlState, setUrlState]);

  const processLink = useCallback(() => {
    if (![true, false].includes(isUserSignedIn) || !isString(href)) return;

    let { addingUrl, param, urlValidatedResult } = urlState;

    let newValues = {};
    if (!isString(addingUrl)) {
      addingUrl = getUrlPathQueryHash(href);

      const res = separateUrlAndParam(addingUrl, URL_QUERY_CLOSE_KEY);
      [addingUrl, param] = [res.separatedUrl, res.param];

      urlValidatedResult = validateUrl(addingUrl);

      newValues = { addingUrl, param, urlValidatedResult };
    }

    if (isUserSignedIn === false) {
      updateType(RENDER_NOT_SIGNED_IN);
      updateUrlState(newValues);
      return;
    }

    if (urlValidatedResult === NO_URL) {
      updateType(RENDER_INVALID);
      updateUrlState(newValues);
      return;
    }

    let link = getLinkFromAddingUrl(addingUrl, links);
    if (doCancelDiedLink.current) {
      if (isObject(link) && link.status === DIED_ADDING) {
        dispatch(cancelDiedLinks([link.id]));
        link = null;
      }
      doCancelDiedLink.current = false;
    }
    if (!isObject(link)) {
      dispatch(addLink(addingUrl, MY_LIST, false));
      didDispatch.current = true;

      updateType(RENDER_ADDING);
      updateUrlState(newValues);
      return;
    }

    if (link.status === ADDED) {
      const newType = didDispatch.current ? RENDER_ADDED : RENDER_IN_OTHER_PROCESSING;
      updateType(newType);
      updateUrlState(newValues);
      return;
    }
    if (link.status === DIED_ADDING) {
      updateType(RENDER_ERROR);
      updateUrlState(newValues);
      return;
    }
  }, [
    isUserSignedIn, href, links, urlState, updateType, updateUrlState, dispatch,
  ]);

  const onSignUpBtnClick = () => {
    dispatch(updatePopup(SIGN_UP_POPUP, true));
  };

  const onSignInBtnClick = () => {
    dispatch(updatePopup(SIGN_IN_POPUP, true));
  };

  const onRetryBtnClick = () => {
    doCancelDiedLink.current = true;
    processLink();
  };

  useEffect(() => {
    processLink();
  }, [processLink]);

  const _render = (content) => {
    return (
      <div className={tailwind('min-h-screen bg-white blk:bg-gray-900')}>
        <TopBar rightPane={SHOW_BLANK} doSupportTheme={true} />
        <div className={tailwind('mx-auto w-full max-w-md px-4 pt-28 md:px-6 md:pt-36 lg:px-8')}>
          {content}
        </div>
        <SignUpPopup />
        <SignInPopup />
      </div>
    );
  };

  const renderNav = () => {
    const { addingUrl, param, urlValidatedResult } = urlState;
    const { addingPUrl } = processAddingUrl(addingUrl);

    let rightLink = <Link className={tailwind('block rounded-xs text-right text-base font-medium leading-none text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200')} href="/">{isUserSignedIn ? 'Go to My List >' : 'Go to Brace.to >'}</Link>;
    let centerText = null;
    let leftLink = urlValidatedResult === VALID_URL ? <a className={tailwind('mt-6 block rounded-xs text-left text-base leading-none text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200 md:mt-0')} href={addingPUrl}>Back to the link</a> : <div />;

    if (isObject(param) && param[URL_QUERY_CLOSE_KEY] === URL_QUERY_CLOSE_WINDOW) {
      leftLink = null;
      centerText = <button onClick={() => window.close()} className={tailwind('block w-full rounded-xs py-2 text-center text-base text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200')}>Close this window</button>;
      rightLink = null;
    }

    return (
      <div className={tailwind('mt-16 md:flex md:flex-row-reverse md:items-baseline md:justify-between')}>
        {rightLink}
        {centerText}
        {leftLink}
      </div>
    );
  };

  const renderAdding = () => {
    const { addingPUrl, addingTUrl } = processAddingUrl(urlState.addingUrl);
    const isUrl = addingPUrl.length > 0 && addingTUrl.length > 0;

    const content = (
      <React.Fragment>
        <div className={tailwind('flex h-24 items-center justify-center')}>
          <div className={tailwind('lds-ellipsis')}>
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
          </div>
        </div>
        {isUrl && <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>
          <a className={tailwind('break-all rounded-xs hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={addingPUrl} target="_blank" rel="noreferrer">{addingTUrl}</a>
          <br />
          <span className={tailwind('break-normal text-lg font-semibold text-gray-900 blk:text-gray-50')}>is being saved.</span>
        </p>}
      </React.Fragment>
    );

    return _render(content);
  };

  const renderAdded = () => {
    const { addingPUrl, addingTUrl } = processAddingUrl(urlState.addingUrl);

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24')} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)'} />
          <path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(22, 101, 52)' : 'rgb(21, 128, 61)'} />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>
          <a className={tailwind('break-all rounded-xs hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={addingPUrl} target="_blank" rel="noreferrer">{addingTUrl}</a>
          <br />
          <span className={tailwind('break-normal text-lg font-semibold text-gray-900 blk:text-gray-50')}>has been saved.</span>
        </p>
        {renderNav()}
      </React.Fragment>
    );

    return _render(content);
  };

  const renderInOtherProcessing = () => {
    const { addingPUrl, addingTUrl } = processAddingUrl(urlState.addingUrl);

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24')} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)'} />
          <path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(22, 101, 52)' : 'rgb(21, 128, 61)'} />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>
          <a className={tailwind('break-all rounded-xs hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={addingPUrl} target="_blank" rel="noreferrer">{addingTUrl}</a>
          <br />
          <span className={tailwind('break-normal text-lg font-semibold text-gray-900 blk:text-gray-50')}>already exists</span>
        </p>
        {renderNav()}
      </React.Fragment>
    );

    return _render(content);
  };

  const renderNotSignedIn = () => {
    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24 text-yellow-600 blk:text-yellow-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>Please sign in first</p>
        <button onClick={onSignInBtnClick} className={tailwind('group mx-auto mt-2 block h-14 focus:outline-none')}>
          <span className={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1.5 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>Sign in</span>
        </button>
        <div className={tailwind('mt-10 flex items-center justify-center')}>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>No account yet?</p>
          <button onClick={onSignUpBtnClick} className={tailwind('ml-2 rounded-xs text-base font-medium text-gray-600 hover:text-gray-700 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-100')}>Sign up</button>
        </div>
        {renderNav()}
      </React.Fragment>
    );

    return _render(content);
  };

  const renderInvalid = () => {
    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24 text-red-600 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-red-700 blk:text-red-600')}>No link found to save to Brace</p>
        {renderNav()}
      </React.Fragment>
    );

    return _render(content);
  };

  const renderError = () => {
    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24 text-red-600 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-lg font-semibold text-gray-800 blk:text-gray-100')}>Oops..., something went wrong!</p>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-left text-base leading-relaxed text-gray-500 blk:text-gray-400 sm:text-center')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded underline hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
        <button onClick={onRetryBtnClick} className={tailwind('group mx-auto mt-5 mb-px block h-14 focus:outline-none')}>
          <span className={tailwind('rounded-full border border-gray-400 bg-white px-3 py-2 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>Try again</span>
        </button>
        {renderNav()}
      </React.Fragment>
    );

    return _render(content);
  };

  if (type === RENDER_NOT_SIGNED_IN) return renderNotSignedIn();
  if (type === RENDER_INVALID) return renderInvalid();
  if (type === RENDER_ERROR) return renderError();
  if (type === RENDER_ADDED) return renderAdded();
  if (type === RENDER_IN_OTHER_PROCESSING) return renderInOtherProcessing();
  return renderAdding();
};

export default React.memo(Adding);
