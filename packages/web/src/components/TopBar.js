import React from 'react';
import { connect } from 'react-redux';

import { signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  ADD_POPUP, PROFILE_POPUP,
  PC_50, PC_33,
} from '../types/const';
import { validateUrl } from '../utils';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

class TopBar extends React.Component {

  initialState = {
    url: '',
    msg: '',
    isAskingConfirm: false,
  };

  state = { ...this.initialState };

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;

    this.props.updatePopup(ADD_POPUP, true);
    this.setState({ ...this.initialState });
  }

  onAddInputChange = (e) => {
    this.setState({ url: e.target.value, msg: '', isAskingConfirm: false });
  }

  onAddOkBtnClick = () => {
    if (!this.state.isAskingConfirm) {
      const [isValid, msg, isAskingConfirm] = validateUrl(this.state.url);
      if (!isValid) {
        this.setState({ msg, isAskingConfirm });
        return;
      }
    }

    this.props.addLink(this.state.url);
    this.props.updatePopup(ADD_POPUP, false);
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  onProfileBtnClick = () => {
    if (this.props.isProfilePopupShown) return;

    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSignOutBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()
  }

  renderAddPopup() {

    const { url, msg, isAskingConfirm } = this.state;

    return (
      <React.Fragment>
        <button onClick={this.onAddCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-40"></button>
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-41">
          <input
            type="text"
            placeholder="https://"
            value={url}
            onChange={this.onAddInputChange} />
          <button onClick={this.onAddOkBtnClick}>{isAskingConfirm ? 'Sure' : 'Save'}</button>
          <button onClick={this.onAddCancelBtnClick}>Cancel</button>
          <p className="text-red-500">{msg}</p>
        </div>
      </React.Fragment >
    );
  }

  renderProfilePopup() {
    return (
      <React.Fragment>
        <button onClick={this.onProfileCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-40"></button>
        <div id="profile-menu" className="absolute right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-41">
          <button onClick={this.onSignOutBtnClick} className="block px-4 py-2 text-gray-800 hover:bg-gray-400">Sign out</button>
        </div>
      </React.Fragment>
    );
  }

  renderRightPane() {
    const { isAddPopupShown, isProfilePopupShown } = this.props;
    const { searchString, updateSearchString } = this.props;

    return (
      <React.Fragment>
        <div className="relative p-3">
          <button onClick={this.onAddBtnClick} className={`relative px-2 py-2 bg-gray-900 rounded-lg shadow-sm hover:bg-gray-800 active:bg-black ${isAddPopupShown && 'z-41'}`}>
            <svg className="w-4 text-white lg:w-5" viewBox="0 0 18 14" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.258 1v12M1 6.5h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {isAddPopupShown && this.renderAddPopup()}
        </div>
        <div>
          <input
            type="text"
            placeholder="Search"
            value={searchString}
            onChange={e => updateSearchString(e.target.value)} />
        </div>
        <div className="relative ml-6">
          <button onClick={this.onProfileBtnClick} className={`relative block h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200 ${isProfilePopupShown && 'z-41'}`}>
            <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80" alt="Profile" />
          </button>
          {isProfilePopupShown && this.renderProfilePopup()}
        </div>
      </React.Fragment>
    );
  }

  render() {

    const isRightPaneShown = [PC_50, PC_33].includes(this.props.columnWidth);

    return (
      <div className="flex content justify-between content-between">
        <div className="relative w-40">
          <img className="h-8 md:hidden" src={shortLogo} alt="Brace logo" />
          <img className="hidden h-8 md:block" src={fullLogo} alt="Brace logo" />
          <span className="absolute text-xs" style={{ top: '-9px', right: '-26px' }}>beta</span>
        </div>
        {isRightPaneShown && this.renderRightPane()}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    searchString: state.display.searchString,
    isAddPopupShown: state.display.isAddPopupShown,
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, addLink, updateSearchString,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
