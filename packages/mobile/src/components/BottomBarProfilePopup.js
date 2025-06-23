import React from 'react';
import {
  View, Text, TouchableOpacity, Linking, Animated, BackHandler,
} from 'react-native';
import { connect } from 'react-redux';

import { signOut, updatePopup, refreshFetched } from '../actions';
import {
  updateSettingsPopup, updateSettingsViewId, lockCurrentList,
} from '../actions/chunk';
import {
  DOMAIN_NAME, HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT, LOCK, UNLOCKED,
} from '../types/const';
import {
  getThemeMode, getCurrentLockListStatus, getCanChangeListNames,
} from '../selectors';
import { bModalFMV } from '../types/animConfigs';

import { withTailwind } from '.';

// height is 190 from onLayout
const PROFILE_POPUP_HEIGHT = 190;

class BottomBarProfilePopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { didCloseAnimEnd: !props.isProfilePopupShown };

    this.profilePopupTranslateY = new Animated.Value(
      PROFILE_POPUP_HEIGHT - 16 + Math.max(props.insets.bottom, 16)
    );
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

    const { isProfilePopupShown, insets } = this.props;
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
        {
          toValue: PROFILE_POPUP_HEIGHT - 16 + Math.max(insets.bottom, 16),
          ...bModalFMV.hidden,
        }
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
  };

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  };

  onRefreshBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.refreshFetched(true, true);
  };

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);

    this.props.updateSettingsViewId(SETTINGS_VIEW_ACCOUNT, true);
    this.props.updateSettingsPopup(true);
  };

  onSupportBtnClick = () => {
    Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT);
    setTimeout(() => {
      this.props.updatePopup(PROFILE_POPUP, false);
    }, 100);
  };

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  };

  onLockBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    // Wait for the close animation to finish first
    setTimeout(() => this.props.lockCurrentList(), 100);
  };

  render() {
    const {
      isProfilePopupShown, insets, tailwind, lockStatus, canChangeListNames,
    } = this.props;

    if (!isProfilePopupShown && this.state.didCloseAnimEnd) return null;

    const popupStyle = {
      paddingBottom: Math.max(insets.bottom, 16),
      paddingLeft: insets.left, paddingRight: insets.right,
      transform: [{ translateY: this.profilePopupTranslateY }],
    };

    const supportAndSignOutButtons = (
      <React.Fragment>
        <TouchableOpacity onPress={this.onSupportBtnClick} style={tailwind('w-full py-4 pl-4')}>
          <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onSignOutBtnClick} style={tailwind('w-full py-4 pl-4')}>
          <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Sign out</Text>
        </TouchableOpacity>
      </React.Fragment>
    );

    let buttons;
    if (!canChangeListNames) {
      buttons = supportAndSignOutButtons;
    } else {
      buttons = (
        <React.Fragment>
          {lockStatus === UNLOCKED && <TouchableOpacity onPress={this.onLockBtnClick} style={tailwind('w-full py-4 pl-4')}>
            <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>{LOCK}</Text>
          </TouchableOpacity>}
          <TouchableOpacity onPress={this.onRefreshBtnClick} style={tailwind('w-full py-4 pl-4')}>
            <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSettingsBtnClick} style={tailwind('w-full py-4 pl-4')}>
            <Text style={tailwind('text-sm font-normal text-gray-700 blk:text-gray-200')}>Settings</Text>
          </TouchableOpacity>
          {supportAndSignOutButtons}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <TouchableOpacity activeOpacity={1.0} onPress={this.onProfileCancelBtnClick} style={tailwind('absolute inset-0 z-40 bg-black bg-opacity-25')} />
        <Animated.View style={[tailwind('absolute inset-x-0 bottom-0 z-41 rounded-t-lg bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
          <View style={tailwind('pt-4')}>
            {buttons}
          </View>
        </Animated.View>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
    themeMode: getThemeMode(state),
    lockStatus: getCurrentLockListStatus(state),
    canChangeListNames: getCanChangeListNames(state),
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId, refreshFetched,
  lockCurrentList,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarProfilePopup));
