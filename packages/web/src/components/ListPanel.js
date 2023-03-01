import React, { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchMore, updateFetchedMore } from '../actions';
import {
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH, PC_100,
} from '../types/const';
import { getLinks, getIsFetchingMore } from '../selectors';
import { addRem, getWindowHeight, getWindowScrollHeight, throttle } from '../utils';
import vars from '../vars';

import { useSafeAreaFrame, useTailwind } from '.';
import ListItem from './ListItem';
import EmptyContent from './EmptyContent';

const ListPanel = (props) => {

  const { columnWidth } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const hasMore = useSelector(state => state.hasMoreLinks[listName]);
  const hasFetchedMore = useSelector(
    state => state.fetchedMore[listName] ? true : false
  );
  const isFetchingMore = useSelector(state => getIsFetchingMore(state));
  const listChangedCount = useSelector(state => state.display.listChangedCount);
  const hasMoreRef = useRef(hasMore);
  const hasFetchedMoreRef = useRef(hasFetchedMore);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  let links = useSelector(getLinks);
  if (!links) {
    console.log(`Invalid links: ${links}. Links cannot be undefined as in LinkSelector and if links is null, it should be handled in Main, not in ListPanel.`);
    links = [];
  }

  const updateScrollY = useCallback(() => {
    // https://gist.github.com/enqtran/25c6b222a73dc497cc3a64c090fb6700
    const scrollHeight = getWindowScrollHeight()
    const windowHeight = getWindowHeight();
    const scrollTop = window.pageYOffset;

    vars.scrollPanel.contentHeight = scrollHeight;
    vars.scrollPanel.layoutHeight = windowHeight;
    vars.scrollPanel.pageYOffset = scrollTop;

    if (
      !hasMoreRef.current || hasFetchedMoreRef.current || isFetchingMoreRef.current
    ) return;

    const windowBottom = windowHeight + scrollTop;
    if (windowBottom > (scrollHeight * 0.96)) dispatch(fetchMore());
  }, [dispatch]);

  const onFetchMoreBtnClick = () => {
    dispatch(fetchMore());
  };

  const onUpdateFetchedBtnClick = () => {
    dispatch(updateFetchedMore());
  };

  const renderEmpty = () => {
    vars.scrollPanel.pageYOffset = 0;
    return <EmptyContent />;
  };

  const renderFetchMoreBtn = () => {
    return (
      <div className={tailwind('my-4 px-4 sm:px-6')}>
        <button onClick={onFetchMoreBtnClick} className={tailwind('group block w-full py-2 focus:outline-none')}>
          <span className={tailwind('inline-block rounded-full border border-gray-400 bg-white px-3 py-1 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>More</span>
        </button>
      </div>
    );
  };

  const renderFetchingMore = () => {
    return (
      <div className={tailwind('my-6 flex items-center justify-center')}>
        <div className={tailwind('lds-ellipsis')}>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
        </div>
      </div>
    );
  };

  const renderUpdateFetchedBtn = () => {
    return (
      <div className={tailwind('my-4 px-4 sm:px-6')}>
        <button onClick={onUpdateFetchedBtnClick} className={tailwind('group block w-full py-2 focus:outline-none')}>
          <span className={tailwind('inline-block rounded-full border border-gray-400 bg-white px-3 py-1 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>Show more</span>
        </button>
      </div>
    );
  };

  const renderItems = () => {
    return (
      <ul className={tailwind('divide-y divide-gray-200 blk:divide-gray-700')}>
        {links.map(link => <ListItem key={link.id} link={link} />)}
      </ul>
    );
  };

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
      vars.scrollPanel.pageYOffset = 0;
    }, 1);
  }, [listChangedCount]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
    hasFetchedMoreRef.current = hasFetchedMore;
    isFetchingMoreRef.current = isFetchingMore;
  }, [hasMore, hasFetchedMore, isFetchingMore]);

  useEffect(() => {
    // throttle may refer to stale updateScrollY with old isFetchingMore,
    //   use refs to access current values to prevent duplicate fetchMore.
    const listener = throttle(updateScrollY, 16);

    window.addEventListener('scroll', listener);
    return () => {
      window.removeEventListener('scroll', listener);
    };
  }, [updateScrollY]);

  let fetchMoreBtn;
  if (!hasMore) fetchMoreBtn = null;
  else if (hasFetchedMore) fetchMoreBtn = renderUpdateFetchedBtn();
  else if (isFetchingMore) fetchMoreBtn = renderFetchingMore();
  else fetchMoreBtn = renderFetchMoreBtn();

  let paddingBottom = '1.5rem';
  if (columnWidth === PC_100) {
    paddingBottom = addRem(SEARCH_POPUP_HEIGHT, addRem(BOTTOM_BAR_HEIGHT, '1.5rem'));
  }

  const style = {
    paddingTop: safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD,
    paddingBottom,
  };

  return (
    <div style={style} className={tailwind('relative mx-auto max-w-6xl px-4 md:px-6 lg:px-8')}>
      <div className={tailwind('pt-6')}>
        {links.length === 0 && renderEmpty()}
        {links.length > 0 && renderItems()}
        {fetchMoreBtn}
      </div>
    </div>
  );
};

export default React.memo(ListPanel);
