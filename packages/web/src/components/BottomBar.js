import React from 'react';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';
import jdenticon from 'jdenticon';

import { signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
  BAR_HEIGHT,
} from '../types/const';
import { getPopupLink } from '../selectors';
import { validateUrl, isEqual } from '../utils';

const BOTTOM_BAR_DURATION = 'duration-300';

class BottomBar extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    this.addInput = React.createRef();
    this.searchInput = React.createRef();

    this.userImage = props.userImage;
    if (this.userImage === null) {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isAddPopupShown && this.props.isAddPopupShown) {
      this.addInput.current.focus();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;
    this.props.updatePopup(ADD_POPUP, true);
  }

  onAddInputChange = (e) => {
    this.setState({ url: e.target.value, msg: '', isAskingConfirm: false });
  }

  onAddInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.onAddOkBtnClick();
      if (window.document.activeElement instanceof HTMLInputElement) {
        window.document.activeElement.blur();
      }
    }
  }

  onAddOkBtnClick = () => {
    if (!this.state.isAskingConfirm) {
      const urlValidatedResult = validateUrl(this.state.url);
      if (urlValidatedResult === NO_URL) {
        this.setState({ msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false });
        return;
      }
      if (urlValidatedResult === ASK_CONFIRM_URL) {
        this.setState({ msg: URL_MSGS[urlValidatedResult], isAskingConfirm: true });
        return;
      }
    }

    this.props.addLink(this.state.url, true);
    this.props.updatePopup(ADD_POPUP, false);
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  onSearchBtnClick = () => {
    this.searchInput.current.focus();

    if (this.props.isSearchPopupShown) return;
    this.props.updatePopup(SEARCH_POPUP, true);
  }

  onSearchInputChange = (e) => {
    this.props.updateSearchString(e.target.value);
  }

  onSearchClearBtnClick = () => {
    this.props.updateSearchString('');
    this.searchInput.current.focus();
  }

  onSearchCancelBtnClick = () => {
    this.props.updateSearchString('');
    this.props.updatePopup(SEARCH_POPUP, false);
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

    const { isAddPopupShown } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    return (
      <React.Fragment>
        <button onClick={this.onAddCancelBtnClick} tabIndex={-1} className={`${!isAddPopupShown ? 'hidden' : ''} fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none`}></button>
        <div className={`px-4 pt-6 pb-6 fixed inset-x-0 bottom-0 bg-white border border-gray-200 rounded-t-lg shadow-xl transform ${!isAddPopupShown ? 'translate-y-full' : ''} z-41`}>
          <input ref={this.addInput} onChange={this.onAddInputChange} onKeyPress={this.onAddInputKeyPress} className="px-4 py-2 w-full bg-white text-gray-900 border border-gray-600 rounded-full appearance-none focus:outline-none focus:shadow-outline" type="url" placeholder="https://" value={url} />
          <p className="pt-3 text-red-500">{msg}</p>
          <div className="pt-3">
            <button onClick={this.onAddOkBtnClick} className="px-5 py-2 bg-gray-900 text-base text-white font-medium rounded-full shadow-sm active:bg-black focus:outline-none focus:shadow-outline">{isAskingConfirm ? 'Sure' : 'Save'}</button>
            <button onClick={this.onAddCancelBtnClick} className="ml-2 underline rounded-sm focus:outline-none focus:shadow-outline">Cancel</button>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderSearchPopup() {
    const { isShown, isSearchPopupShown, searchString } = this.props;

    // Only transition when moving with BottomBar
    //   but when show/hide this search popup, no need animation
    //   as keyboard is already animated.
    const style = {};
    if (isShown) style.bottom = BAR_HEIGHT;
    else style.bottom = 0;
    style.transitionProperty = 'bottom';

    const searchClearBtnClasses = searchString.length === 0 ? 'hidden' : '';

    return (
      <div style={style} className={`px-2 py-2 fixed inset-x-0 flex justify-between items-center bg-white border border-gray-200 transform ${!isSearchPopupShown ? 'translate-y-full' : ''} ${BOTTOM_BAR_DURATION} ease-in-out z-10`}>
        <div className="relative w-full">
          <input ref={this.searchInput} onChange={this.onSearchInputChange} className="pl-4 pr-6 py-1 flex-grow-1 flex-shrink w-full bg-white text-gray-900 border border-gray-600 rounded-full appearance-none focus:outline-none focus:shadow-outline" type="search" placeholder="Search" value={searchString} />
          <button onClick={this.onSearchClearBtnClick} className={`pr-2 ${searchClearBtnClasses} absolute inset-y-0 right-0 flex items-center focus:outline-none-outer`}>
            <svg className="h-5 text-gray-600 cursor-pointer rounded-full focus:shadow-outline-inner" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </svg>
          </button>
        </div>
        <button onClick={this.onSearchCancelBtnClick} className="ml-2 flex-grow-0 flex-shrink-0 h-10 underline rounded-lg focus:outline-none focus:shadow-outline">Cancel</button>
      </div>
    );
  }

  renderProfilePopup() {

    const { isProfilePopupShown } = this.props;

    return (
      <React.Fragment>
        <button onClick={this.onProfileCancelBtnClick} tabIndex={-1} className={`${!isProfilePopupShown ? 'hidden' : ''} fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none`}></button>
        <div className={`py-4 fixed inset-x-0 bottom-0 bg-white border border-gray-200 rounded-t-lg shadow-xl transform ${!isProfilePopupShown ? 'translate-y-full' : ''} transition-transform duration-300 ease-in-out z-41`}>
          <a className="py-4 pl-4 block w-full text-gray-800 text-left focus:outline-none focus:shadow-outline" href="/#support">Support</a>
          <button onClick={this.onSignOutBtnClick} className="py-4 pl-4 block w-full text-gray-800 text-left focus:outline-none focus:shadow-outline">Sign out</button>
        </div>
      </React.Fragment >
    );
  }

  render() {

    const { isShown } = this.props;
    const style = { height: BAR_HEIGHT };

    return (
      <React.Fragment>
        <div style={style} className={`fixed inset-x-0 bottom-0 flex bg-white shadow-inner transform ${!isShown ? 'translate-y-full' : ''} transition-transform ${BOTTOM_BAR_DURATION} ease-in-out z-30`}>
          <button onClick={this.onAddBtnClick} className="flex items-center w-1/3 h-full focus:outline-none-outer">
            <div className="mx-auto flex items-center w-8 h-7 bg-gray-800 rounded-lg shadow-sm active:bg-gray-900 focus:shadow-outline-inner">
              <svg className="mx-auto w-4 text-white" viewBox="0 0 16 14" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
          <button onClick={this.onSearchBtnClick} className="flex items-center w-1/3 h-full focus:outline-none-outer">
            <svg className="mx-auto h-8 w-8 text-gray-800 rounded-lg focus:shadow-outline-inner" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            </svg>
          </button>
          <button onClick={this.onProfileBtnClick} className="flex items-center w-1/3 h-full focus:outline-none-outer">
            <div className="mx-auto flex items-center h-10 w-10 rounded-lg overflow-hidden border-2 border-gray-200 focus:shadow-outline-inner">
              <GracefulImage className="h-full w-full bg-white object-cover" src={this.userImage} alt="Profile" />
            </div>
          </button>
        </div>
        {this.renderAddPopup()}
        {this.renderSearchPopup()}
        {this.renderProfilePopup()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const popupLink = getPopupLink(state);

  return {
    username: state.user.username,
    userImage: state.user.image,
    searchString: state.display.searchString,
    isShown: popupLink === null,
    isAddPopupShown: state.display.isAddPopupShown,
    isSearchPopupShown: state.display.isSearchPopupShown,
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, addLink, updateSearchString,
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomBar);
