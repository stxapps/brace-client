import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FlatList, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';

import { fetchMore, updatePageYOffset } from '../actions';
import {
  PC_100, PC_50, PC_33,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH,
} from '../types/const';
import { getLinks, getIsFetchingMore } from '../selectors';
import { toPx, multiplyPercent } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

import CardItem from './CardItem';
import EmptyContent from './EmptyContent';

const PANEL_HEAD = 'PANEL_HEAD';
const PANEL_BODY = 'PANEL_BODY';
const PANEL_FOOTER = 'PANEL_FOOTER';
const PANEL_PADDING_BOTTOM = 'PANEL_PADDING_BOTTOM';

class CardPanel extends React.PureComponent {

  constructor(props) {
    super(props);

    this.panelFlatList = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.props.listChangedCount !== prevProps.listChangedCount) {
      if (this.panelFlatList.current) {
        setTimeout(() => {
          if (this.panelFlatList.current) {
            this.panelFlatList.current.scrollToOffset({
              offset: 0,
              animated: true,
            });
          }
        }, 1);
      }
    }
  }

  updatePageYOffset = (e) => {
    this.props.updatePageYOffset(e.nativeEvent.contentOffset.y);
  }

  getItemId = (item) => {
    return item.id;
  }

  onEndReached = () => {
    // if has more, not fetching more, and at the bottom
    const { hasMoreLinks, isFetchingMore } = this.props;
    if (!hasMoreLinks || isFetchingMore) {
      return;
    }

    this.props.fetchMore();
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  }

  renderEmpty = () => {
    return <EmptyContent />;
  }

  renderFetchMoreBtn = () => {
    return (
      <TouchableOpacity onPress={this.onFetchMoreBtnClick} style={tailwind('my-4 py-2 flex-row justify-center w-full')}>
        <View style={tailwind('px-3 py-1 bg-white border border-gray-400 rounded-full')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>More</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderFetchingMore = () => {
    return (
      <View style={tailwind('my-4 py-2 flex-row justify-center w-full')}>
        <Flow size={48} color="rgb(156, 163, 175)" />
      </View>
    );
  }

  renderItem = ({ item }) => {

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

    return <CardItem style={tailwind(classNames)} link={item.data} />;
  }

  renderColumn = ({ item }) => {

    const { columnWidth, safeAreaWidth } = this.props;
    const width = Math.floor(multiplyPercent(Math.min(safeAreaWidth, 1152), columnWidth));

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
        style={cache('CP_flatListColumn', { width }, safeAreaWidth)}
        data={item.data}
        keyExtractor={this.getItemId}
        renderItem={this.renderItem}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        removeClippedSubviews={false} />
    );
  }

  renderPanel = ({ item }) => {

    const { isFetchingMore, safeAreaWidth } = this.props;

    if (item.id === PANEL_HEAD) {
      let pt = safeAreaWidth < MD_WIDTH ? toPx(TOP_BAR_HEIGHT) : toPx(TOP_BAR_HEIGHT_MD);
      pt += safeAreaWidth < MD_WIDTH ? toPx('1.5rem') : toPx('2.5rem');
      return (
        <View style={cache('CP_panelHead', { paddingTop: pt }, safeAreaWidth)} />
      );
    }

    if (item.id === PANEL_BODY) {

      const { links, columnWidth } = this.props;

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
      return isFetchingMore ? this.renderFetchingMore() : this.renderFetchMoreBtn();
    }

    if (item.id === PANEL_PADDING_BOTTOM) {
      const pb = toPx(BOTTOM_BAR_HEIGHT) + toPx(SEARCH_POPUP_HEIGHT);
      return (
        <View style={cache('CP_panelPB', { paddingBottom: pb })} />
      );
    }

    throw new Error(`Invalid item.id: ${item.id}`);
  }

  render() {

    const { hasMoreLinks, columnWidth } = this.props;

    const panelData = [{ id: PANEL_HEAD }, { id: PANEL_BODY }];
    if (hasMoreLinks) panelData.push({ id: PANEL_FOOTER });
    if (columnWidth === PC_100) panelData.push({ id: PANEL_PADDING_BOTTOM });

    return (
      <Animated.FlatList
        ref={this.panelFlatList}
        contentContainerStyle={tailwind('max-w-6xl self-center')}
        data={panelData}
        keyExtractor={this.getItemId}
        renderItem={this.renderPanel}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.9}
        removeClippedSubviews={false}
        onScroll={this.props.scrollYEvent}
        scrollEventThrottle={16}
        onScrollEndDrag={this.updatePageYOffset}
        onMomentumScrollEnd={this.updatePageYOffset} />
    );
  }
}

CardPanel.propTypes = {
  columnWidth: PropTypes.string.isRequired,
  scrollYEvent: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {

  const listName = state.display.listName;

  let links = getLinks(state);
  if (!links) {
    console.log(`Invalid links: ${links}. Links cannot be undefined as in LinkSelector and if links is null, it should be handled in Main, not in CardPanel.`);
    links = [];
  }

  return {
    links: links,
    hasMoreLinks: state.hasMoreLinks[listName],
    isFetchingMore: getIsFetchingMore(state),
    listChangedCount: state.display.listChangedCount,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { fetchMore, updatePageYOffset };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(CardPanel));
