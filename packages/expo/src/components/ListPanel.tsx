import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { FlatList, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';

import { useSelector, useDispatch } from '../store';
import { fetchMore, updateFetchedMore } from '../actions/chunk';
import {
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH, PC_100,
} from '../types/const';
import { getLinks, getIsFetchingMore, getHasFetchedMore } from '../selectors';
import { popupFMV } from '../types/animConfigs';
import { toPx } from '../utils';
import cache from '../utils/cache';
import vars from '../vars';

import { useSafeAreaFrame, useTailwind } from '.';

import ListLoadingContentItem from './ListLoadingContentItem';
import ListItem from './ListItem';
import EmptyContent from './EmptyContent';

const PANEL_HEAD = 'PANEL_HEAD';
const PANEL_BODY = 'PANEL_BODY';
const PANEL_FOOTER = 'PANEL_FOOTER';
const PANEL_PADDING_BOTTOM = 'PANEL_PADDING_BOTTOM';

const ListPanel = (props) => {

  const { columnWidth, scrollY } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const links = useSelector(state => getLinks(state));
  const hasMore = useSelector(state => state.display.hasMoreLinks);
  const isFetchingMore = useSelector(state => getIsFetchingMore(state));
  const hasFetchedMore = useSelector(state => getHasFetchedMore(state));
  const listChangedCount = useSelector(state => state.display.listChangedCount);
  const flatList = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const getItemId = useCallback((item) => {
    return item.id;
  }, []);

  const onScroll = useCallback((e) => {
    const contentHeight = e.nativeEvent.contentSize.height;
    const layoutHeight = e.nativeEvent.layoutMeasurement.height;
    const contentOffsetY = e.nativeEvent.contentOffset.y;

    vars.scrollPanel.contentHeight = contentHeight;
    vars.scrollPanel.layoutHeight = layoutHeight;
    vars.scrollPanel.scrollY = contentOffsetY;
  }, []);

  const onEndReached = useCallback(() => {
    if (!hasMore || hasFetchedMore || isFetchingMore) return;
    dispatch(fetchMore());
  }, [hasMore, hasFetchedMore, isFetchingMore, dispatch]);

  const onFetchMoreBtnClick = useCallback(() => {
    dispatch(fetchMore());
  }, [dispatch]);

  const onUpdateFetchedBtnClick = useCallback(() => {
    dispatch(updateFetchedMore());
  }, [dispatch]);

  const renderEmpty = useCallback(() => {
    return <EmptyContent />;
  }, []);

  const renderFetchMoreBtn = useCallback(() => {
    return (
      <TouchableOpacity onPress={onFetchMoreBtnClick} style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>More</Text>
        </View>
      </TouchableOpacity>
    );
  }, [onFetchMoreBtnClick, tailwind]);

  const renderFetchingMore = useCallback(() => {
    return (
      <View style={tailwind('my-6 w-full flex-row justify-center py-4')}>
        <Flow size={48} color="rgb(156, 163, 175)" />
      </View>
    );
  }, [tailwind]);

  const renderUpdateFetchedBtn = useCallback(() => {
    return (
      <TouchableOpacity onPress={onUpdateFetchedBtnClick} style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Show more</Text>
        </View>
      </TouchableOpacity>
    );
  }, [onUpdateFetchedBtnClick, tailwind]);

  const renderItem = useCallback(({ item }) => {
    if (item.isLoading) {
      return <ListLoadingContentItem />;
    }
    return <ListItem link={item} />;
  }, []);

  const renderPanel = useCallback(({ item }) => {
    if (item.id === PANEL_HEAD) {
      let pt = safeAreaWidth < MD_WIDTH ? toPx(TOP_BAR_HEIGHT) : toPx(TOP_BAR_HEIGHT_MD);
      pt += toPx('1.5rem');
      return (
        <View style={cache('LP_panelHead', { paddingTop: pt }, [safeAreaWidth])} />
      );
    }

    if (item.id === PANEL_BODY) {
      let derivedLinks = links;
      if (!Array.isArray(derivedLinks)) {
        derivedLinks = [];
        for (let i = 0; i < 7; i++) derivedLinks.push({ id: i, isLoading: true });
      }

      return (
        <FlatList
          data={derivedLinks}
          keyExtractor={getItemId}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          removeClippedSubviews={false} />
      );
    }

    if (item.id === PANEL_FOOTER) {
      if (hasFetchedMore) return renderUpdateFetchedBtn();
      if (isFetchingMore) return renderFetchingMore();
      return renderFetchMoreBtn();
    }

    if (item.id === PANEL_PADDING_BOTTOM) {
      let pb = toPx('1.5rem');
      if (columnWidth === PC_100) {
        pb += toPx(BOTTOM_BAR_HEIGHT) + toPx(SEARCH_POPUP_HEIGHT);
      }

      return (
        <View style={cache('LP_panelPB', { paddingBottom: pb }, [columnWidth])} />
      );
    }

    throw new Error(`Invalid item.id: ${item.id}`);
  }, [
    links, hasFetchedMore, isFetchingMore, getItemId, renderItem, renderEmpty,
    renderFetchMoreBtn, renderFetchingMore, renderUpdateFetchedBtn, columnWidth,
    safeAreaWidth,
  ]);

  const scrollYEvent = useMemo(() => {
    return Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { listener: onScroll, useNativeDriver: true },
    );
  }, [scrollY, onScroll]);

  useEffect(() => {
    setTimeout(() => {
      if (flatList.current) {
        flatList.current.scrollToOffset({ offset: 0, animated: false });
      }
      Animated.timing(scrollY, { toValue: 0, ...popupFMV.visible }).start();
      vars.scrollPanel.scrollY = 0;
    }, 100);
  }, [scrollY, listChangedCount]);

  const panelData = [{ id: PANEL_HEAD }, { id: PANEL_BODY }];
  if (hasMore) panelData.push({ id: PANEL_FOOTER });
  panelData.push({ id: PANEL_PADDING_BOTTOM });

  return (
    <Animated.FlatList
      ref={flatList}
      contentContainerStyle={tailwind('w-full max-w-6xl self-center px-4 md:px-6 lg:px-8')}
      data={panelData}
      keyExtractor={getItemId}
      renderItem={renderPanel}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      removeClippedSubviews={false}
      onScroll={scrollYEvent}
      scrollEventThrottle={16}
      overScrollMode="always" />
  );
};

export default React.memo(ListPanel);
