import React from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

import {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
} from '../actions';
import {
  BULK_EDIT_MOVE_TO_POPUP, ARCHIVE, TRASH, MOVE_TO, MODAL_SUPPORTED_ORIENTATIONS,
} from '../types/const';
import { getListNameMap } from '../selectors';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

class BottomBarBulkEditMoveToPopup extends React.Component {

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

  onBulkEditMoveToCancelBtnClick = () => {
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  renderMenu() {

    const moveTo = [];
    for (const listNameObj of this.props.listNameMap) {
      if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
      if (this.props.listName === listNameObj.listName) continue;

      moveTo.push(listNameObj);
    }

    return moveTo.map(listNameObj => {
      const key = MOVE_TO + ' ' + listNameObj.listName;
      return (
        <TouchableOpacity key={key} onPress={() => this.onBulkEditMoveToPopupClick(key)} style={tailwind('w-full')}>
          <Text style={tailwind('py-4 pl-8 pr-4 w-full text-base text-gray-800 font-normal')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
        </TouchableOpacity>
      );
    });
  }

  render() {

    const { isBulkEditMoveToPopupShown, windowWidth, windowHeight } = this.props;

    return (
      <Modal isVisible={isBulkEditMoveToPopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onBulkEditMoveToCancelBtnClick} onBackButtonPress={this.onBulkEditMoveToCancelBtnClick} style={tailwind('justify-end m-0')} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="slideInUp" animationInTiming={200} animationOut="slideOutDown" animationOutTiming={200} useNativeDriver={true}>
        <View style={tailwind('pt-4 w-full bg-white border border-gray-200 rounded-t-lg shadow-xl')}>
          <ScrollView style={cache('BBBEC_moveToScrollView', [tailwind('w-full'), { maxHeight: 288 }])} contentContainerStyle={tailwind('pb-4')}>
            <Text style={tailwind('py-4 pl-4 pr-4 w-full text-base text-gray-800 font-normal')}>Move to...</Text>
            {this.renderMenu()}
          </ScrollView>
        </View>
      </Modal>
    );
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarBulkEditMoveToPopup);
