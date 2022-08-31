import React from 'react';
import { Text, TouchableOpacity, Linking, Animated, BackHandler } from 'react-native';
import { connect } from 'react-redux';

import {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId,
} from '../actions';
import {
  DOMAIN_NAME, HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT,
} from '../types/const';
import { getThemeMode } from '../selectors';
import { bModalFMV } from '../types/animConfigs';

import { withTailwind } from '.';

// height is 190 from onLayout
const PROFILE_POPUP_HEIGHT = 190;

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
      Animated.timing(
        this.profilePopupTranslateY, { toValue: 0, ...bModalFMV.visible }
      ).start();
    }
  }

  componentDidUpdate(prevProps, prevState) {

    const { isProfilePopupShown } = this.props;
    if (prevProps.isProfilePopupShown !== isProfilePopupShown) {
      this.registerProfilePopupBackHandler(isProfilePopupShown);
    }

    if (!prevProps.isProfilePopupShown && isProfilePopupShown) {
      Animated.timing(
        this.profilePopupTranslateY, { toValue: 0, ...bModalFMV.visible }
      ).start();
    }

    if (prevProps.isProfilePopupShown && !isProfilePopupShown) {
      Animated.timing(
        this.profilePopupTranslateY,
        { toValue: PROFILE_POPUP_HEIGHT, ...bModalFMV.hidden }
      ).start(() => {
        this.setState({ didCloseAnimEnd: true });
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isProfilePopupShown && nextProps.isProfilePopupShown) {
      if (this.state.didCloseAnimEnd) {
        this.setState({ didCloseAnimEnd: false });
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
          'hardwareBackPress',
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
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);

    this.props.updateSettingsViewId(SETTINGS_VIEW_ACCOUNT, true);
    this.props.updateSettingsPopup(true);
  }

  onSupportBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT);
  }

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  }

  render() {
    const { isProfilePopupShown, tailwind } = this.props;

    if (!isProfilePopupShown && this.state.didCloseAnimEnd) return null;

    const popupStyle = { transform: [{ translateY: this.profilePopupTranslateY }] };

    return (
      <React.Fragment>
        <TouchableOpacity activeOpacity={1.0} onPress={this.onProfileCancelBtnClick} style={tailwind('absolute inset-0 z-40 bg-black bg-opacity-25')} />
        <Animated.View style={[tailwind('absolute inset-x-0 bottom-0 z-41 rounded-t-lg border border-gray-100 bg-white pt-4 pb-4 shadow-xl'), popupStyle]}>
          <TouchableOpacity onPress={this.onSettingsBtnClick} style={tailwind('w-full py-4 pl-4')}>
            <Text style={tailwind('text-sm font-normal text-gray-700')}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSupportBtnClick} style={tailwind('w-full py-4 pl-4')}>
            <Text style={tailwind('text-sm font-normal text-gray-700')}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSignOutBtnClick} style={tailwind('w-full py-4 pl-4')}>
            <Text style={tailwind('text-sm font-normal text-gray-700')}>Sign out</Text>
          </TouchableOpacity>
        </Animated.View>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarProfilePopup));
