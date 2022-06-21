import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native';
import { withMenuContext } from 'react-native-popup-menu';
import Modal from 'react-native-modal';
import Svg, { Path } from 'react-native-svg';

import {
  updatePopup, deleteLinks, updateBulkEdit, deleteListNames, updateDeletingListName,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP, MODAL_SUPPORTED_ORIENTATIONS, SM_WIDTH,
} from '../types/const';
import { getPopupLink } from '../selectors';
import { cardItemFMV, listsFMV } from '../types/animConfigs';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

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
      this.props.safeAreaHeight !== nextProps.safeAreaHeight
    ) {
      return true;
    }

    return false;
  }

  onConfirmDeleteOkBtnClick = () => {
    if (this.didClick) return;
    this.didClick = true;

    const { popupLink, selectedLinkIds, deletingListName, safeAreaWidth } = this.props;

    const v1 = popupLink ? 1 : 0;
    const v2 = selectedLinkIds.length > 0 ? 1 : 0;
    const v3 = deletingListName ? 1 : 0;
    if (v1 + v2 + v3 !== 1) {
      throw new Error(`Invalid popupLink: ${popupLink}, selectedLinkIds: ${selectedLinkIds}, and deletingListName: ${deletingListName}`);
    }

    if (popupLink) {
      const animConfig = cardItemFMV(safeAreaWidth);

      LayoutAnimation.configureNext(animConfig);
      this.props.deleteLinks([popupLink.id]);
      this.props.ctx.menuActions.closeMenu();
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
      this.props.updatePopup(popupLink.id, false);
      return;
    }

    if (selectedLinkIds.length > 0) {
      this.props.deleteLinks(selectedLinkIds);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
      this.props.updateBulkEdit(false);
      return;
    }

    if (deletingListName) {
      const animConfig = listsFMV();

      LayoutAnimation.configureNext(animConfig);
      this.props.deleteListNames([deletingListName]);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
      this.props.updateDeletingListName(null);
      return;
    }

    throw new Error('Must not reach here!');
  }

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    this.props.updateDeletingListName(null);
  }

  render() {

    const {
      isConfirmDeletePopupShown, safeAreaWidth, safeAreaHeight, insets,
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
        <View style={tailwind('w-full max-w-lg bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl sm:my-8 sm:p-6', safeAreaWidth)}>
          <View style={tailwind('items-center sm:flex-row sm:items-start', safeAreaWidth)}>
            <View style={tailwind('flex-grow-0 flex-shrink-0 items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:h-10 sm:w-10', safeAreaWidth)}>
              <Svg style={tailwind('text-red-600 font-normal')} width={24} height={24} viewBox="0 0 24 24" stroke="currentColor">
                <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </Svg>
            </View>
            <View style={tailwind('mt-3 flex-grow flex-shrink sm:mt-0 sm:ml-4', safeAreaWidth)}>
              <Text style={tailwind('text-lg leading-6 font-medium text-gray-900 text-center sm:text-left', safeAreaWidth)}>Confirm delete?</Text>
              <View style={tailwind('mt-2')}>
                <Text style={tailwind('text-sm text-gray-500 font-normal text-center sm:text-left', safeAreaWidth)}>Are you sure you want to permanently delete? This action cannot be undone.</Text>
              </View>
            </View>
          </View>
          <View style={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex-row', safeAreaWidth)}>
            <TouchableOpacity onPress={this.onConfirmDeleteOkBtnClick} style={tailwind('w-full rounded-full border border-red-600 py-2 bg-red-600 sm:px-3.5 sm:py-1.5 sm:w-auto', safeAreaWidth)}>
              <Text style={tailwind('text-base font-medium text-white text-center sm:text-sm sm:rounded-full', safeAreaWidth)}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onConfirmDeleteCancelBtnClick} style={[tailwind('mt-3 w-full rounded-full border border-gray-400 bg-white sm:mt-0 sm:ml-3 sm:px-3 sm:py-1.5 sm:w-auto', safeAreaWidth), cancelBtnStyle]}>
              <Text style={tailwind('text-base font-normal text-gray-500 text-center sm:text-sm', safeAreaWidth)}>Cancel</Text>
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
    popupLink: getPopupLink(state),
    selectedLinkIds: state.display.selectedLinkIds,
    deletingListName: state.display.deletingListName,
  };
};

const mapDispatchToProps = {
  updatePopup, deleteLinks, updateBulkEdit, deleteListNames, updateDeletingListName,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(withMenuContext(ConfirmDeletePopup)));
