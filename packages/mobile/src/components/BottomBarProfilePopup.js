import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Modal from 'react-native-modal';

import { signOut, updatePopup } from '../actions';
import {
  DOMAIN_NAME, PROFILE_POPUP, SETTINGS_POPUP, MODAL_SUPPORTED_ORIENTATIONS,
} from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

class BottomBarProfilePopup extends React.PureComponent {

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.updatePopup(SETTINGS_POPUP, true);
  }

  onSupportBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    Linking.openURL(DOMAIN_NAME + '/#support');
  }

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()
  }

  render() {

    const { isProfilePopupShown, windowWidth, windowHeight } = this.props;

    return (
      <Modal isVisible={isProfilePopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onProfileCancelBtnClick} onBackButtonPress={this.onProfileCancelBtnClick} style={tailwind('justify-end m-0')} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="slideInUp" animationInTiming={200} animationOut="slideOutDown" animationOutTiming={200} useNativeDriver={true}>
        <View style={tailwind('py-4 w-full bg-white border border-gray-200 rounded-t-lg shadow-xl')}>
          <TouchableOpacity onPress={this.onSettingsBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSupportBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSignOutBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = { signOut, updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarProfilePopup);
