import React from 'react';
import { View, Text, TouchableOpacity, BackHandler, Animated } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import {
  updatePopup, updateBulkEdit, moveLinks, updateDeleteAction, updateListNamesMode,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP, LIST_NAMES_POPUP, MY_LIST, ARCHIVE, TRASH, BOTTOM_BAR_HEIGHT,
  DELETE_ACTION_LINK_COMMANDS, LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_BMODAL,
} from '../types/const';
import { getListNameMap, getThemeMode } from '../selectors';
import { getListNameDisplayName, getAllListNames, toPx } from '../utils';
import cache from '../utils/cache';
import { popupFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class BottomBarBulkEditCommands extends React.Component {

  constructor(props) {
    super(props);

    this.state = { isEmptyErrorShown: false, didEmptyErrorCloseAnimEnd: true };

    this.backHandler = null;
    this.emptyErrorScale = new Animated.Value(0);
    this.moveToBtn = React.createRef();
    this.didClick = false;
  }

  componentDidMount() {
    if (!this.backHandler) {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          this.onBulkEditCancelBtnClick();
          return true;
        }
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {

    const { isEmptyErrorShown } = this.state;

    if (!prevState.isEmptyErrorShown && isEmptyErrorShown) {
      Animated.timing(
        this.emptyErrorScale, { toValue: 1, ...popupFMV.visible }
      ).start();
    }

    if (prevState.isEmptyErrorShown && !isEmptyErrorShown) {
      Animated.timing(
        this.emptyErrorScale, { toValue: 0, ...popupFMV.hidden }
      ).start(() => {
        this.setState({ didEmptyErrorCloseAnimEnd: true });
      });
    }
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
      this.backHandler = null;
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.isEmptyErrorShown === true &&
      (
        nextProps.selectedLinkIds.length > 0 ||
        this.props.listName !== nextProps.listName ||
        this.props.queryString !== nextProps.queryString
      )
    ) {
      this.setState({ isEmptyErrorShown: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.listName !== nextProps.listName ||
      this.props.queryString !== nextProps.queryString ||
      this.props.listNameMap !== nextProps.listNameMap ||
      this.props.safeAreaWidth !== nextProps.safeAreaWidth ||
      this.props.safeAreaHeight !== nextProps.safeAreaHeight ||
      this.props.tailwind !== nextProps.tailwind ||
      this.state.isEmptyErrorShown !== nextState.isEmptyErrorShown ||
      this.state.didEmptyErrorCloseAnimEnd !== nextState.didEmptyErrorCloseAnimEnd
    ) {
      return true;
    }

    return false;
  }

  checkNoLinkIdSelected = () => {
    if (this.props.selectedLinkIds.length === 0) {
      this.setState({ isEmptyErrorShown: true, didEmptyErrorCloseAnimEnd: false });
      return true;
    }

    this.setState({ isEmptyErrorShown: false });
    return false;
  }

  onBulkEditArchiveBtnClick = () => {
    if (this.checkNoLinkIdSelected() || this.didClick) return;

    const { selectedLinkIds } = this.props;

    this.props.moveLinks(ARCHIVE, selectedLinkIds);
    this.props.updateBulkEdit(false);

    this.didClick = true;
  }

  onBulkEditRemoveBtnClick = () => {
    if (this.checkNoLinkIdSelected() || this.didClick) return;

    const { selectedLinkIds } = this.props;

    this.props.moveLinks(TRASH, selectedLinkIds);
    this.props.updateBulkEdit(false);

    this.didClick = true;
  }

  onBulkEditRestoreBtnClick = () => {
    if (this.checkNoLinkIdSelected() || this.didClick) return;

    const { selectedLinkIds } = this.props;

    this.props.moveLinks(MY_LIST, selectedLinkIds);
    this.props.updateBulkEdit(false);

    this.didClick = true;
  }

  onBulkEditDeleteBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;
    this.props.updateDeleteAction(DELETE_ACTION_LINK_COMMANDS);
    this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
  }

  onBulkEditMoveToBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;
    this.moveToBtn.current.measure((_fx, _fy, width, height, x, y) => {
      this.props.updateListNamesMode(
        LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_BMODAL,
      );

      const rect = {
        x, y, width, height, top: y, right: x + width, bottom: y + height, left: x,
      };
      this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
    });
  }

  onBulkEditCancelBtnClick = () => {
    this.props.updateBulkEdit(false);
  }

  renderEmptyError() {
    const { tailwind } = this.props;

    if (!this.state.isEmptyErrorShown && this.state.didEmptyErrorCloseAnimEnd) {
      return null;
    }

    const emptyErrorStyle = {
      transform: [{
        scale: this.emptyErrorScale.interpolate({
          inputRange: [0, 1], outputRange: [0.95, 1],
        }),
      }],
    };

    return (
      <View style={cache('BBBEC_emptyError', [tailwind('absolute inset-x-0 items-center justify-center'), { bottom: toPx(BOTTOM_BAR_HEIGHT) }], [tailwind])}>
        <Animated.View style={[tailwind('mx-4 mb-3 max-w-sm rounded-md bg-red-50 p-4 shadow-lg'), emptyErrorStyle]}>
          <View style={tailwind('w-full flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow')}>
              <Text style={tailwind('text-left text-sm font-normal leading-5 text-red-800')}>Please select item(s) first before continuing.</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  render() {
    const { listName, queryString, listNameMap, tailwind } = this.props;

    const rListName = [MY_LIST, ARCHIVE, TRASH].includes(listName) ? listName : MY_LIST;

    let isArchiveBtnShown = [MY_LIST].includes(rListName);
    let isRemoveBtnShown = [MY_LIST, ARCHIVE].includes(rListName);
    let isRestoreBtnShown = [TRASH].includes(rListName);
    let isDeleteBtnShown = [TRASH].includes(rListName);
    let isMoveToBtnShown = (
      [ARCHIVE].includes(rListName) ||
      (rListName === MY_LIST && getAllListNames(listNameMap).length > 3)
    );
    if (queryString) {
      [isArchiveBtnShown, isRemoveBtnShown, isRestoreBtnShown] = [false, true, false];
      [isDeleteBtnShown, isMoveToBtnShown] = [false, false];
    }

    return (
      <React.Fragment>
        <View style={cache('BBBEC_innerBulkEdit', [tailwind('w-full flex-row justify-evenly'), { height: toPx(BOTTOM_BAR_HEIGHT) }], [tailwind])}>
          {isArchiveBtnShown && <View style={tailwind('flex-1 p-1')}>
            <TouchableOpacity onPress={this.onBulkEditArchiveBtnClick} style={tailwind('h-full w-full items-center justify-center')}>
              <View style={tailwind('h-6 w-6 items-center justify-center')}>
                <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
                  <Path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 w-full text-center text-xs font-normal leading-4 text-gray-500 blk:text-gray-400')} numberOfLines={1} ellipsizeMode="tail">{getListNameDisplayName(ARCHIVE, listNameMap)}</Text>
            </TouchableOpacity>
          </View>}
          {isRemoveBtnShown && <View style={tailwind('flex-1 p-1')}>
            <TouchableOpacity onPress={this.onBulkEditRemoveBtnClick} style={tailwind('h-full w-full items-center justify-center')}>
              <View style={tailwind('h-6 w-6 items-center justify-center')}>
                <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs font-normal leading-4 text-gray-500 blk:text-gray-400')}>Remove</Text>
            </TouchableOpacity>
          </View>}
          {isRestoreBtnShown && <View style={tailwind('flex-1 p-1')}>
            <TouchableOpacity onPress={this.onBulkEditRestoreBtnClick} style={tailwind('h-full w-full items-center justify-center')}>
              <View style={tailwind('h-6 w-6 items-center justify-center')}>
                <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M14.8034 5.19398C11.9177 2.30766 7.26822 2.27141 4.33065 5.0721L3 3.66082V8.62218H7.6776L6.38633 7.25277C8.14886 5.56148 10.9471 5.58024 12.6821 7.31527C15.3953 10.0285 13.7677 14.9973 9.25014 14.9973V17.9974C11.5677 17.9974 13.384 17.2199 14.8034 15.8005C17.7322 12.8716 17.7322 8.12279 14.8034 5.19398V5.19398Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs font-normal leading-4 text-gray-500 blk:text-gray-400')}>Restore</Text>
            </TouchableOpacity>
          </View>}
          {isDeleteBtnShown && <View style={tailwind('flex-1 p-1')}>
            <TouchableOpacity onPress={this.onBulkEditDeleteBtnClick} style={tailwind('h-full w-full items-center justify-center')}>
              <View style={tailwind('h-6 w-6 items-center justify-center')}>
                <Svg style={tailwind('font-normal text-red-600 blk:text-red-500')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 w-full text-center text-xs font-normal leading-4 text-gray-500 blk:text-gray-400')} numberOfLines={1} ellipsizeMode="tail">Permanently Delete</Text>
            </TouchableOpacity>
          </View>}
          {isMoveToBtnShown && <View style={tailwind('flex-1 p-1')}>
            <TouchableOpacity ref={this.moveToBtn} onPress={this.onBulkEditMoveToBtnClick} style={tailwind('h-full w-full items-center justify-center')}>
              <View style={tailwind('h-6 w-6 items-center justify-center')}>
                <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                  <Path d="M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H9L11 6H16C16.5304 6 17.0391 6.21071 17.4142 6.58579C17.7893 6.96086 18 7.46957 18 8V14C18 14.5304 17.7893 15.0391 17.4142 15.4142C17.0391 15.7893 16.5304 16 16 16H4C3.46957 16 2.96086 15.7893 2.58579 15.4142C2.21071 15.0391 2 14.5304 2 14V6Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs font-normal leading-4 text-gray-500 blk:text-gray-400')}>Move to</Text>
            </TouchableOpacity>
          </View>}
          <View style={tailwind('flex-1 p-1')}>
            <TouchableOpacity onPress={this.onBulkEditCancelBtnClick} style={tailwind('h-full w-full items-center justify-center')}>
              <View style={tailwind('items-center justify-center')}>
                <Svg style={tailwind('rounded-full font-normal text-gray-500 blk:text-gray-400')} width={24} height={24} viewBox="0 0 28 28" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M14 25.2001C20.1857 25.2001 25.2001 20.1857 25.2001 14C25.2001 7.81446 20.1857 2.80005 14 2.80005C7.81446 2.80005 2.80005 7.81446 2.80005 14C2.80005 20.1857 7.81446 25.2001 14 25.2001ZM12.19 10.2101C11.6433 9.66337 10.7568 9.66337 10.2101 10.2101C9.66337 10.7568 9.66337 11.6433 10.2101 12.19L12.0202 14L10.2101 15.8101C9.66337 16.3568 9.66337 17.2433 10.2101 17.79C10.7568 18.3367 11.6433 18.3367 12.19 17.79L14 15.9799L15.8101 17.79C16.3568 18.3367 17.2433 18.3367 17.79 17.79C18.3367 17.2433 18.3367 16.3568 17.79 15.8101L15.9799 14L17.79 12.19C18.3367 11.6433 18.3367 10.7568 17.79 10.2101C17.2433 9.66337 16.3568 9.66337 15.8101 10.2101L14 12.0202L12.19 10.2101Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-0.5 text-xs font-normal text-gray-500 blk:text-gray-400')}>Cancel</Text>
            </TouchableOpacity>
          </View>
          {this.renderEmptyError()}
        </View>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    queryString: state.display.queryString,
    listNameMap: getListNameMap(state),
    selectedLinkIds: state.display.selectedLinkIds,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = {
  updatePopup, updateBulkEdit, moveLinks, updateDeleteAction, updateListNamesMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarBulkEditCommands));
