import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GracefulImage from 'react-graceful-image';

import { updatePopup, updateBulkEdit, addSelectedLinkIds, moveLinks } from '../actions';
import {
  COLOR, PATTERN, IMAGE, MY_LIST, ARCHIVE, TRASH, ADDING, MOVING, LG_WIDTH,
  REMOVE, RESTORE,
} from '../types/const';
import { makeGetPinStatus } from '../selectors';
import {
  removeTailingSlash, ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  extractUrl, isPinningStatus,
} from '../utils';

import { useSafeAreaFrame } from '.';

const ListItemContent = (props) => {

  const { link } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const listName = useSelector(state => state.display.listName);
  const pinStatus = useSelector(state => getPinStatus(state, link));
  const [extractedFaviconError, setExtractedFaviconError] = useState(false);
  const clickPressTimer = useRef(null);
  const touchPressTimer = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onClickPress = (event) => {
    clickPressTimer.current = setTimeout(() => {
      dispatch(updateBulkEdit(true));
      dispatch(addSelectedLinkIds([link.id]));
    }, 500);
  };

  const onClickPressRelease = (event) => {
    clearTimeout(clickPressTimer.current);
  };

  const onTouchPress = (event) => {
    touchPressTimer.current = setTimeout(() => {
      dispatch(updateBulkEdit(true));
      dispatch(addSelectedLinkIds([link.id]));
    }, 500);
  };

  const onTouchPressRelease = (event) => {
    clearTimeout(touchPressTimer.current);
  };

  const onArchiveBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveLinks(ARCHIVE, [link.id]));
    didClick.current = true;
  };

  const onRemoveBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveLinks(TRASH, [link.id]));
    didClick.current = true;
  };

  const onRestoreBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveLinks(MY_LIST, [link.id]));
    didClick.current = true;
  };

  const onMenuBtnClick = (e) => {
    const menuBtnPosition = e.currentTarget.getBoundingClientRect();
    dispatch(updatePopup(link.id, true, menuBtnPosition));
    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
  };

  const onExtractedFaviconError = () => {
    setExtractedFaviconError(true);
  };

  useEffect(() => {
    return () => {
      clearTimeout(clickPressTimer.current);
      clearTimeout(touchPressTimer.current);
    };
  }, []);

  useEffect(() => {
    didClick.current = false;
  }, [link.status]);

  const { url, decor, extractedResult } = link;
  const { host, origin } = extractUrl(url);

  const renderImage = () => {
    let image;
    if (extractedResult && extractedResult.image) image = extractedResult.image;

    if (image) {
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="image-graceful-image-extracted-result" className="absolute h-full w-full object-cover object-center ring-1 ring-black ring-opacity-5" src={image} alt={`illustration of ${url}`} />;
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      return <div className={`absolute h-full w-full ${decor.image.bg.value}`} />;
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      // Require both 'pattern' and [pattern_name] class names
      return <div className={`absolute w-full h-full pattern ${decor.image.bg.value}`} />;
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return <GracefulImage key="image-graceful-image-decor" className="absolute h-full w-full object-cover object-center" src={decor.image.bg.value} alt={`illustration of ${url}`} />;
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  };

  const renderFavicon = () => {
    const placeholder = (ref) => {
      if (decor.favicon.bg.type === COLOR) {
        return <div ref={ref} className={`flex-shrink-0 flex-grow-0 w-3.5 h-3.5 ${decor.favicon.bg.value} rounded-full`} />;
      }

      if (decor.favicon.bg.type === PATTERN) {
        // Require both 'pattern' and [pattern_name] class names
        // Require under relative class
        return (
          <div ref={ref} className="flex-shrink-0 flex-grow-0">
            <div className="relative rounded-full overflow-hidden">
              <div className={`w-3.5 h-3.5 rounded-full pattern ${decor.favicon.bg.value}`} />
            </div>
          </div>
        );
      }
    };

    let favicon;
    if (extractedResult && extractedResult.favicon) {
      favicon = ensureContainUrlSecureProtocol(extractedResult.favicon);
    }

    if (favicon && !extractedFaviconError) {
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="favicon-graceful-image-extracted-result" className="flex-shrink-0 flex-grow-0 w-3.5 h-3.5 overflow-hidden" src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} onError={onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = removeTailingSlash(origin) + '/favicon.ico';
    favicon = ensureContainUrlSecureProtocol(favicon);

    return <GracefulImage key="favicon-graceful-image-ico" className="flex-shrink-0 flex-grow-0 w-3.5 h-3.5 overflow-hidden" src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} />;
  };

  let title, classNames = '';
  if (extractedResult && extractedResult.title) {
    title = extractedResult.title;
  }
  if (!title) {
    title = url;
    classNames = 'break-all';
  }

  const isPinning = isPinningStatus(pinStatus);
  const canSelect = (
    safeAreaWidth >= LG_WIDTH && ![ADDING, MOVING].includes(link.status) && !isPinning
  );

  const canArchive = canSelect && ![ARCHIVE, TRASH].includes(listName);
  const canRemove = canSelect && listName !== TRASH;
  const canRestore = canSelect && listName === TRASH;

  return (
    <div className="flex items-center">
      <div className="flex-grow-0 flex-shrink-0 w-16 pl-px">
        <div onTouchStart={onTouchPress} onTouchMove={onTouchPressRelease} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchPressRelease} onMouseDown={onClickPress} onMouseMove={onClickPressRelease} onMouseUp={onClickPressRelease} onMouseLeave={onClickPressRelease} className="relative pb-7/12 rounded overflow-hidden">
          {renderImage()}
        </div>
      </div>
      <div className="flex-1 min-w-0 py-3.5 pl-3 sm:pl-4">
        <a className="group focus:outline-none" href={ensureContainUrlProtocol(url)} target="_blank" rel="noreferrer">
          <h4 className={`text-sm text-gray-800 font-semibold text-left leading-5 rounded-sm ${classNames} line-clamp-3 group-hover:text-gray-900 group-focus:ring`}>{title}</h4>
        </a>
        <div className="flex justify-start items-center pt-0.5">
          {renderFavicon()}
          <div className="flex-shrink flex-grow min-w-0">
            <p className="pl-2 text-sm text-gray-500 text-left truncate hover:text-gray-600">
              <a className="rounded-sm focus:outline-none focus:ring" href={origin} target="_blank" rel="noreferrer">
                {host}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="flex-grow-0 flex-shrink-0 flex justify-end items-center -mr-3 sm:-mr-1">
        {canArchive && <button onClick={onArchiveBtnClick} className="px-2.5 py-3.5 rounded group focus:outline-none focus:ring" title={ARCHIVE}>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
          </svg>
        </button>}
        {canRemove && <button onClick={onRemoveBtnClick} className="px-2.5 py-3.5 rounded group focus:outline-none focus:ring" title={REMOVE}>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
          </svg>
        </button>}
        {canRestore && <button onClick={onRestoreBtnClick} className="px-2.5 py-3.5 rounded group focus:outline-none focus:ring" title={RESTORE}>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.8034 5.19398C11.9177 2.30766 7.26822 2.27141 4.33065 5.0721L3 3.66082V8.62218H7.6776L6.38633 7.25277C8.14886 5.56148 10.9471 5.58024 12.6821 7.31527C15.3953 10.0285 13.7677 14.9973 9.25014 14.9973V17.9974C11.5677 17.9974 13.384 17.2199 14.8034 15.8005C17.7322 12.8716 17.7322 8.12279 14.8034 5.19398V5.19398Z" />
          </svg>
        </button>}
        <button onClick={onMenuBtnClick} className="px-2 py-1 group focus:outline-none">
          <svg className="py-2 w-6 text-gray-400 rounded-full group-hover:text-gray-500 group-focus:ring" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ListItemContent);
