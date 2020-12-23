import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import { signOut, updatePopup } from '../actions';
import { PROFILE_POPUP, SETTINGS_POPUP } from '../types/const';
import { popupBgFMV, bModalFMV } from '../types/animConfigs';

class BottomBarProfilePopup extends React.PureComponent {

  onProfileCancelBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.updatePopup(SETTINGS_POPUP, true);
  }

  onSupportBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, false);
    window.location.href = '/#support';
  }

  onSignOutBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isProfilePopupShown) return;

    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()
  }

  render() {

    const { isProfilePopupShown } = this.props;
    if (!isProfilePopupShown) return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup"></AnimatePresence>
    );

    return (
      <AnimatePresence key="AnimatePresence_BB_ProfilePopup">
        <motion.button key="BB_ProfilePopup_cancelBtn" onClick={this.onProfileCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
        <motion.div key="BB_ProfilePopup_menuPopup" className="pt-4 pb-16 fixed inset-x-0 -bottom-12 bg-white border border-gray-200 rounded-t-lg shadow-xl z-41" variants={bModalFMV} initial="hidden" animate="visible" exit="hidden">
          <button onClick={this.onSettingsBtnClick} className="py-4 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Settings</button>
          <button onClick={this.onSupportBtnClick} className="py-4 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Support</button>
          <button onClick={this.onSignOutBtnClick} className="py-4 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Sign out</button>
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

const mapDispatchToProps = { signOut, updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarProfilePopup);
