import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Text, TouchableOpacity, Animated } from 'react-native';
import { connect } from 'react-redux';
import { Flow } from 'react-native-animated-spinkit';

import { fetchMore, updateFetchedMore } from '../actions';
import {
  PC_100, PC_50, PC_33, TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT,
  SEARCH_POPUP_HEIGHT, MD_WIDTH,
} from '../types/const';
import { getLinks, getIsFetchingMore, getThemeMode } from '../selectors';
import { toPx, multiplyPercent } from '../utils';
import cache from '../utils/cache';
import vars from '../vars';

import { withTailwind } from '.';

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
            vars.scrollPanel.pageYOffset = 0;
          }
        }, 1);
      }
    }
  }

  getItemId = (item) => {
    return item.id;
  }

  onScrollEnd = (e) => {
    const contentHeight = e.nativeEvent.contentSize.height;
    const layoutHeight = e.nativeEvent.layoutMeasurement.height;
    const pageYOffset = e.nativeEvent.contentOffset.y;

    vars.scrollPanel.contentHeight = contentHeight;
    vars.scrollPanel.layoutHeight = layoutHeight;
    vars.scrollPanel.pageYOffset = pageYOffset;
  }

  onEndReached = () => {
    // if has more, not fetching more, and at the bottom
    const { hasMoreLinks, hasFetchedMore, isFetchingMore } = this.props;
    if (!hasMoreLinks || hasFetchedMore || isFetchingMore) {
      return;
    }

    this.props.fetchMore();
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  }

  onUpdateFetchedBtnClick = () => {
    this.props.updateFetchedMore();
  }

  renderEmpty = () => {
    vars.scrollPanel.pageYOffset = 0;
    return <EmptyContent />;
  }

  renderFetchMoreBtn = () => {
    const { tailwind } = this.props;

    return (
      <TouchableOpacity onPress={this.onFetchMoreBtnClick} style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>More</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderFetchingMore = () => {
    const { tailwind } = this.props;

    return (
      <View style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <Flow size={48} color="rgb(156, 163, 175)" />
      </View>
    );
  }

  renderUpdateFetchedBtn = () => {
    const { tailwind } = this.props;

    return (
      <TouchableOpacity onPress={this.onUpdateFetchedBtnClick} style={tailwind('my-4 w-full flex-row justify-center py-2')}>
        <View style={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1 blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Show more</Text>
        </View>
      </TouchableOpacity>
    );
  }

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
        style={cache('CP_flatListColumn', { width }, [safeAreaWidth])}
        data={item.data}
        keyExtractor={this.getItemId}
        renderItem={this.renderItem}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        removeClippedSubviews={false} />
    );
  }

  renderPanel = ({ item }) => {
    const { hasFetchedMore, isFetchingMore, safeAreaWidth, tailwind } = this.props;

    if (item.id === PANEL_HEAD) {
      let pt = safeAreaWidth < MD_WIDTH ? toPx(TOP_BAR_HEIGHT) : toPx(TOP_BAR_HEIGHT_MD);
      pt += safeAreaWidth < MD_WIDTH ? toPx('1.5rem') : toPx('2.5rem');
      return (
        <View style={cache('CP_panelHead', { paddingTop: pt }, [safeAreaWidth])} />
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
  }

  render() {
    const { hasMoreLinks, columnWidth, tailwind } = this.props;

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
        onEndReachedThreshold={0.2}
        removeClippedSubviews={false}
        onScroll={this.props.scrollYEvent}
        scrollEventThrottle={16}
        onScrollEndDrag={this.onScrollEnd}
        onMomentumScrollEnd={this.onScrollEnd}
        overScrollMode="always" />
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
    hasFetchedMore: state.fetchedMore[listName] ? true : false,
    isFetchingMore: getIsFetchingMore(state),
    listChangedCount: state.display.listChangedCount,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { fetchMore, updateFetchedMore };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(CardPanel));
