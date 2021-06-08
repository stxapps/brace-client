import React from 'react';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';
import jdenticon from 'jdenticon';
import { motion, AnimatePresence } from "framer-motion";

import { signOut, updatePopup, updateBulkEdit } from '../actions';
import { PROFILE_POPUP, SETTINGS_POPUP } from '../types/const';
import { popupBgFMV, trPopupFMV } from '../types/animConfigs';

import TopBarAddPopup from './TopBarAddPopup';
import TopBarSearchInput from './TopBarSearchInput';

class TopBarCommands extends React.PureComponent {

  constructor(props) {
    super(props);

    this.userImage = props.userImage;
    this.profileBtnStyleClasses = 'rounded-full';
    if (this.userImage === null) {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      this.profileBtnStyleClasses = 'rounded-lg';
    }
  }

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  }

  onProfileBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.updatePopup(SETTINGS_POPUP, true);
  }

  onSupportBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    window.location.href = '/#support';
  }

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  }

  renderProfilePopup() {

    const { isProfilePopupShown } = this.props;
    if (!isProfilePopupShown) return (
      <AnimatePresence key="AnimatePresence_ProfilePopup" />
    );

    return (
      <AnimatePresence key="AnimatePresence_ProfilePopup">
        <motion.button key="ProfilePopup_cancelBtn" onClick={this.onProfileCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        <motion.div key="ProfilePopup_menuPopup" className="mt-2 py-2 absolute right-0 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-41" variants={trPopupFMV} initial="hidden" animate="visible" exit="hidden">
          <button onClick={this.onSettingsBtnClick} className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Settings</button>
          <button onClick={this.onSupportBtnClick} className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Support</button>
          <button onClick={this.onSignOutBtnClick} className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Sign out</button>
        </motion.div>
      </AnimatePresence>
    );
  }

  render() {

    const { isProfilePopupShown } = this.props;

    return (
      <div className="flex justify-end items-center">
        <TopBarAddPopup />
        <TopBarSearchInput />
        <div className="relative ml-4">
          <button onClick={this.onBulkEditBtnClick} style={{ height: '2rem', paddingLeft: '0.625rem', paddingRight: '0.75rem' }} className={`px-3 flex justify-center items-center bg-white border border-gray-600 rounded-full shadow-sm group hover:border-gray-900 hover:shadow-outline active:bg-gray-200 focus:outline-none focus:shadow-outline`}>

            <svg className="mx-auto w-4 text-gray-600 group-hover:text-gray-800" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
            </svg>
            <span className="ml-1 text-base text-gray-700 group-hover:text-gray-900">Select</span>
          </button>
        </div>
        <div className="relative ml-4">
          <button onClick={this.onProfileBtnClick} className={`relative block h-8 w-8 overflow-hidden border-2 border-gray-200 ${isProfilePopupShown ? 'z-41' : ''} hover:shadow-outline focus:outline-none focus:shadow-outline ${this.profileBtnStyleClasses}`}>
            <GracefulImage className="h-full w-full bg-white object-cover" src={this.userImage} alt="Profile" />
          </button>
          {this.renderProfilePopup()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = { signOut, updatePopup, updateBulkEdit };

export default connect(mapStateToProps, mapDispatchToProps)(TopBarCommands);
