'use client';
import React, { useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { useSelector, useDispatch } from '../store';
import { updatePopup, linkTo } from '../actions';
import {
  initLinkEditor, updateLinkEditor, addLinkFromAdding, cancelDiedLinks,
  updateSelectingListName, updateListNamesMode,
} from '../actions/chunk';
import {
  HASH_SUPPORT, SIGN_UP_POPUP, SIGN_IN_POPUP, ADDED, DIED_ADDING, URL_QUERY_CLOSE_KEY,
  URL_QUERY_CLOSE_WINDOW, SHOW_BLANK, VALID_URL, NO_URL, BLK_MODE, ADD_MODE_BASIC,
  ADD_MODE_ADVANCED, LIST_NAMES_POPUP, LIST_NAMES_MODE_ADD_LINK,
  LIST_NAMES_ANIM_TYPE_POPUP, URL_MSGS,
} from '../types/const';
import { getThemeMode } from '../selectors';
import {
  getUrlPathQueryHash, validateUrl, separateUrlAndParam, ensureContainUrlProtocol,
  isObject, isString, isFldStr, truncateString, adjustRect, toPx,
  getListNameDisplayName,
} from '../utils';
import { selectHint, deselectValue, addTagName, renameKeys } from '../utils/tag';

import { useTailwind } from '.';
import ScrollControl from './ScrollControl';
import TopBar from './TopBar';
import Link from './CustomLink';
import GlobalPopups from './GlobalPopups';

const SignUpPopup = dynamic(() => import('./SignUpPopup'), { ssr: false });
const SignInPopup = dynamic(() => import('./SignInPopup'), { ssr: false });

const MAX_LINK_LENGTH = 157;

const RENDER_ADDING = 'RENDER_ADDING';
const RENDER_ADDED = 'RENDER_ADDED';
const RENDER_IN_OTHER_PROCESSING = 'RENDER_IN_OTHER_PROCESSING';
const RENDER_NOT_SIGNED_IN = 'RENDER_NOT_SIGNED_IN';
const RENDER_INVALID = 'RENDER_INVALID';
const RENDER_ERROR = 'RENDER_ERROR';
const RENDER_EDITOR = 'RENDER_EDITOR';

const getLinkFromAddingUrl = (listName, addingUrl, linksPerLn) => {
  if (!isString(addingUrl)) return null;
  if (!isObject(linksPerLn[listName])) return null;

  for (const id in linksPerLn[listName]) {
    if (linksPerLn[listName][id].url === addingUrl) {
      return linksPerLn[listName][id];
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
  const linksPerLn = useSelector(state => state.links);
  const linkEditor = useSelector(state => state.linkEditor);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const themeMode = useSelector(state => getThemeMode(state));
  const intEdtLink = useRef(null);
  const rndEdtLink = useRef(null);
  const fnlEdtLink = useRef(null);
  const doCancelDiedLink = useRef(true);
  const dpcdLinks = useRef([]);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();
  const router = useRouter();

  const innerProcessLink = useCallback((linksPerLn, linkEditor, dispatch) => {
    const addingUrl = linkEditor.url;
    const listName = linkEditor.listName;

    let link = getLinkFromAddingUrl(listName, addingUrl, linksPerLn);
    if (doCancelDiedLink.current) {
      if (isObject(link) && link.status === DIED_ADDING) {
        dispatch(cancelDiedLinks([link.id]));
        link = null;
      }
      doCancelDiedLink.current = false;
    }
    if (!isObject(link)) {
      if (!dpcdLinks.current.includes(addingUrl)) {
        dispatch(addLinkFromAdding());
        dpcdLinks.current.push(addingUrl);
      }

      dispatch(updateLinkEditor({ addingType: RENDER_ADDING }, true));
      return;
    }

    if (link.status === ADDED) {
      let newType = RENDER_IN_OTHER_PROCESSING;
      if (dpcdLinks.current.includes(addingUrl)) newType = RENDER_ADDED;

      dispatch(updateLinkEditor({ addingType: newType }, true));
      return;
    }
    if (link.status === DIED_ADDING) {
      dispatch(updateLinkEditor({ addingType: RENDER_ERROR }, true));
      return;
    }
  }, []);

  const processLink = useCallback(() => {
    if (![true, false].includes(isUserSignedIn) || !isString(href)) return;

    // Use window.location.href instead of the href from reducers because
    //   when pressing browser back button, this processLink can be executed
    //   before the href from reducers get updated.
    const pqh = getUrlPathQueryHash(window.location.href);
    const uap = separateUrlAndParam(pqh, URL_QUERY_CLOSE_KEY);
    const [addingUrl, addingParam] = [uap.separatedUrl, uap.param];
    const urlValidatedResult = validateUrl(addingUrl);
    const pndgValues = { url: addingUrl, addingParam, urlValidatedResult };

    if (isUserSignedIn === false) {
      const newValues = { ...pndgValues, addingType: RENDER_NOT_SIGNED_IN };
      dispatch(updateLinkEditor(newValues, true));
      return;
    }

    if (intEdtLink.current !== addingUrl) {
      dispatch(initLinkEditor(true));
      dispatch(updateLinkEditor({ url: addingUrl }, true));
      intEdtLink.current = addingUrl;
      return;
    }
    if (linkEditor.mode === ADD_MODE_BASIC) {
      if (urlValidatedResult === NO_URL) {
        const newValues = { ...pndgValues, addingType: RENDER_INVALID };
        dispatch(updateLinkEditor(newValues, true));
        return;
      }

      innerProcessLink(linksPerLn, linkEditor, dispatch);
      return;
    }
    if (linkEditor.mode === ADD_MODE_ADVANCED) {
      if (rndEdtLink.current !== addingUrl) {
        const newValues = { ...pndgValues, addingType: RENDER_EDITOR };
        dispatch(updateLinkEditor(newValues, true));
        rndEdtLink.current = addingUrl;
        return;
      }
      if (fnlEdtLink.current === linkEditor.url) {
        innerProcessLink(linksPerLn, linkEditor, dispatch);
        return;
      }
      return;
    }

    console.log('Invalid mode', linkEditor);
  }, [isUserSignedIn, href, linksPerLn, linkEditor, innerProcessLink, dispatch]);

  const onResetBtnClick = () => {
    dispatch(linkTo(router, '/'));
  };

  const onSignUpBtnClick = () => {
    dispatch(updatePopup(SIGN_UP_POPUP, true));
  };

  const onSignInBtnClick = () => {
    dispatch(updatePopup(SIGN_IN_POPUP, true));
  };

  const onRetryBtnClick = () => {
    doCancelDiedLink.current = true;
    dpcdLinks.current = [];
    processLink();
  };

  const onAddInputChange = (e) => {
    dispatch(updateLinkEditor(
      { url: e.target.value, isAskingConfirm: false }
    ));
  };

  const onAddInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      onAddOkBtnClick();
      if (window.document.activeElement instanceof HTMLInputElement) {
        window.document.activeElement.blur();
      }
    }
  };

  const onAddOkBtnClick = () => {
    const addingUrl = linkEditor.url.trim();
    const urlValidatedResult = validateUrl(addingUrl);
    if (urlValidatedResult === NO_URL) {
      dispatch(updateLinkEditor(
        { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false }
      ));
      return;
    }

    fnlEdtLink.current = linkEditor.url;
    processLink();
  };

  const onListNameBtnClick = (e) => {
    dispatch(updateSelectingListName(linkEditor.listName));
    dispatch(updateListNamesMode(
      LIST_NAMES_MODE_ADD_LINK, LIST_NAMES_ANIM_TYPE_POPUP,
    ));

    const rect = e.currentTarget.getBoundingClientRect();
    const nRect = adjustRect(
      rect, toPx('-0.25rem'), toPx('-0.25rem'), toPx('0.5rem'), toPx('0.5rem')
    );
    dispatch(updatePopup(LIST_NAMES_POPUP, true, nRect));
  };

  const onTagHintSelect = (hint) => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints } = linkEditor;
    const payload = renameKeys(selectHint(tagValues, tagHints, hint));
    dispatch(updateLinkEditor(payload));
  };

  const onTagValueDeselect = (value) => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints } = linkEditor;
    const payload = renameKeys(deselectValue(tagValues, tagHints, value));
    dispatch(updateLinkEditor(payload));
  };

  const onTagDnInputChange = (e) => {
    dispatch(updateLinkEditor({ tagDisplayName: e.target.value }));
  };

  const onTagDnInputKeyPress = (e) => {
    if (e.key === 'Enter') onTagAddBtnClick();
  };

  const onTagAddBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;

    const { tagValues, tagHints, tagDisplayName, tagColor } = linkEditor;
    const payload = renameKeys(addTagName(
      tagNameMap, tagValues, tagHints, tagDisplayName, tagColor
    ));
    dispatch(updateLinkEditor(payload));
  };

  useEffect(() => {
    processLink();
  }, [processLink]);

  useEffect(() => {
    didClick.current = false;
  }, [linkEditor]);

  const _render = (content) => {
    return (
      <React.Fragment>
        <ScrollControl forceScroll={false} />
        <TopBar rightPane={SHOW_BLANK} doSupportTheme={true} />
        <div className={tailwind('mx-auto max-w-md px-4 pt-28 pb-8 md:px-6 md:pt-36 lg:px-8')}>
          {content}
        </div>
        <GlobalPopups />
        <SignUpPopup />
        <SignInPopup />
      </React.Fragment>
    );
  };

  const renderNav = () => {
    const { addingParam, urlValidatedResult } = linkEditor;
    const { addingPUrl } = processAddingUrl(linkEditor.url);

    let rightLink = <Link className={tailwind('block rounded-xs text-right text-base font-medium leading-none text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200')} href="/">{isUserSignedIn ? 'Go to My List >' : 'Go to Brace.to >'}</Link>;
    let centerText = null;
    let leftLink = urlValidatedResult === VALID_URL ? <a className={tailwind('mt-6 block rounded-xs text-left text-base leading-none text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200 md:mt-0')} href={addingPUrl}>Back to the link</a> : <div />;

    if (isObject(addingParam) && addingParam[URL_QUERY_CLOSE_KEY] === URL_QUERY_CLOSE_WINDOW) {
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
    const { addingPUrl, addingTUrl } = processAddingUrl(linkEditor.url);
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
    const { addingPUrl, addingTUrl } = processAddingUrl(linkEditor.url);

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
    const { addingPUrl, addingTUrl } = processAddingUrl(linkEditor.url);

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

  const renderEditor = () => {
    let displayName = null;
    if (isFldStr(linkEditor.listName)) {
      displayName = getListNameDisplayName(linkEditor.listName, listNameMap);
    }

    let tagDesc = null;
    if (linkEditor.tagHints.length === 0) {
      tagDesc = (
        <React.Fragment>Enter a new tag and press +Add.</React.Fragment>
      );
    } else {
      tagDesc = (
        <React.Fragment>Enter a new tag or select below.</React.Fragment>
      );
    }

    const content = (
      <div className={tailwind('mx-auto max-w-82 pb-38 md:pb-46')}>
        <div className={tailwind('mx-auto size-24 flex items-center justify-center bg-gray-200 rounded-full blk:bg-gray-700')}>
          <svg className={tailwind('size-10 text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97231 16.8756 4.2181C16.9762 4.46389 17.0268 4.72725 17.0245 4.99281C17.0222 5.25837 16.967 5.52081 16.8622 5.76482C16.7574 6.00883 16.605 6.22952 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" />
          </svg>
        </div>
        <div className={tailwind('flex pt-8')}>
          <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>Url:</span>
          <div className={tailwind('ml-3 flex-1')}>
            <input onChange={onAddInputChange} onKeyDown={onAddInputKeyPress} className={tailwind('w-full rounded-full border border-gray-400 bg-white px-3.5 py-1 text-base text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500/50 blk:border-gray-600 blk:bg-gray-800 blk:text-gray-200 blk:placeholder:text-gray-400 blk:focus:border-transparent')} type="url" placeholder="https://" value={linkEditor.url} autoCapitalize="none" />
          </div>
        </div>
        <div className={tailwind('mt-6 border-t border-gray-200 blk:border-gray-700')} />
        <div className={tailwind('flex items-baseline pt-3.5')}>
          <span className={tailwind('inline-flex items-center w-12 flex-shrink-0 flex-grow-0 text-sm text-gray-500 blk:text-gray-300')}>List:</span>
          <button onClick={onListNameBtnClick} className={tailwind('flex min-w-0 items-center rounded-md bg-white py-1 focus:outline-none focus:ring blk:bg-gray-900')}>
            <span className={tailwind('truncate text-base text-gray-700 blk:text-gray-100')}>{displayName}</span>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-600 blk:text-gray-200')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className={tailwind('flex pt-1')}>
          <div className={tailwind('inline-flex items-center flex-shrink-0 flex-grow-0 h-13 w-12')}>
            <p className={tailwind('text-sm text-gray-500 blk:text-gray-300')}>Tags:</p>
          </div>
          <div className={tailwind('flex-shrink flex-grow')}>
            {linkEditor.tagValues.length === 0 && <div className={tailwind('flex min-h-13 items-center justify-start')}>
              <p className={tailwind('text-sm text-gray-500 blk:text-gray-400')}>{tagDesc}</p>
            </div>}
            {linkEditor.tagValues.length > 0 && <div className={tailwind('flex min-h-13 flex-wrap items-start justify-start pt-2.5')}>
              {linkEditor.tagValues.map((value, i) => {
                return (
                  <div key={`TagEditorValue-${value.tagName}`} className={tailwind(`mb-2 flex max-w-full items-center justify-start rounded-full bg-gray-100 pl-3 blk:bg-gray-700 ${i === 0 ? '' : 'ml-2'}`)}>
                    <div className={tailwind('flex-shrink flex-grow-0 truncate text-sm text-gray-600 blk:text-gray-300')}>{value.displayName}</div>
                    <button onClick={() => onTagValueDeselect(value)} className={tailwind('group ml-1 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full py-1.5 pr-1.5 focus:outline-none')} type="button">
                      <svg className={tailwind('h-5 w-5 cursor-pointer rounded-full text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>}
            {linkEditor.tagMsg && <p className={tailwind('text-sm text-red-500')}>{linkEditor.tagMsg}</p>}
            <div className={tailwind(`flex items-center justify-start ${linkEditor.tagMsg ? 'pt-0.5' : 'pt-1'}`)}>
              <label htmlFor="new-tag-input" className={tailwind('sr-only')}>Add a new tag</label>
              <input onChange={onTagDnInputChange} onKeyDown={onTagDnInputKeyPress} className={tailwind('block w-full flex-1 rounded-full border border-gray-400 bg-white px-3.5 py-1.25 text-sm text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500/50 blk:border-gray-500 blk:bg-gray-900 blk:text-gray-200 blk:placeholder:text-gray-400 blk:focus:border-transparent')} placeholder="Add a new tag" value={linkEditor.tagDisplayName} id="new-tag-input" name="new-tag-input" type="text" />
              <button onClick={onTagAddBtnClick} className={tailwind('group ml-2 flex flex-shrink-0 flex-grow-0 items-center rounded-full border border-gray-400 bg-white py-1.25 pl-1.5 pr-2.5 hover:border-gray-500 focus:outline-none focus:ring blk:border-gray-500 blk:bg-gray-900 blk:hover:border-gray-400')} type="button">
                <svg className={tailwind('h-4 w-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-100')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span className={tailwind('text-sm text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>Add</span>
              </button>
            </div>
            {linkEditor.tagHints.length > 0 && <div className={tailwind('flex flex-wrap items-center justify-start pt-3.5')}>
              <div className={tailwind('mb-2 text-sm text-gray-500 blk:text-gray-400')}>Hint:</div>
              {linkEditor.tagHints.map(hint => {
                return (
                  <button key={`TagEditorHint-${hint.tagName}`} onClick={() => onTagHintSelect(hint)} className={tailwind(`group ml-2 mb-2 block max-w-full rounded-full bg-gray-100 px-3 py-1.5 focus:outline-none focus:ring blk:bg-gray-700 ${hint.isBlur ? '' : 'hover:bg-gray-200 blk:hover:bg-gray-600'}`)} type="button" disabled={hint.isBlur}>
                    <div className={tailwind(`truncate text-sm ${hint.isBlur ? 'text-gray-400 blk:text-gray-500' : 'text-gray-600 group-hover:text-gray-700 blk:text-gray-300 blk:group-hover:text-gray-100'}`)}>{hint.displayName}</div>
                  </button>
                );
              })}
            </div>}
          </div>
        </div>
        <div className={tailwind('mt-6 border-t border-gray-200 blk:border-gray-700')} />
        {linkEditor.msg !== '' && <p className={tailwind('mt-2 text-sm text-red-500')}>{linkEditor.msg}</p>}
        <div className={tailwind(`${linkEditor.msg !== '' ? 'pt-2' : 'pt-5'}`)}>
          <button onClick={onAddOkBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className={tailwind('rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:text-gray-800 blk:hover:bg-white')}>{linkEditor.isAskingConfirm ? 'Sure' : 'Save'}</button>
          <button onClick={onResetBtnClick} className={tailwind('ml-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')}>Cancel</button>
        </div>
      </div>
    );

    return _render(content);
  };

  const { addingType } = linkEditor;
  if (addingType === RENDER_NOT_SIGNED_IN) return renderNotSignedIn();
  if (addingType === RENDER_INVALID) return renderInvalid();
  if (addingType === RENDER_ERROR) return renderError();
  if (addingType === RENDER_ADDED) return renderAdded();
  if (addingType === RENDER_IN_OTHER_PROCESSING) return renderInOtherProcessing();
  if (addingType === RENDER_ADDING) return renderAdding();
  if (addingType === RENDER_EDITOR) return renderEditor();
  return null;
};

export default React.memo(Adding);
