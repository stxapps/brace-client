import React, { useEffect, useRef, useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { Flow } from 'react-native-animated-spinkit';

import { fetchMore, updatePageYOffset } from '../actions';
import {
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH, PC_100,
} from '../types/const';
import { getLinks, getIsFetchingMore } from '../selectors';
import { toPx } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import ListItem from './ListItem';
import EmptyContent from './EmptyContent';

const PANEL_HEAD = 'PANEL_HEAD';
const PANEL_BODY = 'PANEL_BODY';
const PANEL_FOOTER = 'PANEL_FOOTER';
const PANEL_PADDING_BOTTOM = 'PANEL_PADDING_BOTTOM';

const ListPanel = (props) => {

  const { columnWidth, scrollYEvent } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const hasMore = useSelector(state => state.hasMoreLinks[listName]);
  const isFetchingMore = useSelector(state => getIsFetchingMore(state));
  const listChangedCount = useSelector(state => state.display.listChangedCount);
  const flatList = useRef(null);
  const dispatch = useDispatch();

  let links = useSelector(getLinks);
  if (!links) {
    console.log(`Invalid links: ${links}. Links cannot be undefined as in LinkSelector and if links is null, it should be handled in Main, not in ListPanel.`);
    links = [];
  }

  const onScrollEnd = useCallback((e) => {
    dispatch(updatePageYOffset(e.nativeEvent.contentOffset.y));
  }, [dispatch]);

  const onFetchMoreBtnClick = useCallback(() => {
    dispatch(fetchMore());
  }, [dispatch]);

  const onEndReached = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    dispatch(fetchMore());
  }, [hasMore, isFetchingMore, dispatch]);

  const getItemId = useCallback((item) => {
    return item.id;
  }, []);

  const renderEmpty = useCallback(() => {
    return <EmptyContent />;
  }, []);

  const renderFetchMoreBtn = useCallback(() => {
    return (
      <TouchableOpacity onPress={onFetchMoreBtnClick} style={tailwind('my-4 py-2 flex-row justify-center w-full')}>
        <View style={tailwind('px-3 py-1 bg-white border border-gray-400 rounded-full')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>More</Text>
        </View>
      </TouchableOpacity>
    );
  }, [onFetchMoreBtnClick]);

  const renderFetchingMore = useCallback(() => {
    return (
      <View style={tailwind('my-6 py-4 flex-row justify-center w-full')}>
        <Flow size={48} color="rgb(156, 163, 175)" />
      </View>
    );
  }, []);

  const renderItem = useCallback(({ item }) => {
    return <ListItem link={item} />;
  }, []);

  const renderPanel = useCallback(({ item }) => {
    if (item.id === PANEL_HEAD) {
      let pt = safeAreaWidth < MD_WIDTH ? toPx(TOP_BAR_HEIGHT) : toPx(TOP_BAR_HEIGHT_MD);
      pt += toPx('1.5rem');
      return (
        <View style={cache('LP_panelHead', { paddingTop: pt }, safeAreaWidth)} />
      );
    }

    if (item.id === PANEL_BODY) {
      return (
        <FlatList
          data={links}
          keyExtractor={getItemId}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          removeClippedSubviews={false} />
      );
    }

    if (item.id === PANEL_FOOTER) {
      return isFetchingMore ? renderFetchingMore() : renderFetchMoreBtn();
    }

    if (item.id === PANEL_PADDING_BOTTOM) {
      const pb = toPx(BOTTOM_BAR_HEIGHT) + toPx(SEARCH_POPUP_HEIGHT);
      return (
        <View style={cache('LP_panelPB', { paddingBottom: pb })} />
      );
    }

    throw new Error(`Invalid item.id: ${item.id}`);
  }, [
    links, isFetchingMore, getItemId, renderItem, renderEmpty, renderFetchMoreBtn,
    renderFetchingMore, safeAreaWidth,
  ]);

  useEffect(() => {
    if (flatList.current) {
      setTimeout(() => {
        if (flatList.current) {
          flatList.current.scrollToOffset({ offset: 0, animated: true });
        }
      }, 1);
    }
  }, [listChangedCount]);

  const panelData = [{ id: PANEL_HEAD }, { id: PANEL_BODY }];
  if (hasMore) panelData.push({ id: PANEL_FOOTER });
  if (columnWidth === PC_100) panelData.push({ id: PANEL_PADDING_BOTTOM });

  return (
    <Animated.FlatList
      ref={flatList}
      contentContainerStyle={tailwind('w-full max-w-6xl self-center px-4 md:px-6 lg:px-8', safeAreaWidth)}
      data={panelData}
      keyExtractor={getItemId}
      renderItem={renderPanel}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.9}
      removeClippedSubviews={false}
      onScroll={scrollYEvent}
      scrollEventThrottle={16}
      onScrollEndDrag={onScrollEnd}
      onMomentumScrollEnd={onScrollEnd}
      overScrollMode="always" />
  );
};

export default React.memo(ListPanel);
