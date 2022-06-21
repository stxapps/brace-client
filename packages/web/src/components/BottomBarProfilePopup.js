import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Url from 'url-parse';

import {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId,
} from '../actions';
import { HASH_SUPPORT, PROFILE_POPUP, SETTINGS_VIEW_ACCOUNT } from '../types/const';
import { bModalBgFMV, bModalFMV } from '../types/animConfigs';

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

    const { isProfilePopupShown } = this.props;
    if (!isProfilePopupShown) return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup" />
    );

    return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup">
        <motion.button key="BB_ProfilePopup_cancelBtn" onClick={this.onProfileCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black bg-opacity-25 cursor-default z-40 focus:outline-none" variants={bModalBgFMV} initial="hidden" animate="visible" exit="hidden" />
        <motion.div key="BB_ProfilePopup_menuPopup" className="pt-4 pb-4 fixed inset-x-0 bottom-0 bg-white rounded-t-lg shadow-xl ring-1 ring-black ring-opacity-5 z-41" variants={bModalFMV} initial="hidden" animate="visible" exit="hidden">
          <button onClick={this.onSettingsBtnClick} className="py-4 pl-4 block w-full text-sm text-gray-700 text-left rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">Settings</button>
          <button onClick={this.onSupportBtnClick} className="py-4 pl-4 block w-full text-sm text-gray-700 text-left rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">Support</button>
          <button onClick={this.onSignOutBtnClick} className="py-4 pl-4 block w-full text-sm text-gray-700 text-left rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">Sign out</button>
        </motion.div>
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, updateSettingsPopup, updateSettingsViewId,
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarProfilePopup);
