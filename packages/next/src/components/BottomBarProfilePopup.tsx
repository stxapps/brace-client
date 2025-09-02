import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import Url from 'url-parse';

import { signOut, updatePopup } from '../actions';
import {
  updateSettingsPopup, updateSettingsViewId, lockCurrentList,
} from '../actions/chunk';
import {
  getSafeAreaWidth, getSafeAreaInsets, getThemeMode, getCurrentLockListStatus,
  getCanChangeListNames,
} from '../selectors';
import {
  HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT, LOCK, UNLOCKED,
} from '../types/const';
import { bModalBgFMV, bModalFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class BottomBarProfilePopup extends React.PureComponent<any, any> {

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  };

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);

    this.props.updateSettingsViewId(SETTINGS_VIEW_ACCOUNT, true);
    this.props.updateSettingsPopup(true);
  };

  onSupportBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);

    const urlObj = new Url(window.location.href, {});
    urlObj.set('pathname', '/');
    urlObj.set('hash', HASH_SUPPORT);
    window.location.href = urlObj.toString();
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

    if (!isProfilePopupShown) return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup" />
    );

    const popupStyle = {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right,
    };

    const supportAndSignOutButtons = (
      <React.Fragment>
        <button onClick={this.onSupportBtnClick} className={tailwind('block w-full rounded-md py-4 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>Support</button>
        <button onClick={this.onSignOutBtnClick} className={tailwind('block w-full rounded-md py-4 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>Sign out</button>
      </React.Fragment>
    );

    let buttons;
    if (!canChangeListNames) {
      buttons = supportAndSignOutButtons;
    } else {
      buttons = (
        <React.Fragment>
          {lockStatus === UNLOCKED && <button onClick={this.onLockBtnClick} className={tailwind('block w-full rounded-md py-4 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>{LOCK}</button>}
          <button onClick={this.onSettingsBtnClick} className={tailwind('block w-full rounded-md py-4 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>Settings</button>
          {supportAndSignOutButtons}
        </React.Fragment>
      );
    }

    return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup">
        <motion.button key="BB_ProfilePopup_cancelBtn" onClick={this.onProfileCancelBtnClick} tabIndex={-1} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black/25 focus:outline-none')} variants={bModalBgFMV} initial="hidden" animate="visible" exit="hidden" />
        <motion.div key="BB_ProfilePopup_menuPopup" style={popupStyle} className={tailwind('fixed inset-x-0 bottom-0 z-41 rounded-t-lg bg-white shadow-xl ring-1 ring-black/5 blk:bg-gray-800 blk:ring-white/25')} variants={bModalFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('pt-4 pb-4')}>
            {buttons}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
    insets: getSafeAreaInsets(state),
    lockStatus: getCurrentLockListStatus(state),
    canChangeListNames: getCanChangeListNames(state),
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId, lockCurrentList,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarProfilePopup));
