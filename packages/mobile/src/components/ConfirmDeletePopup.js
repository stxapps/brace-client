import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { withMenuContext } from 'react-native-popup-menu';
import Modal from 'react-native-modal';
import Svg, { Path } from 'react-native-svg';

import {
  updatePopup, deleteLinks, updateBulkEdit, deleteListNames, deleteTagNames,
} from '../actions';
import {
  CARD_ITEM_MENU_POPUP, CONFIRM_DELETE_POPUP, MODAL_SUPPORTED_ORIENTATIONS,
  DELETE_ACTION_LINK_COMMANDS, DELETE_ACTION_LINK_ITEM_MENU, DELETE_ACTION_LIST_NAME,
  DELETE_ACTION_TAG_NAME, SM_WIDTH,
} from '../types/const';
import { getThemeMode } from '../selectors';

import { withTailwind } from '.';

class ConfirmDeletePopup extends React.Component {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isConfirmDeletePopupShown && this.props.isConfirmDeletePopupShown) {
      this.didClick = false;
    }
  }

  shouldComponentUpdate(nextProps) {
    if (
      this.props.isConfirmDeletePopupShown !== nextProps.isConfirmDeletePopupShown ||
      this.props.safeAreaWidth !== nextProps.safeAreaWidth ||
      this.props.safeAreaHeight !== nextProps.safeAreaHeight ||
      this.props.tailwind !== nextProps.tailwind
    ) {
      return true;
    }

    return false;
  }

  onConfirmDeleteOkBtnClick = () => {
    if (this.didClick) return;
    this.didClick = true;

    const { deleteAction, selectedLinkIds } = this.props;
    const { selectingLinkId, selectingListName, selectingTagName } = this.props;

    if (deleteAction === DELETE_ACTION_LINK_COMMANDS) {
      this.props.deleteLinks(selectedLinkIds);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
      this.props.updateBulkEdit(false);
    } else if (deleteAction === DELETE_ACTION_LINK_ITEM_MENU) {
      this.props.deleteLinks([selectingLinkId]);
      this.props.ctx.menuActions.closeMenu();
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
      this.props.updatePopup(CARD_ITEM_MENU_POPUP, false);
    } else if (deleteAction === DELETE_ACTION_LIST_NAME) {
      this.props.deleteListNames([selectingListName]);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    } else if (deleteAction === DELETE_ACTION_TAG_NAME) {
      this.props.deleteTagNames([selectingTagName]);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    } else {
      console.log('In ConfirmDeletePopup, invalid deleteAction: ', deleteAction);
    }
  }

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
  }

  render() {
    const {
      isConfirmDeletePopupShown, safeAreaWidth, safeAreaHeight, insets, tailwind,
    } = this.props;

    const windowWidth = safeAreaWidth + insets.left + insets.right;
    const windowHeight = safeAreaHeight + insets.top + insets.bottom;

    let modalClassNames = 'm-0 items-center';
    if (safeAreaWidth < SM_WIDTH) modalClassNames += ' pt-4 px-4 pb-20 justify-end';
    else modalClassNames += ' p-0 justify-center';

    const cancelBtnStyle = {};
    if (safeAreaWidth < SM_WIDTH) {
      cancelBtnStyle.paddingTop = 7;
      cancelBtnStyle.paddingBottom = 7;
    }

    return (
      <Modal isVisible={isConfirmDeletePopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onConfirmDeleteCancelBtnClick} onBackButtonPress={this.onConfirmDeleteCancelBtnClick} style={tailwind(modalClassNames)} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true}>
        <View style={tailwind('w-full max-w-lg rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800 sm:my-8 sm:p-6')}>
          <View style={tailwind('items-center sm:flex-row sm:items-start')}>
            <View style={tailwind('h-12 w-12 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10')}>
              <Svg style={tailwind('font-normal text-red-600')} width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </Svg>
            </View>
            <View style={tailwind('mt-3 flex-shrink flex-grow sm:mt-0 sm:ml-4')}>
              <Text style={tailwind('text-center text-lg font-medium leading-6 text-gray-900 blk:text-white sm:text-left')}>Confirm delete?</Text>
              <View style={tailwind('mt-2')}>
                <Text style={tailwind('text-center text-sm font-normal text-gray-500 blk:text-gray-400 sm:text-left')}>Are you sure you want to permanently delete? This action cannot be undone.</Text>
              </View>
            </View>
          </View>
          <View style={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:flex-row sm:pl-4')}>
            <TouchableOpacity onPress={this.onConfirmDeleteOkBtnClick} style={tailwind('w-full rounded-full border border-red-600 bg-red-600 py-2 blk:border-red-500 blk:bg-red-500 sm:w-auto sm:px-3.5 sm:py-1.5')}>
              <Text style={tailwind('text-center text-base font-medium text-white sm:rounded-full sm:text-sm')}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onConfirmDeleteCancelBtnClick} style={[tailwind('mt-3 w-full rounded-full border border-gray-400 bg-white blk:border-gray-400 blk:bg-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:px-3 sm:py-1.5'), cancelBtnStyle]}>
              <Text style={tailwind('text-center text-base font-normal text-gray-500 blk:text-gray-300 sm:text-sm')}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isConfirmDeletePopupShown: state.display.isConfirmDeletePopupShown,
    deleteAction: state.display.deleteAction,
    selectedLinkIds: state.display.selectedLinkIds,
    selectingLinkId: state.display.selectingLinkId,
    selectingListName: state.display.selectingListName,
    selectingTagName: state.display.selectingTagName,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = {
  updatePopup, deleteLinks, updateBulkEdit, deleteListNames, deleteTagNames,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(withMenuContext(ConfirmDeletePopup)));
