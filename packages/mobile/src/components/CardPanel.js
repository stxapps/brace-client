import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FlatList, View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import Svg, { SvgXml, Path } from 'react-native-svg'
import { Flow } from 'react-native-animated-spinkit'

import { fetchMore, updatePopup, updatePageYOffset } from '../actions';
import {
  ADD_POPUP,
  PC_100, PC_50, PC_33,
  MY_LIST, TRASH,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH,
} from '../types/const';
import { getListNameMap, getLinks, getIsFetchingMore } from '../selectors';
import { toPx, multiplyPercent, getListNameDisplayName } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

import CardItem from './CardItem';

import emptyBox from '../images/empty-box-sided.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkOnIos from '../images/save-link-on-ios.svg';
import saveLinkOnAndroid from '../images/save-link-on-android.svg';

const PANEL_HEAD = 'PANEL_HEAD';
const PANEL_BODY = 'PANEL_BODY';
const PANEL_FOOTER = 'PANEL_FOOTER';
const PANEL_PADDING_BOTTOM = 'PANEL_PADDING_BOTTOM';

const BORDER_RADIUS = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,
  borderBottomLeftRadius: 24,
};

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

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  }

  renderEmpty = () => {

    const { listName, listNameMap, searchString, safeAreaWidth } = this.props;
    const displayName = getListNameDisplayName(listName, listNameMap);

    if (searchString !== '') {
      return (
        <View style={tailwind('px-4 pb-6 w-full md:px-6 lg:px-8', safeAreaWidth)}>
          <Text style={tailwind('text-base text-gray-900 font-normal')}>Your search - <Text style={tailwind('text-lg text-gray-900 font-medium')}>{searchString}</Text> - did not match any links.</Text>
          <Text style={tailwind('pt-4 text-base text-gray-900 font-normal md:pt-6', safeAreaWidth)}>Suggestion:</Text>
          <View style={tailwind('pt-2 pl-2')}>
            <Text style={tailwind('text-base text-gray-900 font-normal')}>{'\u2022'}  Make sure all words are spelled correctly.</Text>
            <Text style={tailwind('text-base text-gray-900 font-normal')}>{'\u2022'}  Try different keywords.</Text>
            <Text style={tailwind('text-base text-gray-900 font-normal')}>{'\u2022'}  Try more general keywords.</Text>
          </View>
        </View>
      );
    }

    if (listName === MY_LIST) {

      let or;
      if (Platform.OS === 'ios') {
        or = (
          <React.Fragment>
            <Text style={tailwind('mt-16 max-w-md text-lg text-gray-900 font-normal text-center')}>Or tap <Text style={tailwind('text-lg text-gray-900 font-semibold')}>Brace</Text> from Share menu</Text>
            <SvgXml style={tailwind('mt-0 sm:mt-4', safeAreaWidth)} width={'100%'} xml={saveLinkOnIos} />
          </React.Fragment>
        );
      } else {
        or = (
          <React.Fragment>
            <Text style={tailwind('mt-16 max-w-md text-lg text-gray-900 font-normal text-center')}>Or tap <Text style={tailwind('text-lg text-gray-900 font-semibold')}>Save to Brace</Text> from Share menu</Text>
            <SvgXml style={tailwind('mt-0 sm:mt-4', safeAreaWidth)} width={'100%'} xml={saveLinkOnAndroid} />
          </React.Fragment>
        );
      }

      return (
        <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', safeAreaWidth)}>
          <View style={cache('CP_emptyMyListView', [tailwind('pt-16 pb-8 px-4 items-center w-full max-w-md bg-gray-100'), BORDER_RADIUS])}>
            <SvgXml width={64} height={64} xml={undrawLink} />
            <Text style={tailwind('mt-6 text-lg text-gray-900 font-normal text-center')}>Get started saving links</Text>
            <TouchableOpacity onPress={this.onAddBtnClick} style={tailwind('mt-4 px-3 py-1 flex-row justify-center items-center bg-gray-900 rounded-lg shadow-lg')}>
              <Svg style={tailwind('text-base text-white font-normal')} width={16} height={14} viewBox="0 0 16 14" stroke="currentColor" fill="none">
                <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={tailwind('ml-1 text-xl text-white font-semibold')}>Save link</Text>
            </TouchableOpacity>
            {or}
          </View>
        </View>
      );
    }

    if (listName === TRASH) {
      return (
        <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', safeAreaWidth)}>
          <View style={tailwind('mt-6 justify-center items-center w-20 h-20 bg-gray-400 rounded-full')}>
            <Svg style={tailwind('w-10 h-10 text-base text-gray-800 font-normal')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
            </Svg>
          </View>
          <Text style={tailwind('mt-6 text-lg text-gray-900 font-normal text-center')}>No links in {displayName}</Text>
          <Text style={tailwind('mt-4 max-w-md text-base text-gray-900 font-normal text-center leading-6')}>Click <Text style={tailwind('text-base text-gray-900 font-semibold')}>"Remove"</Text> from the menu to move links you don't need anymore here.</Text>
        </View>
      );
    }

    return (
      <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', safeAreaWidth)}>
        <SvgXml style={tailwind('mt-10')} width={160} height={146.66} xml={emptyBox} />
        <Text style={tailwind('mt-6 text-lg text-gray-900 font-normal text-center')}>No links in {displayName}</Text>
        <Text style={tailwind('mt-4 max-w-md text-base text-gray-900 font-normal text-center leading-6')}>Click <Text style={tailwind('text-base text-gray-900 font-semibold')}>"Move to... {'->'} {displayName}"</Text> from the menu to move links here.</Text>
      </View>
    );
  }

  renderFetchMoreBtn = () => {
    return (
      <TouchableOpacity onPress={this.onFetchMoreBtnClick} style={tailwind('my-4 py-2 flex-row justify-center w-full')}>
        <View style={tailwind('px-3 py-1 bg-white border border-gray-900 rounded-full shadow-sm')}>
          <Text style={tailwind('text-base text-gray-900 font-normal')}>More</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderFetchingMore = () => {
    return (
      <View style={tailwind('my-4 py-2 flex-row justify-center w-full')}>
        <Flow size={48} color="rgba(113, 128, 150, 1)" />
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
      if (columnIndex === 0) classNames = 'pl-8 pr-6';
      else if (columnIndex === 1) classNames = 'pr-3 pl-3';
      else if (columnIndex === 2) classNames = 'pl-6 pr-8';
      else throw new Error(`Invalid columnIndex: ${columnIndex}`);

      classNames += ' pb-9';
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
        <View style={cache('CP_panelHead', { paddingTop: pt }, safeAreaWidth)}></View>
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
        <View style={cache('CP_panelPB', { paddingBottom: pb })}></View>
      );
    }

    throw new Error(`Invalid item.id: ${item.id}`);
  }

  render() {

    const { links, hasMoreLinks, columnWidth } = this.props;

    if (links === null) {
      throw new Error(`Invalid links: ${links}. Links cannot be undefined as in LinkSelector and if links is null, it should be handled in Main, not in CardPanel.`);
    }

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

  return {
    listName: listName,
    listNameMap: getListNameMap(state),
    links: getLinks(state),
    hasMoreLinks: state.hasMoreLinks[listName],
    isFetchingMore: getIsFetchingMore(state),
    searchString: state.display.searchString,
    listChangedCount: state.display.listChangedCount,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { fetchMore, updatePopup, updatePageYOffset };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(CardPanel));
