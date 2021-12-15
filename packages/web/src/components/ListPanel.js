import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimateSharedLayout } from "framer-motion";

import { fetchMore } from '../actions';
import {
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH, PC_100,
} from '../types/const';
import { getLinks, getIsFetchingMore } from '../selectors';
import { addRem, getWindowHeight, getWindowScrollHeight, throttle } from '../utils';
import { cardItemFMV } from '../types/animConfigs';

import ListItem from './ListItem';
import EmptyContent from './EmptyContent';

const ListPanel = (props) => {

  const { columnWidth } = props;
  const listName = useSelector(state => state.display.listName);
  const hasMore = useSelector(state => state.hasMoreLinks[listName]);
  const isFetchingMore = useSelector(state => getIsFetchingMore(state));
  const listChangedCount = useSelector(state => state.display.listChangedCount);
  const dispatch = useDispatch();

  let links = useSelector(getLinks);
  if (!links) {
    console.log(`Invalid links: ${links}. Links cannot be undefined as in LinkSelector and if links is null, it should be handled in Main, not in ListPanel.`);
    links = [];
  }

  const updateScrollY = throttle(() => {
    if (!hasMore || isFetchingMore) return;

    // https://gist.github.com/enqtran/25c6b222a73dc497cc3a64c090fb6700
    const scrollHeight = getWindowScrollHeight()
    const windowHeight = getWindowHeight();
    const windowBottom = windowHeight + window.pageYOffset;

    if (windowBottom > (scrollHeight * 0.96)) dispatch(fetchMore());
  }, 16);

  const onFetchMoreBtnClick = () => {
    dispatch(fetchMore());
  }

  const renderFetchMoreBtn = () => {
    return (
      <div className="my-6 px-4 sm:px-6">
        <button onClick={onFetchMoreBtnClick} className="py-2 block w-full group focus:outline-none">
          <span className="px-3 py-1 inline-block bg-white text-sm text-gray-500 border border-gray-400 rounded-full group-hover:text-gray-600 group-hover:border-gray-500 group-focus:ring">More</span>
        </button>
      </div>
    );
  };

  const renderFetchingMore = () => {
    return (
      <div className="flex justify-center items-center my-6">
        <div className="lds-ellipsis">
          <div className="bg-gray-400"></div>
          <div className="bg-gray-400"></div>
          <div className="bg-gray-400"></div>
          <div className="bg-gray-400"></div>
        </div>
      </div>
    );
  };

  const renderItems = () => {
    return (
      <ul className="divide-y divide-gray-200">
        <AnimateSharedLayout>
          {links.map(link => {
            return (
              <motion.div key={link.id} layoutId={link.id} variants={cardItemFMV} initial="hidden" animate="visible">
                <ListItem link={link} />
              </motion.div>
            );
          })}
        </AnimateSharedLayout>
      </ul>
    );
  };

  useEffect(() => {
    setTimeout(() => window.scrollTo(0, 0), 1);
  }, [listChangedCount]);

  useEffect(() => {
    window.addEventListener('scroll', updateScrollY);

    return () => {
      window.removeEventListener('scroll', updateScrollY);
    };
  }, [updateScrollY]);

  const showFetchMoreBtn = hasMore && !isFetchingMore;
  const showFetchingMore = hasMore && isFetchingMore;

  let paddingBottom = '1.5rem';
  if (columnWidth === PC_100) {
    paddingBottom = addRem(SEARCH_POPUP_HEIGHT, addRem(BOTTOM_BAR_HEIGHT, '1.5rem'));
  }

  const style = {
    paddingTop: window.innerWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD,
    paddingBottom,
  };

  return (
    <div style={style} className="mx-auto px-4 relative max-w-6xl md:px-6 lg:px-8">
      <div className="pt-3 md:pt-6">
        {links.length === 0 && <EmptyContent />}
        {links.length > 0 && renderItems()}
        {showFetchMoreBtn && renderFetchMoreBtn()}
        {showFetchingMore && renderFetchingMore()}
      </div>
    </div>
  );
};

export default React.memo(ListPanel);
