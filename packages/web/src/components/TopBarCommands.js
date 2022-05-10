import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Url from 'url-parse';

import { signOut, updatePopup, updateSettingsPopup, updateBulkEdit } from '../actions';
import { HASH_SUPPORT, PROFILE_POPUP } from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import TopBarAddPopup from './TopBarAddPopup';
import TopBarSearchInput from './TopBarSearchInput';

class TopBarCommands extends React.PureComponent {

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

  renderProfilePopup() {

    const { isProfilePopupShown } = this.props;
    if (!isProfilePopupShown) return (
      <AnimatePresence key="AnimatePresence_ProfilePopup" />
    );

    return (
      <AnimatePresence key="AnimatePresence_ProfilePopup">
        <motion.button key="ProfilePopup_cancelBtn" onClick={this.onProfileCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black bg-opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        <motion.div key="ProfilePopup_menuPopup" className="mt-2 py-2 absolute right-0 w-28 bg-white border border-gray-100 rounded-lg shadow-xl z-41 origin-top-right" variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <button onClick={this.onSettingsBtnClick} className="py-2.5 pl-4 block w-full text-sm text-gray-700 text-left rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">Settings</button>
          <button onClick={this.onSupportBtnClick} className="py-2.5 pl-4 block w-full text-sm text-gray-700 text-left rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">Support</button>
          <button onClick={this.onSignOutBtnClick} className="py-2.5 pl-4 block w-full text-sm text-gray-700 text-left rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">Sign out</button>
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
          <button onClick={this.onBulkEditBtnClick} style={{ height: '2rem', paddingLeft: '0.625rem', paddingRight: '0.75rem' }} className={`px-3 flex justify-center items-center bg-white border border-gray-400 rounded-full group hover:border-gray-500 focus:outline-none focus:ring`}>
            <svg className="mx-auto w-3.5 text-gray-500 group-hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
            </svg>
            <span className="ml-1 text-sm text-gray-500 group-hover:text-gray-600">Select</span>
          </button>
        </div>
        <div className="relative ml-4">
          <button onClick={this.onProfileBtnClick} className={`relative block h-8 w-8 rounded-full overflow-hidden group ${isProfilePopupShown ? 'z-41' : ''} focus:outline-none focus:ring`}>
            <svg className="mx-auto w-7 text-gray-500 group-hover:text-gray-600" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H5.01M12 12H12.01M19 12H19.01M6 12C6 12.2652 5.89464 12.5196 5.70711 12.7071C5.51957 12.8946 5.26522 13 5 13C4.73478 13 4.48043 12.8946 4.29289 12.7071C4.10536 12.5196 4 12.2652 4 12C4 11.7348 4.10536 11.4804 4.29289 11.2929C4.48043 11.1054 4.73478 11 5 11C5.26522 11 5.51957 11.1054 5.70711 11.2929C5.89464 11.4804 6 11.7348 6 12ZM13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13C11.7348 13 11.4804 12.8946 11.2929 12.7071C11.1054 12.5196 11 12.2652 11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12ZM20 12C20 12.2652 19.8946 12.5196 19.7071 12.7071C19.5196 12.8946 19.2652 13 19 13C18.7348 13 18.4804 12.8946 18.2929 12.7071C18.1054 12.5196 18 12.2652 18 12C18 11.7348 18.1054 11.4804 18.2929 11.2929C18.4804 11.1054 18.7348 11 19 11C19.2652 11 19.5196 11.1054 19.7071 11.2929C19.8946 11.4804 20 11.7348 20 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {this.renderProfilePopup()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = { signOut, updatePopup, updateSettingsPopup, updateBulkEdit };

export default connect(mapStateToProps, mapDispatchToProps)(TopBarCommands);
