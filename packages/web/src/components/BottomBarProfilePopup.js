import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Url from 'url-parse';

import {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId,
} from '../actions';
import { HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT } from '../types/const';
import { bModalBgFMV, bModalFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class BottomBarProfilePopup extends React.PureComponent {

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

    const urlObj = new Url(window.location.href, {});
    urlObj.set('pathname', '/');
    urlObj.set('hash', HASH_SUPPORT);
    window.location.href = urlObj.toString();
  }

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  }

  render() {
    const { isProfilePopupShown, tailwind } = this.props;

    if (!isProfilePopupShown) return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup" />
    );

    return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup">
        <motion.button key="BB_ProfilePopup_cancelBtn" onClick={this.onProfileCancelBtnClick} tabIndex={-1} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={bModalBgFMV} initial="hidden" animate="visible" exit="hidden" />
        <motion.div key="BB_ProfilePopup_menuPopup" className={tailwind('fixed inset-x-0 bottom-0 z-41 rounded-t-lg bg-white pt-4 pb-4 shadow-xl ring-1 ring-black ring-opacity-5')} variants={bModalFMV} initial="hidden" animate="visible" exit="hidden">
          <button onClick={this.onSettingsBtnClick} className={tailwind('block w-full rounded-md py-4 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset')}>Settings</button>
          <button onClick={this.onSupportBtnClick} className={tailwind('block w-full rounded-md py-4 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset')}>Support</button>
          <button onClick={this.onSignOutBtnClick} className={tailwind('block w-full rounded-md py-4 pl-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset')}>Sign out</button>
        </motion.div>
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarProfilePopup));
