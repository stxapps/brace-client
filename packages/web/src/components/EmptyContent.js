import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup } from '../actions';
import { ADD_POPUP, MY_LIST, TRASH, ARCHIVE, BLK_MODE } from '../types/const';
import { getListNameMap, getThemeMode } from '../selectors';
import { getListNameDisplayName, getTagNameDisplayName } from '../utils';

import { useTailwind } from '.';

import emptyBox from '../images/empty-box-sided.svg';
import undrawLink from '../images/undraw-link.svg';
import undrawLinkBlk from '../images/undraw-link-blk.svg';
import saveLinkInUrlBar from '../images/save-link-in-url-bar.svg';
import saveLinkInUrlBarBlk from '../images/save-link-in-url-bar-get-started-blk.svg';

const EmptyContent = () => {

  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(getListNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const searchString = useSelector(state => state.display.searchString);
  const themeMode = useSelector(state => getThemeMode(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onAddBtnClick = () => {
    dispatch(updatePopup(ADD_POPUP, true));
  };

  let displayName = getListNameDisplayName(listName, listNameMap);
  let textName = `"Move to -> ${displayName}"`;
  if (listName === ARCHIVE) textName = `"${displayName}"`;
  if (queryString) {
    // Only tag name for now
    const tagName = queryString.trim();
    displayName = getTagNameDisplayName(tagName, tagNameMap);
    textName = `"Add tags or Manage tags"`;
  }

  if (searchString !== '') {
    return (
      <React.Fragment>
        <h3 className={tailwind('text-base text-gray-600 blk:text-gray-300')}>Your search - <span className={tailwind('text-lg font-medium text-gray-800 blk:text-gray-100')}>{searchString}</span> - did not match any links.</h3>
        <p className={tailwind('pt-4 text-base text-gray-500 blk:text-gray-400 md:pt-6')}>Suggestion:</p>
        <ul className={tailwind('list-inside list-disc pt-2 pl-2 text-base text-gray-500 blk:text-gray-400')}>
          <li>Make sure all words are spelled correctly.</li>
          <li>Try different keywords.</li>
          <li>Try more general keywords.</li>
        </ul>
      </React.Fragment>
    );
  }

  if (queryString) {
    return (
      <React.Fragment>
        <img className={tailwind('mx-auto mt-10 w-40')} src={emptyBox} alt="An empty box lying down" />
        <h3 className={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>No links in #{displayName}</h3>
        <p className={tailwind('mx-auto mt-2 max-w-md text-center text-base tracking-wide text-gray-500 blk:text-gray-400')}>Click <span className={tailwind('font-semibold')}>{textName}</span> from the menu to show links here.</p>
      </React.Fragment>
    );
  }

  if (listName === MY_LIST) {
    return (
      <div style={{ borderRadius: '1.5rem' }} className={tailwind('mx-auto w-full max-w-md bg-gray-50 px-4 pt-16 pb-8 blk:bg-gray-800')}>
        <img className={tailwind('mx-auto h-16')} src={themeMode === BLK_MODE ? undrawLinkBlk : undrawLink} alt="unDraw link icon" />
        <h3 className={tailwind('mt-6 text-center text-base text-gray-600 blk:text-gray-300')}>Get started saving links</h3>
        <button onClick={onAddBtnClick} style={{ padding: '0.4375rem 0.8rem 0.4375rem 0.65rem' }} className={tailwind('mx-auto mt-4 flex items-baseline rounded-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:hover:bg-white')}>
          <svg className={tailwind('w-3 text-white blk:text-gray-900')} viewBox="0 0 16 14" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={tailwind('ml-1 text-base font-medium text-gray-50 blk:text-gray-800')}>Save link</span>
        </button>
        <p className={tailwind('mx-auto mt-16 max-w-md text-center text-base text-gray-600 blk:text-gray-300')}>Or type <span className={tailwind('font-semibold')}>"brace.to/"</span> in front of any link <br className={tailwind('new-line-in-address-bar')} />in Address bar.</p>
        <img className={tailwind('mx-auto mt-4 w-full')} src={themeMode === BLK_MODE ? saveLinkInUrlBarBlk : saveLinkInUrlBar} alt="Save link at address bar" />
      </div>
    );
  }

  if (listName === TRASH) {
    return (
      <React.Fragment>
        <div className={tailwind('mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
          <svg className={tailwind('w-10 text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
          </svg>
        </div>
        <h3 className={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>No links in {displayName}</h3>
        <p className={tailwind('mx-auto mt-4 max-w-md text-center text-base tracking-wide text-gray-500 blk:text-gray-400')}>Click <span className={tailwind('font-semibold')}>"Remove"</span> from the menu to move links you don't need anymore here.</p>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <img className={tailwind('mx-auto mt-10 w-40')} src={emptyBox} alt="An empty box lying down" />
      <h3 className={tailwind('mt-6 text-center text-lg font-medium text-gray-800 blk:text-gray-200')}>No links in {displayName}</h3>
      <p className={tailwind('mx-auto mt-2 max-w-md text-center text-base tracking-wide text-gray-500 blk:text-gray-400')}>Click <span className={tailwind('font-semibold')}>{textName}</span> from the menu to move links here.</p>
    </React.Fragment>
  );
};

export default React.memo(EmptyContent);
