import React from 'react';
import { connect } from 'react-redux';
import {
  View, TouchableOpacity, LayoutAnimation,
} from 'react-native';
import {
  withMenuContext,
} from 'react-native-popup-menu';
import Modal from 'react-native-modal';

import {
  updatePopup, deleteLinks,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP,
} from '../types/const';
import { getPopupLink } from '../selectors';
import { cardItemAnimConfig } from '../types/animConfigs';
import { tailwind } from '../stylesheets/tailwind';

import { InterText as Text, withSafeAreaContext } from '.';

class ConfirmDeletePopup extends React.PureComponent {

  onConfirmDeleteOkBtnClick = () => {

    const { safeAreaWidth } = this.props;
    const animConfig = cardItemAnimConfig(safeAreaWidth);

    LayoutAnimation.configureNext(animConfig);
    this.props.deleteLinks([this.props.popupLink.id]);

    this.props.ctx.menuActions.closeMenu();
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    this.props.updatePopup(this.props.popupLink.id, false);
  }

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
  };

  render() {

    const { isConfirmDeletePopupShown, windowWidth, windowHeight } = this.props;

    return (
      <Modal isVisible={isConfirmDeletePopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onConfirmDeleteCancelBtnClick} onBackButtonPress={this.onConfirmDeleteCancelBtnClick} supportedOrientations={['portrait', 'landscape']} backdropOpacity={0.1} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true}>
        <View style={tailwind('p-4 self-center w-48 bg-white border border-gray-200 rounded-lg shadow-xl')}>
          <Text style={tailwind('py-2 text-lg text-gray-900 text-center')}>Confirm delete?</Text>
          <View style={tailwind('py-2 flex-row items-center justify-center')}>
            <TouchableOpacity onPress={this.onConfirmDeleteOkBtnClick} style={tailwind('mr-2 py-2')}>
              <View style={tailwind('px-3 py-1 bg-white border border-gray-900 rounded-full shadow-sm')}>
                <Text style={tailwind('text-base text-gray-900 text-center')}>Yes</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onConfirmDeleteCancelBtnClick} style={tailwind('ml-2 py-2')}>
              <View style={tailwind('px-3 py-1 bg-white border border-gray-900 rounded-full shadow-sm')}>
                <Text style={tailwind('text-base text-gray-900 text-center')}>No</Text>
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
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  }
};

const mapDispatchToProps = {
  updatePopup, deleteLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(withMenuContext(ConfirmDeletePopup)));
