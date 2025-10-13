import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Text, TouchableOpacity, Animated } from 'react-native';
import { connect } from 'react-redux';
import { Flow } from 'react-native-animated-spinkit';

import { fetchMore, updateFetchedMore } from '../actions/chunk';
import {
  PC_100, PC_50, PC_33, TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT,
  SEARCH_POPUP_HEIGHT, MD_WIDTH,
} from '../types/const';
import {
  getLinks, getIsFetchingMore, getHasFetchedMore, getThemeMode,
} from '../selectors';
import { popupFMV } from '../types/animConfigs';
import { toPx, multiplyPercent } from '../utils';
import cache from '../utils/cache';
import vars from '../vars';

import { withTailwind } from '.';

import CardLoadingContentItem from './CardLoadingContentItem';
import CardItem from './CardItem';
import EmptyContent from './EmptyContent';

const PANEL_HEAD = 'PANEL_HEAD';
const PANEL_BODY = 'PANEL_BODY';
const PANEL_FOOTER = 'PANEL_FOOTER';
const PANEL_PADDING_BOTTOM = 'PANEL_PADDING_BOTTOM';

class CardPanel extends React.PureComponent<any, any> {

  panelFlatList: any;
  scrollYEvent: any;

  constructor(props) {
    super(props);

    this.panelFlatList = React.createRef();
    this.scrollYEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.props.scrollY } } }],
      { listener: this.onScroll, useNativeDriver: true },
    );
  }

  componentDidMount() {
    this.resetScroll();
  }

  componentDidUpdate(prevProps) {
    if (this.props.listChangedCount !== prevProps.listChangedCount) {
      this.resetScroll();
    }
  }

  resetScroll = () => {
    setTimeout(() => {
      if (this.panelFlatList.current) {
        this.panelFlatList.current.scrollToOffset({ offset: 0, animated: false });
      }
      Animated.timing(this.props.scrollY, { toValue: 0, ...popupFMV.visible }).start();
      vars.scrollPanel.scrollY = 0;
    }, 100);
  };

  getItemId = (item) => {
    return item.id;
  };

  onScroll = (e) => {
    const contentHeight = e.nativeEvent.contentSize.height;
    const layoutHeight = e.nativeEvent.layoutMeasurement.height;
    const scrollY = e.nativeEvent.contentOffset.y;

    vars.scrollPanel.contentHeight = contentHeight;
    vars.scrollPanel.layoutHeight = layoutHeight;
    vars.scrollPanel.scrollY = scrollY;
  };

  onEndReached = () => {
    // if has more, not fetching more, and at the bottom
    const { hasMore, hasFetchedMore, isFetchingMore } = this.props;
    if (!hasMore || hasFetchedMore || isFetchingMore) {
      return;
    }

    this.props.fetchMore();
  };

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  };

  onUpdateFetchedBtnClick = () => {
    this.props.updateFetchedMore();
  };

  renderEmpty = () => {
    return <EmptyContent />;
  };

  renderFetchMoreBtn = () => {
    const { tailwind } = this.props;

    return (
      <TouchableOpacity onPress={this.onFetchMoreBtnClick} style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>More</Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderFetchingMore = () => {
    const { tailwind } = this.props;

    return (
      <View style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <Flow size={48} color="rgb(156, 163, 175)" />
      </View>
    );
  };

  renderUpdateFetchedBtn = () => {
    const { tailwind } = this.props;

    return (
      <TouchableOpacity onPress={this.onUpdateFetchedBtnClick} style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Show more</Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderItem = ({ item }) => {
    const { tailwind } = this.props;
    const { columnWidth, columnIndex } = item;

    let classNames = '';
    if (columnWidth === PC_100) {
      classNames = 'px-4 pb-4';
    } else if (columnWidth === PC_50) {
      if (columnIndex === 0) classNames = 'pl-6 pr-3';
      else if (columnIndex === 1) classNames = 'pl-3 pr-6';
      else throw new Error(`Invalid columnIndex: ${columnIndex}`);

      classNames += ' pb-6';
    } else if (columnWidth === PC_33) {
      if (columnIndex === 0) classNames = 'pl-8 pr-2';
      else if (columnIndex === 1) classNames = 'pr-5 pl-5';
      else if (columnIndex === 2) classNames = 'pl-2 pr-8';
      else throw new Error(`Invalid columnIndex: ${columnIndex}`);

      classNames += ' pb-7';
    }

    if (item.data.isLoading) {
      return <CardLoadingContentItem style={tailwind(classNames)} />;
    }
    return <CardItem style={tailwind(classNames)} link={item.data} />;
  };

  renderColumn = ({ item }) => {
    const { columnWidth, safeAreaWidth } = this.props;
    const width = Math.floor(
      multiplyPercent(Math.min(safeAreaWidth, 1152), columnWidth)
    );

    let initialNumToRender, maxToRenderPerBatch;
    if (columnWidth === PC_100) {
      initialNumToRender = 3;
      maxToRenderPerBatch = 3;
    } else if (columnWidth === PC_50) {
      initialNumToRender = 3;
      maxToRenderPerBatch = 3;
    } else if (columnWidth === PC_33) {
      initialNumToRender = 2;
      maxToRenderPerBatch = 2;
    } else throw new Error(`Invalid columnWidth: ${columnWidth}`);

    return (
      // There is a bug if removeClippedSubviews is true
      //   as on the doc page, it's said use at your own risk.
      <FlatList
        style={cache('CP_flatListColumn', { width }, [safeAreaWidth])}
        data={item.data}
        keyExtractor={this.getItemId}
        renderItem={this.renderItem}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        removeClippedSubviews={false} />
    );
  };

  renderPanel = ({ item }) => {
    const { hasFetchedMore, isFetchingMore, safeAreaWidth, tailwind } = this.props;

    if (item.id === PANEL_HEAD) {
      let pt = toPx(TOP_BAR_HEIGHT_MD) + toPx('2.5rem');
      if (safeAreaWidth < toPx(MD_WIDTH)) {
        pt = toPx(TOP_BAR_HEIGHT) + toPx('1.5rem');
      }

      return (
        <View style={cache('CP_panelHead', { paddingTop: pt }, [safeAreaWidth])} />
      );
    }

    if (item.id === PANEL_BODY) {
      const { columnWidth } = this.props;

      let links = this.props.links;
      if (!Array.isArray(links)) {
        let nLinks = 2;
        if (columnWidth === PC_50) nLinks = 4;
        if (columnWidth === PC_33) nLinks = 6;

        links = [];
        for (let i = 0; i < nLinks; i++) links.push({ id: i, isLoading: true });
      }

      const colData = [];
      if (links.length > 0) {
        if (columnWidth === PC_100) {
          let colItems = links.map(link => {
            return { id: link.id, data: link, columnWidth, columnIndex: 0 };
          });
          colData.push({ id: 'col-0', data: colItems });
        } else if (columnWidth === PC_50) {
          let colItems = links.filter((_, i) => i % 2 === 0).map(link => {
            return { id: link.id, data: link, columnWidth, columnIndex: 0 };
          });
          colData.push({ id: 'col-0', data: colItems });

          colItems = links.filter((_, i) => i % 2 === 1).map(link => {
            return { id: link.id, data: link, columnWidth, columnIndex: 1 };
          });
          colData.push({ id: 'col-1', data: colItems });
        } else if (columnWidth === PC_33) {
          let colItems = links.filter((_, i) => i % 3 === 0).map(link => {
            return { id: link.id, data: link, columnWidth, columnIndex: 0 };
          });
          colData.push({ id: 'col-0', data: colItems });

          colItems = links.filter((_, i) => i % 3 === 1).map(link => {
            return { id: link.id, data: link, columnWidth, columnIndex: 1 };
          });
          colData.push({ id: 'col-1', data: colItems });

          colItems = links.filter((_, i) => i % 3 === 2).map(link => {
            return { id: link.id, data: link, columnWidth, columnIndex: 2 };
          });
          colData.push({ id: 'col-2', data: colItems });
        } else {
          throw new Error(`Invalid columnWidth: ${columnWidth}`);
        }
      }

      return (
        <FlatList
          style={tailwind('flex-row')}
          data={colData}
          keyExtractor={this.getItemId}
          renderItem={this.renderColumn}
          ListEmptyComponent={this.renderEmpty}
          removeClippedSubviews={false} />
      );
    }

    if (item.id === PANEL_FOOTER) {
      if (hasFetchedMore) return this.renderUpdateFetchedBtn();
      if (isFetchingMore) return this.renderFetchingMore();
      return this.renderFetchMoreBtn();
    }

    if (item.id === PANEL_PADDING_BOTTOM) {
      const pb = toPx(BOTTOM_BAR_HEIGHT) + toPx(SEARCH_POPUP_HEIGHT);
      return (
        <View style={cache('CP_panelPB', { paddingBottom: pb })} />
      );
    }

    throw new Error(`Invalid item.id: ${item.id}`);
  };

  render() {
    const { hasMore, columnWidth, tailwind } = this.props;

    const panelData = [{ id: PANEL_HEAD }, { id: PANEL_BODY }];
    if (hasMore) panelData.push({ id: PANEL_FOOTER });
    if (columnWidth === PC_100) panelData.push({ id: PANEL_PADDING_BOTTOM });

    return (
      <Animated.FlatList
        ref={this.panelFlatList}
        contentContainerStyle={tailwind('max-w-6xl self-center')}
        data={panelData}
        keyExtractor={this.getItemId}
        renderItem={this.renderPanel}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.2}
        removeClippedSubviews={false}
        onScroll={this.scrollYEvent}
        scrollEventThrottle={16}
        overScrollMode="always" />
    );
  }
}

CardPanel.propTypes = {
  columnWidth: PropTypes.string.isRequired,
  scrollY: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    links: getLinks(state),
    hasMore: state.display.hasMoreLinks,
    isFetchingMore: getIsFetchingMore(state),
    hasFetchedMore: getHasFetchedMore(state),
    listChangedCount: state.display.listChangedCount,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { fetchMore, updateFetchedMore };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(CardPanel));
