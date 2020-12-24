import React from 'react';
import { connect } from 'react-redux';
import { Text, TouchableOpacity, Linking, Animated, BackHandler } from 'react-native';

import { signOut, updatePopup } from '../actions';
import { DOMAIN_NAME, PROFILE_POPUP, SETTINGS_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { bModalOpenAnimConfig, bModalCloseAnimConfig } from '../types/animConfigs';

// height is 231 from onLayout and bottom-8 is 32.
const PROFILE_POPUP_HEIGHT = 231 - 32;

class BottomBarProfilePopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { didCloseAnimEnd: !props.isProfilePopupShown };

    this.profilePopupTranslateY = new Animated.Value(PROFILE_POPUP_HEIGHT);
    this.profilePopupBackHandler = null;
  }

  componentDidMount() {
    this.registerProfilePopupBackHandler(this.props.isProfilePopupShown);

    if (this.props.isProfilePopupShown) {
      Animated.spring(
        this.profilePopupTranslateY, { toValue: 0, ...bModalOpenAnimConfig }
      ).start();
    }
  }

  componentDidUpdate(prevProps, prevState) {

    const { isProfilePopupShown } = this.props;
    if (prevProps.isProfilePopupShown !== isProfilePopupShown) {
      this.registerProfilePopupBackHandler(isProfilePopupShown);
    }

    if (!prevProps.isProfilePopupShown && isProfilePopupShown) {
      Animated.spring(
        this.profilePopupTranslateY, { toValue: 0, ...bModalOpenAnimConfig }
      ).start();
    }

    if (prevProps.isProfilePopupShown && !isProfilePopupShown) {
      Animated.spring(
        this.profilePopupTranslateY,
        { toValue: PROFILE_POPUP_HEIGHT, ...bModalCloseAnimConfig }
      ).start(() => {
        this.setState({ didCloseAnimEnd: true });
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isProfilePopupShown && nextProps.isProfilePopupShown) {
      if (this.state.didCloseAnimEnd) {
        this.setState({ didCloseAnimEnd: false })
      }
    }
  }

  componentWillUnmount() {
    this.registerProfilePopupBackHandler(false);
  }

  registerProfilePopupBackHandler = (isProfilePopupShown) => {
    if (isProfilePopupShown) {
      if (!this.profilePopupBackHandler) {
        this.profilePopupBackHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            if (!this.props.isProfilePopupShown) return false;

            this.onProfileCancelBtnClick();
            return true;
          }
        );
      }
    } else {
      if (this.profilePopupBackHandler) {
        this.profilePopupBackHandler.remove();
        this.profilePopupBackHandler = null;
      }
    }
  }

  onProfileCancelBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;
    this.props.updatePopup(SETTINGS_POPUP, true);
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSupportBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, false);
    Linking.openURL(DOMAIN_NAME + '/#support');
  }

  onSignOutBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;

    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()
  }

  render() {

    if (!this.props.isProfilePopupShown && this.state.didCloseAnimEnd) return null;

    const popupStyle = { transform: [{ translateY: this.profilePopupTranslateY }] }

    return (
      <React.Fragment>
        <TouchableOpacity onPress={this.onProfileCancelBtnClick} style={tailwind('absolute inset-0 bg-black opacity-25 z-40')}></TouchableOpacity>
        <Animated.View style={[tailwind('pt-4 pb-16 absolute inset-x-0 -bottom-12 bg-white border border-gray-200 rounded-t-lg shadow-xl z-41'), popupStyle]}>
          <TouchableOpacity onPress={this.onSettingsBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSupportBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSignOutBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Sign out</Text>
          </TouchableOpacity>
        </Animated.View>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = { signOut, updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarProfilePopup);
