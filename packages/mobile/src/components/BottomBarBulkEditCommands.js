import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, View, Text, TouchableOpacity, BackHandler,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Modal from 'react-native-modal';

import {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP, BULK_EDIT_MOVE_TO_POPUP,
  MY_LIST, ARCHIVE, TRASH, MOVE_TO,
  BOTTOM_BAR_HEIGHT, MODAL_SUPPORTED_ORIENTATIONS
} from '../types/const';
import { getListNameMap } from '../selectors';
import { toPx } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

class BottomBarBulkEditCommands extends React.Component {

  constructor(props) {
    super(props);

    this.state = { isEmptyErrorShown: false };

    this.backHandler = null;
    this.prevInsetsBottom = null;
  }

  componentDidMount() {
    if (!this.backHandler) {
      this.backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          this.onBulkEditCancelBtnClick();
          return true;
        }
      );
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
        this.props.listName !== nextProps.listName
      )
    ) {
      this.setState({ isEmptyErrorShown: false });
    }

    this.prevInsetsBottom = this.props.insets.bottom;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.listName !== nextProps.listName ||
      this.props.listNameMap !== nextProps.listNameMap ||
      this.props.isBulkEditMoveToPopupShown !== nextProps.isBulkEditMoveToPopupShown ||
      this.props.windowWidth !== nextProps.windowWidth ||
      this.props.windowHeight !== nextProps.windowHeight ||
      this.state.isEmptyErrorShown !== nextState.isEmptyErrorShown
    ) {
      return true;
    }

    return false;
  }

  checkNoLinkIdSelected = () => {
    if (this.props.selectedLinkIds.length === 0) {
      this.setState({ isEmptyErrorShown: true });
      return true;
    }

    this.setState({ isEmptyErrorShown: false });
    return false;
  }

  onBulkEditArchiveBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    moveLinks(ARCHIVE, selectedLinkIds);
    clearSelectedLinkIds();
    updateBulkEdit(false);
  }

  onBulkEditRemoveBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    moveLinks(TRASH, selectedLinkIds);
    clearSelectedLinkIds();
    updateBulkEdit(false);
  }

  onBulkEditRestoreBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    moveLinks(MY_LIST, selectedLinkIds);
    clearSelectedLinkIds();
    updateBulkEdit(false);
  }

  onBulkEditDeleteBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;
    this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
  }

  onBulkEditMoveToBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, true);
  }

  onBulkEditMoveToCancelBtnClick = () => {
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  onBulkEditMoveToPopupClick = (text) => {
    if (!text) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    if (text.startsWith(MOVE_TO)) {
      moveLinks(text.substring(MOVE_TO.length + 1), selectedLinkIds);
      clearSelectedLinkIds();
      updateBulkEdit(false);
    } else {
      throw new Error(`Invalid text: ${text}`);
    }

    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  onBulkEditCancelBtnClick = () => {
    this.props.clearSelectedLinkIds();
    this.props.updateBulkEdit(false);
  }

  renderEmptyError() {

    if (!this.state.isEmptyErrorShown) return null;

    if (!styles.emptyError) {
      const style = {
        bottom: toPx(BOTTOM_BAR_HEIGHT),
      };
      styles.emptyError = [tailwind('absolute inset-x-0 justify-center items-center'), style];
    }

    return (
      <View style={styles.emptyError}>
        <View style={tailwind('mx-4 mb-3 p-4 max-w-sm bg-red-100 rounded-md')}>
          <View style={tailwind('flex-row w-full')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('text-base text-red-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow')}>
              <Text style={tailwind('text-sm text-red-800 font-medium leading-5 text-left')}>Please select item(s) first before continuing.</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  renderBulkEditMoveToPopup() {

    const { isBulkEditMoveToPopupShown, windowWidth, windowHeight } = this.props;

    const moveTo = [];
    for (const listNameObj of this.props.listNameMap) {
      if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
      if (this.props.listName === listNameObj.listName) continue;

      moveTo.push(listNameObj);
    }

    if (!styles.moveToScrollView) {
      const scrollViewStyle = { maxHeight: 288 };
      styles.moveToScrollView = [tailwind('w-full'), scrollViewStyle];
    }

    return (
      <Modal isVisible={isBulkEditMoveToPopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onBulkEditMoveToCancelBtnClick} onBackButtonPress={this.onBulkEditMoveToCancelBtnClick} style={tailwind('justify-end m-0')} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="slideInUp" animationInTiming={200} animationOut="slideOutDown" animationOutTiming={200} useNativeDriver={true}>
        <View style={tailwind('pt-4 w-full bg-white border border-gray-200 rounded-t-lg shadow-xl')}>
          <ScrollView style={styles.moveToScrollView} contentContainerStyle={tailwind('pb-4')}>
            <Text style={tailwind('py-4 pl-4 pr-2 w-full text-base text-gray-800 font-normal')}>Move to...</Text>
            {moveTo.map(listNameObj => {
              const key = MOVE_TO + ' ' + listNameObj.listName;
              return (
                <TouchableOpacity onPress={() => this.onBulkEditMoveToPopupClick(key)} style={tailwind('w-full')} key={key}>
                  <Text style={tailwind('py-4 pl-8 pr-2 w-full text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    );
  }

  render() {

    const { listName, listNameMap, insets } = this.props;
    const rListName = [MY_LIST, ARCHIVE, TRASH].includes(listName) ? listName : MY_LIST;

    const isArchiveBtnShown = [MY_LIST].includes(rListName);
    const isRemoveBtnShown = [MY_LIST, ARCHIVE].includes(rListName);
    const isRestoreBtnShown = [TRASH].includes(rListName);
    const isDeleteBtnShown = [TRASH].includes(rListName);
    const isMoveToBtnShown = [ARCHIVE].includes(rListName) || (rListName === MY_LIST && listNameMap.length > 3);

    if (!styles.bulkEdit || this.prevInsetsBottom !== insets.bottom) {
      const style = {
        height: toPx(BOTTOM_BAR_HEIGHT) + insets.bottom,
      };
      styles.bulkEdit = [tailwind('absolute inset-x-0 bottom-0 bg-white border-t border-gray-300 z-30'), style];
    }

    if (!styles.innerBulkEdit) {
      const innerStyle = {
        height: toPx(BOTTOM_BAR_HEIGHT),
      };
      styles.innerBulkEdit = [tailwind('flex-row justify-evenly w-full'), innerStyle];
    }

    if (!styles.archiveText) styles.archiveText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 2 }];
    if (!styles.removeText) styles.removeText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 2 }];
    if (!styles.restoreText) styles.restoreText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 2 }];
    if (!styles.deleteText) styles.deleteText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 2 }];
    if (!styles.moveToText) styles.moveToText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 1 }];
    if (!styles.cancelText) styles.cancelText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 0 }];

    if (!styles.moveToInnerView) styles.moveToInnerView = [tailwind('justify-center items-center w-6 h-6'), { marginTop: 1 }];

    return (
      <React.Fragment>
        <View style={styles.bulkEdit}>
          <View style={styles.innerBulkEdit}>
            {isArchiveBtnShown && <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onBulkEditArchiveBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center w-6 h-6')}>
                  <Svg style={tailwind('text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
                  </Svg>
                </View>
                <Text style={styles.archiveText}>Archive</Text>
              </TouchableOpacity>
            </View>}
            {isRemoveBtnShown && <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onBulkEditRemoveBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center w-6 h-6')}>
                  <Svg style={tailwind('text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
                  </Svg>
                </View>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>}
            {isRestoreBtnShown && <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onBulkEditRestoreBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center w-6 h-6')}>
                  <Svg style={tailwind('text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M14.8034 5.19398C11.9177 2.30766 7.26822 2.27141 4.33065 5.0721L3 3.66082V8.62218H7.6776L6.38633 7.25277C8.14886 5.56148 10.9471 5.58024 12.6821 7.31527C15.3953 10.0285 13.7677 14.9973 9.25014 14.9973V17.9974C11.5677 17.9974 13.384 17.2199 14.8034 15.8005C17.7322 12.8716 17.7322 8.12279 14.8034 5.19398V5.19398Z" />
                  </Svg>
                </View>
                <Text style={styles.restoreText}>Restore</Text>
              </TouchableOpacity>
            </View>}
            {isDeleteBtnShown && <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onBulkEditDeleteBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center w-6 h-6')}>
                  <Svg style={tailwind('text-base text-red-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
                  </Svg>
                </View>
                <Text style={styles.deleteText}>Permanently Delete</Text>
              </TouchableOpacity>
            </View>}
            {isMoveToBtnShown && <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onBulkEditMoveToBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={styles.moveToInnerView}>
                  <Svg style={tailwind('text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
                  </Svg>
                </View>
                <Text style={styles.moveToText}>Move to...</Text>
              </TouchableOpacity>
            </View>}
            <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onBulkEditCancelBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center')}>
                  <Svg style={tailwind('text-base text-gray-600 font-normal rounded-full')} width={26} height={26} viewBox="0 0 28 28" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M14 25.2001C20.1857 25.2001 25.2001 20.1857 25.2001 14C25.2001 7.81446 20.1857 2.80005 14 2.80005C7.81446 2.80005 2.80005 7.81446 2.80005 14C2.80005 20.1857 7.81446 25.2001 14 25.2001ZM12.19 10.2101C11.6433 9.66337 10.7568 9.66337 10.2101 10.2101C9.66337 10.7568 9.66337 11.6433 10.2101 12.19L12.0202 14L10.2101 15.8101C9.66337 16.3568 9.66337 17.2433 10.2101 17.79C10.7568 18.3367 11.6433 18.3367 12.19 17.79L14 15.9799L15.8101 17.79C16.3568 18.3367 17.2433 18.3367 17.79 17.79C18.3367 17.2433 18.3367 16.3568 17.79 15.8101L15.9799 14L17.79 12.19C18.3367 11.6433 18.3367 10.7568 17.79 10.2101C17.2433 9.66337 16.3568 9.66337 15.8101 10.2101L14 12.0202L12.19 10.2101Z" />
                  </Svg>
                </View>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {this.renderEmptyError()}
          </View>
        </View>
        {this.renderBulkEditMoveToPopup()}
      </React.Fragment>
    );
  }
}

const styles = {};

const mapStateToProps = (state, props) => {

  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    isBulkEditMoveToPopupShown: state.display.isBulkEditMoveToPopupShown,
    selectedLinkIds: state.display.selectedLinkIds,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(BottomBarBulkEditCommands));
