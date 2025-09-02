import React, { useState, useEffect, useRef, useMemo } from 'react';
import GracefulImage from 'react-graceful-image';

import { useSelector, useDispatch } from '../store';
import { updatePopup, updateBulkEdit } from '../actions';
import {
  updateSelectingLinkId, addSelectedLinkIds, moveLinks, updateQueryString,
} from '../actions/chunk';
import {
  CARD_ITEM_MENU_POPUP, COLOR, PATTERN, IMAGE, MY_LIST, ARCHIVE, TRASH, ADDING, MOVING,
  UPDATING, EXTRD_UPDATING, LG_WIDTH, REMOVE, RESTORE, PINNED, TAGGED,
} from '../types/const';
import { makeGetCustomImage, makeGetTnAndDns } from '../selectors';
import {
  removeTailingSlash, ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  extractUrl, isDecorValid, prependDomainName, adjustRect,
} from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const ListItemContent = (props) => {

  const { link, pinStatus, tagStatus } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getCustomImage = useMemo(makeGetCustomImage, []);
  const getTnAndDns = useMemo(makeGetTnAndDns, []);
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const customImage = useSelector(state => getCustomImage(state, link));
  const tnAndDns = useSelector(state => getTnAndDns(state, link));
  const [extractedFaviconError, setExtractedFaviconError] = useState(false);
  const clickPressTimer = useRef(null);
  const touchPressTimer = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

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
    dispatch(updateSelectingLinkId(link.id));

    const rect = e.currentTarget.getBoundingClientRect();
    const nRect = adjustRect(rect, 8, 12, -20, -12);
    dispatch(updatePopup(CARD_ITEM_MENU_POPUP, true, nRect));
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

  const { url, decor, extractedResult, custom, doIgnoreExtrdRst } = link;
  const { host, origin } = extractUrl(url);

  const renderImage = () => {
    let image;

    if (customImage) image = customImage;
    if (image) {
      {/* eslint-disable-next-line @next/next/no-img-element */ }
      return <img key="img-image-custom" className={tailwind('absolute h-full w-full object-cover object-center ring-1 ring-black/5')} src={image} alt={`illustration of ${url}`} />;
    }

    if (extractedResult && extractedResult.image && !doIgnoreExtrdRst) {
      image = extractedResult.image;
    }
    if (image) {
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="image-graceful-image-extracted-result" className={tailwind('absolute h-full w-full object-cover object-center ring-1 ring-black/5')} src={image} alt={`illustration of ${url}`} />;
    }

    // Only plain color background or plain color background with a letter
    if (isDecorValid(decor) && decor.image.bg.type === COLOR) {
      return <div className={tailwind(`absolute h-full w-full ${decor.image.bg.value}`)} />;
    }

    // Only pattern background or pattern background with a big letter
    if (isDecorValid(decor) && decor.image.bg.type === PATTERN) {
      // Require both 'pattern' and [pattern_name] class names
      return <div className={tailwind(`absolute h-full w-full pattern ${decor.image.bg.value}`)} />;
    }

    // Random image
    if (isDecorValid(decor) && decor.image.bg.type === IMAGE) {
      return <GracefulImage key="image-graceful-image-decor" className={tailwind('absolute h-full w-full object-cover object-center')} src={prependDomainName(decor.image.bg.value)} alt={`illustration of ${url}`} />;
    }

    console.log(`In ListItemContent.renderImage, invalid decor: ${JSON.stringify(decor)}`);
    return null;
  };

  const renderFavicon = () => {
    const placeholder = (ref) => {
      if (isDecorValid(decor) && decor.favicon.bg.type === COLOR) {
        return <div ref={ref} className={tailwind(`h-3.5 w-3.5 flex-shrink-0 flex-grow-0 rounded-full ${decor.favicon.bg.value}`)} />;
      }

      if (isDecorValid(decor) && decor.favicon.bg.type === PATTERN) {
        // Require both 'pattern' and [pattern_name] class names
        // Require under relative class
        return (
          <div ref={ref} className={tailwind('flex-shrink-0 flex-grow-0')}>
            <div className={tailwind('relative overflow-hidden rounded-full')}>
              <div className={tailwind(`h-3.5 w-3.5 rounded-full pattern ${decor.favicon.bg.value}`)} />
            </div>
          </div>
        );
      }

      return null;
    };

    let favicon;
    if (extractedResult && extractedResult.favicon && !doIgnoreExtrdRst) {
      favicon = ensureContainUrlSecureProtocol(extractedResult.favicon);
    }

    if (favicon && !extractedFaviconError) {
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="favicon-graceful-image-extracted-result" className={tailwind('h-3.5 w-3.5 flex-shrink-0 flex-grow-0 overflow-hidden')} src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} onError={onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = removeTailingSlash(origin) + '/favicon.ico';
    favicon = ensureContainUrlSecureProtocol(favicon);

    return <GracefulImage key="favicon-graceful-image-ico" className={tailwind('h-3.5 w-3.5 flex-shrink-0 flex-grow-0 overflow-hidden')} src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} />;
  };

  const renderTags = () => {
    if (tnAndDns.length === 0) return null;

    return (
      <div className={tailwind('-mt-3.5 flex items-center')}>
        <div className={tailwind('w-16 flex-shrink-0 flex-grow-0 pl-px')} />
        <div className={tailwind('min-w-0 flex-1 pb-3.5 pl-3 sm:pl-4')}>
          <div className={tailwind('flex flex-wrap items-center justify-start pt-1')}>
            {tnAndDns.map((tnAndDn, i) => {
              return (
                <button key={tnAndDn.tagName} onClick={() => dispatch(updateQueryString(tnAndDn.tagName))} className={tailwind(`group mt-2 block max-w-full rounded-full bg-gray-100 px-2 py-1 hover:bg-gray-200 focus:outline-none focus:ring blk:bg-gray-700 blk:hover:bg-gray-600 ${i === 0 ? '' : 'ml-2'}`)}>
                  <div className={tailwind('truncate text-xs text-gray-500 group-hover:text-gray-700 blk:text-gray-300 blk:group-hover:text-gray-100')}>{tnAndDn.displayName}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  let title, classNames = '';
  if (custom && custom.title) {
    title = custom.title;
  } else if (extractedResult && extractedResult.title && !doIgnoreExtrdRst) {
    title = extractedResult.title;
  }
  if (!title) {
    title = url;
    classNames = 'break-all';
  }

  const canSelect = (
    safeAreaWidth >= LG_WIDTH &&
    ![ADDING, MOVING, UPDATING, EXTRD_UPDATING].includes(link.status) &&
    [null, PINNED].includes(pinStatus) &&
    [null, TAGGED].includes(tagStatus)
  );

  const canArchive = canSelect && ![ARCHIVE, TRASH].includes(listName) && !queryString;
  const canRemove = canSelect && (listName !== TRASH || queryString);
  const canRestore = canSelect && listName === TRASH && !queryString;

  return (
    <React.Fragment>
      <div className={tailwind('flex items-center')}>
        <div className={tailwind('w-16 flex-shrink-0 flex-grow-0 pl-px')}>
          <div onTouchStart={onTouchPress} onTouchMove={onTouchPressRelease} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchPressRelease} onMouseDown={onClickPress} onMouseMove={onClickPressRelease} onMouseUp={onClickPressRelease} onMouseLeave={onClickPressRelease} className={tailwind('relative overflow-hidden rounded pb-[58.333333%]')}>
            {renderImage()}
          </div>
        </div>
        <div className={tailwind('min-w-0 flex-1 py-3.5 pl-3 sm:pl-4')}>
          <a className={tailwind('group focus:outline-none')} href={ensureContainUrlProtocol(url)} target="_blank" rel="noreferrer">
            <h4 className={tailwind(`rounded-xs text-left text-sm font-semibold leading-5 text-gray-800 line-clamp-3 group-hover:text-gray-900 group-focus:ring blk:text-gray-100 blk:group-hover:text-white ${classNames}`)}>{title}</h4>
          </a>
          <div className={tailwind('flex items-center justify-start pt-0.5')}>
            {renderFavicon()}
            <div className={tailwind('min-w-0 flex-shrink flex-grow')}>
              <p className={tailwind('truncate pl-2 text-left text-sm text-gray-500 blk:text-gray-400')}>
                <a className={tailwind('rounded-xs hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={origin} target="_blank" rel="noreferrer">
                  {host}
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className={tailwind('-mr-3 flex flex-shrink-0 flex-grow-0 items-center justify-end sm:-mr-1')}>
          {canArchive && <button onClick={onArchiveBtnClick} className={tailwind('group rounded px-2.5 py-3.5 focus:outline-none focus:ring')} title={ARCHIVE}>
            <svg className={tailwind('h-5 w-5 text-gray-400 group-hover:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
            </svg>
          </button>}
          {canRemove && <button onClick={onRemoveBtnClick} className={tailwind('group rounded px-2.5 py-3.5 focus:outline-none focus:ring')} title={REMOVE}>
            <svg className={tailwind('h-5 w-5 text-gray-400 group-hover:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
            </svg>
          </button>}
          {canRestore && <button onClick={onRestoreBtnClick} className={tailwind('group rounded px-2.5 py-3.5 focus:outline-none focus:ring')} title={RESTORE}>
            <svg className={tailwind('h-5 w-5 text-gray-400 group-hover:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.8034 5.19398C11.9177 2.30766 7.26822 2.27141 4.33065 5.0721L3 3.66082V8.62218H7.6776L6.38633 7.25277C8.14886 5.56148 10.9471 5.58024 12.6821 7.31527C15.3953 10.0285 13.7677 14.9973 9.25014 14.9973V17.9974C11.5677 17.9974 13.384 17.2199 14.8034 15.8005C17.7322 12.8716 17.7322 8.12279 14.8034 5.19398V5.19398Z" />
            </svg>
          </button>}
          <button onClick={onMenuBtnClick} className={tailwind('group px-2 py-1 focus:outline-none')}>
            <svg className={tailwind('w-6 rounded-full py-2 text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      {renderTags()}
    </React.Fragment>
  );
};

export default React.memo(ListItemContent);
