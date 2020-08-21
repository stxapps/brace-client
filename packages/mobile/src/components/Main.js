import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, FlatList, View, TouchableOpacity, LayoutAnimation,
} from 'react-native';
import {
  Menu, MenuOptions, MenuOption, MenuTrigger, withMenuContext,
} from 'react-native-popup-menu';
import Svg, { SvgXml, Path } from 'react-native-svg'
import { Flow } from 'react-native-animated-spinkit'
import Modal from 'react-native-modal';

import {
  fetch, fetchMore, changeListName,
  updatePopup, deleteLinks,
} from '../actions';
import {
  LIST_NAME_POPUP, ADD_POPUP, CONFIRM_DELETE_POPUP,
  PC_100, PC_50, PC_33,
  MY_LIST, TRASH,
  SHOW_BLANK, SHOW_COMMANDS,
  BAR_HEIGHT,
  SM_WIDTH, MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { getListNames, getLinks } from '../selectors';
import { toPx, multiplyPercent } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { InterText as Text } from '.';
import MenuPopupRenderer from './MenuPopupRenderer';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardItem from './CardItem';
import StatusPopup from './StatusPopup';

import emptyBox from '../images/empty-box-sided.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkAtUrlBar from '../images/save-link-at-url-bar.svg';

const MAIN_HEAD = 'MAIN_HEAD';
const MAIN_BODY = 'MAIN_BODY';
const MAIN_FOOTER = 'MAIN_FOOTER';
const MAIN_PADDING_BOTTOM = 'MAIN_PADDING_BOTTOM';

const BORDER_RADIUS = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,
  borderBottomLeftRadius: 24,
};

class Main extends React.PureComponent {

  constructor(props) {
    super(props);

    this.fetched = [];
    this.confirmDeleteLinkId = null;
  }

  componentDidMount() {
    this.props.fetch(true, true);
    this.fetched.push(this.props.listName);
  }

  getColumnWidth = (windowWidth) => {
    let columnWidth = PC_100;
    if (windowWidth >= SM_WIDTH) columnWidth = PC_50;
    if (windowWidth >= LG_WIDTH) columnWidth = PC_33;

    return columnWidth;
  }

  onEndReached = () => {
    // if has more, not fetching more, and at the bottom
    const { hasMoreLinks, isFetchingMore } = this.props;
    if (!hasMoreLinks || isFetchingMore) {
      return;
    }

    this.props.fetchMore();
  };

  onListNameBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, true);
  };

  onListNamePopupClick = (newListName) => {

    this.props.changeListName(newListName, this.fetched);
    this.fetched.push(newListName);

    return true;
  };

  onListNameCancelBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;

    this.props.updatePopup(ADD_POPUP, true);
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  };

  onConfirmDeleteOkBtnClick = () => {
    // Just save the value here
    //   and after all popups close, call LayoutAnimation
    //   to animate only CardItem layout changes in onConfirmDeletePopupClose.
    this.confirmDeleteLinkId = this.props.popupLink.id;

    this.props.ctx.menuActions.closeMenu();
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
  }

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
  };

  onConfirmDeletePopupClose = () => {
    if (this.confirmDeleteLinkId) {
      const { windowWidth } = this.props;
      const animConfig = cardItemAnimConfig(windowWidth);

      LayoutAnimation.configureNext(animConfig);
      this.props.deleteLinks([this.confirmDeleteLinkId]);
    }
    this.confirmDeleteLinkId = null;
  }

  renderConfirmDeletePopup() {

    const { isConfirmDeletePopupShown, windowWidth, windowHeight } = this.props;

    return (
      <Modal isVisible={isConfirmDeletePopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onConfirmDeleteCancelBtnClick} onBackButtonPress={this.onConfirmDeleteCancelBtnClick} onModalHide={this.onConfirmDeletePopupClose} supportedOrientations={['portrait', 'landscape']} backdropOpacity={0.1} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true}>
        <View style={tailwind('p-4 self-center w-48 bg-white rounded-lg')}>
          <Text style={tailwind('py-2 text-lg text-gray-900 text-center')}>Confirm delete?</Text>
          <View style={tailwind('py-2 flex-row items-center justify-center')}>
            <TouchableOpacity onPress={this.onConfirmDeleteOkBtnClick} style={tailwind('mr-2 py-2')}>
              <Text style={tailwind('px-3 py-1 bg-white text-base text-gray-900 text-center border border-gray-900 rounded-full shadow-sm')}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onConfirmDeleteCancelBtnClick} style={tailwind('ml-2 py-2')}>
              <Text style={tailwind('px-3 py-1 bg-white text-base text-gray-900 text-center border border-gray-900 rounded-full shadow-sm')}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  renderListName = () => {

    const { listName, windowWidth, windowHeight } = this.props;

    // value of triggerOffsets needs to be aligned with paddings of the MenuTrigger
    const triggerOffsets = { x: 16, y: 16, width: 0, height: 0 };
    if (windowWidth >= MD_WIDTH) {
      triggerOffsets.x = 24;
      triggerOffsets.y = 40;
    }
    if (windowWidth >= LG_WIDTH) {
      triggerOffsets.x = 32;
      triggerOffsets.y = 40;
    }

    return (
      <React.Fragment>
        <Menu renderer={MenuPopupRenderer} rendererProps={{ triggerOffsets: triggerOffsets, popupStyle: tailwind('py-2 min-w-32 border border-gray-200 rounded-lg shadow-xl') }} onOpen={this.onListNameBtnClick} onClose={this.onListNameCancelBtnClick}>
          <MenuTrigger>
            {/* Change the paddings here, need to change triggerOffsets too */}
            <View style={tailwind('px-4 pt-4 pb-6 flex-row items-center w-full md:px-6 md:pt-10 lg:px-8', windowWidth)}>
              <Text style={tailwind('text-lg text-gray-900 font-semibold')}>{listName}</Text>
              <Svg style={tailwind('ml-1 w-5 h-5 text-black')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <Path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </MenuTrigger>
          <MenuOptions>
            <ScrollView style={{ maxHeight: windowHeight }}>
              {this.renderListNamePopup()}
            </ScrollView>
          </MenuOptions>
        </Menu>
        <StatusPopup />
      </React.Fragment>
    );
  }

  renderListNamePopup = () => {
    return (
      this.props.listNames.map(listName => {
        return (
          <MenuOption key={listName} onSelect={() => this.onListNamePopupClick(listName)} customStyles={{ optionWrapper: { padding: 0 } }}>
            <Text style={tailwind('py-2 pl-4 pr-4 text-gray-800')}>{listName}</Text>
          </MenuOption>
        );
      })
    );
  }

  renderEmpty = () => {

    const { listName, searchString, windowWidth } = this.props;

    if (searchString !== '') {
      return (
        <View style={tailwind('px-4 pb-6 w-full md:px-6 lg:px-8', windowWidth)}>
          <Text style={tailwind('text-base text-gray-900')}>Your search - <Text style={tailwind('text-lg text-gray-900 font-medium')}>{searchString}</Text> - did not match any links.</Text>
          <Text style={tailwind('pt-4 md:pt-6', windowWidth)}>Suggestion:</Text>
          <View style={tailwind('pt-2 pl-2')}>
            <Text style={tailwind('text-base text-gray-900')}>{'\u2022'}  Make sure all words are spelled correctly.</Text>
            <Text style={tailwind('text-base text-gray-900')}>{'\u2022'}  Try different keywords.</Text>
            <Text style={tailwind('text-base text-gray-900')}>{'\u2022'}  Try more general keywords.</Text>
          </View>
        </View>
      );
    }

    if (listName === MY_LIST) {

      return (
        <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', windowWidth)}>
          <View style={[tailwind('pt-16 pb-8 items-center w-full max-w-md bg-gray-100'), BORDER_RADIUS]}>
            <SvgXml width={64} height={64} xml={undrawLink} />
            <Text style={tailwind('mt-6 text-lg text-gray-900 text-center')}>Get started saving links</Text>
            <TouchableOpacity onPress={this.onAddBtnClick} style={tailwind('mt-4 px-3 py-1 flex-row justify-center items-center bg-gray-900 rounded-lg shadow-lg')}>
              <Svg style={tailwind('text-white')} width={16} height={14} viewBox="0 0 16 14" stroke="currentColor" fill="none">
                <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={tailwind('ml-1 text-xl text-white font-semibold')}>Save link</Text>
            </TouchableOpacity>
            <Text style={tailwind('mt-16 max-w-md text-lg text-gray-900 text-center')}>Or type <Text style={tailwind('text-lg text-gray-900 font-semibold')}>"brace.to/"</Text> in front of any link {windowWidth > 390 ? '\n' : ''}in Address bar.</Text>
            <SvgXml style={tailwind('mt-4')} width={'100%'} xml={saveLinkAtUrlBar} />
          </View>
        </View>
      );
    }

    if (listName === TRASH) {
      return (
        <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', windowWidth)}>

          <View style={tailwind('mt-6 justify-center items-center w-20 h-20 bg-gray-400 rounded-full')}>
            <Svg style={tailwind('w-10 h-10 text-gray-800')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
            </Svg>
          </View>
          <Text style={tailwind('mt-6 text-lg text-gray-900 text-center')}>No links in Trash</Text>
          <Text style={tailwind('mt-4 max-w-md text-base text-gray-900 text-center')}>Click <Text style={tailwind('text-base text-gray-900 font-semibold')}>"Remove"</Text> from the Link menu to move links you don't need anymore to the Trash.</Text>
        </View>
      );
    }

    return (
      <View style={tailwind('px-4 pb-6 items-center w-full md:px-6 lg:px-8', windowWidth)}>
        <SvgXml style={tailwind('mt-10')} width={160} height={146.66} xml={emptyBox} />
        <Text style={tailwind('mt-6 text-lg text-gray-900 text-center')}>No links in {listName}</Text>
        <Text style={tailwind('mt-4 max-w-md text-base text-gray-900 text-center')}>Click <Text style={tailwind('text-base text-gray-900 font-semibold')}>"{listName}"</Text> from the Link menu to move links here.</Text>
      </View>
    );
  }

  renderFetchMoreBtn = () => {
    return (
      <TouchableOpacity onPress={this.onFetchMoreBtnClick} style={tailwind('my-4 py-2 flex-row justify-center w-full')}>
        <Text style={tailwind('px-3 py-1 bg-white text-base text-gray-900 border border-gray-900 rounded-full shadow-sm')}>More</Text>
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

    const { windowWidth } = this.props;
    const columnWidth = this.getColumnWidth(windowWidth);
    const width = Math.floor(multiplyPercent(Math.min(windowWidth, 1152), columnWidth));

    let initialNumToRender;
    if (columnWidth === PC_100) initialNumToRender = 3;
    else if (columnWidth === PC_50) initialNumToRender = 3;
    else if (columnWidth === PC_33) initialNumToRender = 2;
    else throw new Error(`Invalid columnWidth: ${columnWidth}`);

    return (
      // There is a bug if removeClippedSubviews is true
      //   as on the doc page, it's said use at your own risk.
      <FlatList
        style={{ width }}
        data={item.data}
        keyExtractor={item => item.id}
        renderItem={this.renderItem}
        initialNumToRender={initialNumToRender}
        removeClippedSubviews={false} />
    );
  }

  renderMain = ({ item }) => {

    const { isFetchingMore } = this.props;

    if (item.id === MAIN_HEAD) return this.renderListName();

    if (item.id === MAIN_BODY) {

      const { links, windowWidth } = this.props;
      const columnWidth = this.getColumnWidth(windowWidth);

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
          keyExtractor={item => item.id}
          renderItem={this.renderColumn}
          ListEmptyComponent={this.renderEmpty}
          removeClippedSubviews={false} />
      );
    }

    if (item.id === MAIN_FOOTER) {
      return isFetchingMore ? this.renderFetchingMore() : this.renderFetchMoreBtn();
    }

    if (item.id === MAIN_PADDING_BOTTOM) {
      return (
        <View style={{ paddingBottom: toPx(BAR_HEIGHT) }}></View>
      );
    }

    throw new Error(`Invalid item.id: ${item.id}`);
  }

  render() {

    const { links, popupLink, hasMoreLinks, windowWidth } = this.props;
    const columnWidth = this.getColumnWidth(windowWidth);

    if (links === null) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;

    const mainData = [
      { id: MAIN_HEAD },
      { id: MAIN_BODY },
    ];
    if (hasMoreLinks) mainData.push({ id: MAIN_FOOTER });
    if (columnWidth === PC_100) mainData.push({ id: MAIN_PADDING_BOTTOM });

    return (
      <React.Fragment>
        <TopBar rightPane={topBarRightPane} />
        <FlatList
          contentContainerStyle={tailwind('max-w-6xl self-center')}
          data={mainData}
          keyExtractor={item => item.id}
          renderItem={this.renderMain}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.9}
          removeClippedSubviews={false} />
        {columnWidth === PC_100 && <BottomBar isShown={popupLink === null} />}
        {this.renderConfirmDeletePopup()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const listName = state.display.listName;
  const { links, popupLink } = getLinks(state);

  return {
    listName: listName,
    listNames: getListNames(state),
    links: links,
    isAddPopupShown: state.display.isAddPopupShown,
    isConfirmDeletePopupShown: state.display.isConfirmDeletePopupShown,
    popupLink: popupLink,
    hasMoreLinks: state.hasMoreLinks[listName],
    isFetchingMore: state.display.isFetchingMore,
    searchString: state.display.searchString,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  fetch, fetchMore, changeListName, updatePopup, deleteLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(withMenuContext(Main));
