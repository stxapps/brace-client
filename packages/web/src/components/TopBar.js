import React from 'react';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';
import jdenticon from "jdenticon";

import { signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  ADD_POPUP, PROFILE_POPUP,
  PC_50, PC_33, SIGN_IN, NAV,
} from '../types/const';
import { validateUrl } from '../utils';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

class TopBar extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    this.userImage = props.userImage;
    if (this.userImage === null) {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    }
  }

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

  renderRightPaneSignIn() {

    return (
      <button onClick={() => this.props.signIn()} className="my-px block h-14">
        <span className="px-3 py-1 text-base text-gray-700 border border-gray-700 rounded-full shadow-sm hover:bg-gray-800 hover:text-white active:bg-gray-900">Sign in</span>
      </button>
    );
  }

  renderRightPaneNav() {

    const isRightPaneShown = [PC_50, PC_33].includes(this.props.columnWidth);
    if (!isRightPaneShown) return null;

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
          <button onClick={this.onProfileBtnClick} className={`relative block h-8 w-8 bg-white rounded-full overflow-hidden border-2 border-gray-200 ${isProfilePopupShown && 'z-41'}`}>
            <GracefulImage className="h-full w-full object-cover" src={this.userImage} alt="Profile" />
          </button>
          {isProfilePopupShown && this.renderProfilePopup()}
        </div>
      </React.Fragment>
    );
  }

  render() {

    const rightPaneType = this.props.rightPane;

    let rightPane = null;
    if (rightPaneType === SIGN_IN) {
      rightPane = this.renderRightPaneSignIn();
    } else if (rightPaneType === NAV) {
      rightPane = this.renderRightPaneNav();
    }

    return (
      <header className="mx-auto px-4 flex justify-between items-center max-w-6xl min-h-14 md:px-6 lg:px-8">
        <div className="relative">
          <img className="h-8 md:hidden" src={shortLogo} alt="Brace logo" />
          <img className="hidden h-6 md:block" src={fullLogo} alt="Brace logo" />
          <span style={{ top: '-0.5625rem', right: '-1.625rem' }} className="absolute text-xs">beta</span>
        </div>
        {rightPane}
      </header>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
    searchString: state.display.searchString,
    isAddPopupShown: state.display.isAddPopupShown,
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, addLink, updateSearchString,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
