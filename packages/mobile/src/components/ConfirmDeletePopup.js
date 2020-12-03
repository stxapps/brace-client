import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native';
import { withMenuContext } from 'react-native-popup-menu';
import Modal from 'react-native-modal';

import {
  updatePopup, deleteLinks, clearSelectedLinkIds, updateBulkEdit,
  deleteListNames, updateDeletingListName,
} from '../actions';
import { CONFIRM_DELETE_POPUP, MODAL_SUPPORTED_ORIENTATIONS } from '../types/const';
import { getPopupLink } from '../selectors';
import { cardItemAnimConfig } from '../types/animConfigs';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

class ConfirmDeletePopup extends React.Component {

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

    const { popupLink, selectedLinkIds, deletingListName, safeAreaWidth } = this.props;

    const v1 = popupLink ? 1 : 0;
    const v2 = selectedLinkIds.length > 0 ? 1 : 0;
    const v3 = deletingListName ? 1 : 0;
    if (v1 + v2 + v3 !== 1) {
      throw new Error(`Invalid popupLink: ${popupLink}, selectedLinkIds: ${selectedLinkIds}, and deletingListName: ${deletingListName}`);
    }

    if (popupLink) {
      const { deleteLinks, updatePopup } = this.props;
      const animConfig = cardItemAnimConfig(safeAreaWidth);

      LayoutAnimation.configureNext(animConfig);
      deleteLinks([popupLink.id]);
      this.props.ctx.menuActions.closeMenu();
      updatePopup(CONFIRM_DELETE_POPUP, false);
      updatePopup(popupLink.id, false);
      return;
    }

    if (selectedLinkIds.length > 0) {
      const {
        deleteLinks, updatePopup, clearSelectedLinkIds, updateBulkEdit,
      } = this.props;

      deleteLinks(selectedLinkIds);
      updatePopup(CONFIRM_DELETE_POPUP, false);
      clearSelectedLinkIds();
      updateBulkEdit(false);
      return;
    }

    if (deletingListName) {
      const { deleteListNames, updatePopup, updateDeletingListName } = this.props;

      deleteListNames([deletingListName]);
      updatePopup(CONFIRM_DELETE_POPUP, false);
      updateDeletingListName(null);
      return;
    }

    throw new Error('Must not reach here!');
  }

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    this.props.updateDeletingListName(null);
  }

  render() {

    const { isConfirmDeletePopupShown, windowWidth, windowHeight } = this.props;

    return (
      <Modal isVisible={isConfirmDeletePopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onConfirmDeleteCancelBtnClick} onBackButtonPress={this.onConfirmDeleteCancelBtnClick} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.1} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true}>
        <View style={tailwind('p-4 self-center w-48 bg-white border border-gray-200 rounded-lg shadow-xl')}>
          <Text style={tailwind('py-2 text-lg text-gray-900 font-normal text-center')}>Confirm delete?</Text>
          <View style={tailwind('py-2 flex-row items-center justify-center')}>
            <TouchableOpacity onPress={this.onConfirmDeleteOkBtnClick} style={tailwind('mr-2 py-2')}>
              <View style={tailwind('px-3 py-1 bg-white border border-gray-900 rounded-full shadow-sm')}>
                <Text style={tailwind('text-base text-gray-900 font-normal text-center')}>Yes</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onConfirmDeleteCancelBtnClick} style={tailwind('ml-2 py-2')}>
              <View style={tailwind('px-3 py-1 bg-white border border-gray-900 rounded-full shadow-sm')}>
                <Text style={tailwind('text-base text-gray-900 font-normal text-center')}>No</Text>
              </View>
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
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  }
};

const mapDispatchToProps = {
  updatePopup, deleteLinks, clearSelectedLinkIds, updateBulkEdit,
  deleteListNames, updateDeletingListName,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(withMenuContext(ConfirmDeletePopup)));
