import React from 'react';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';
import jdenticon from 'jdenticon';

import { signIn, signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  ADD_POPUP, PROFILE_POPUP, SETTINGS_POPUP,
  SHOW_BLANK, SHOW_SIGN_IN, SHOW_COMMANDS,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
  TOP_HEADER_HEIGHT, TOP_LIST_NAME_HEIGHT,
  TOP_HEADER_LIST_NAME_SPACE, TOP_HEADER_LIST_NAME_SPACE_MD,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD,
  MD_WIDTH,
} from '../types/const';
import { validateUrl, isEqual, toPx, throttle } from '../utils';

import ListName from './ListName';
import StatusPopup from './StatusPopup';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

const DISTANCE_X = toPx('3rem');
const DISTANCE_X_MD = toPx('9rem');

const START_Y = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE);
const START_Y_MD = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE_MD);

const END_Y = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
const END_Y_MD = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2) + 6;

const DISTANCE_Y = Math.abs(END_Y - START_Y);
const DISTANCE_Y_MD = Math.abs(END_Y_MD - START_Y_MD);

class TopBar extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState, offsetY: window.pageYOffset };

    this.userImage = props.userImage;
    this.profileBtnStyleClasses = 'rounded-full';
    if (this.userImage === null) {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      this.profileBtnStyleClasses = 'rounded-lg';
    }

    this.updateScrollY = throttle(this.updateScrollY, 16);
  }

  componentDidMount() {
    if (this.props.isListNameShown) {
      window.addEventListener('scroll', this.updateScrollY);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateScrollY);
  }

  updateScrollY = () => {
    const distanceY = window.innerWidth < MD_WIDTH ? DISTANCE_Y : DISTANCE_Y_MD;
    if (window.pageYOffset >= distanceY && this.state.offsetY >= distanceY) return;
    this.setState({ offsetY: Math.min(window.pageYOffset, distanceY) });
  }

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;
    this.props.updatePopup(ADD_POPUP, true);
  }

  onAddInputChange = (e) => {
    this.setState({ url: e.target.value, msg: '', isAskingConfirm: false });
  }

  onAddInputKeyPress = (e) => {
    if (e.key === 'Enter') this.onAddOkBtnClick();
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

  onSearchInputChange = (e) => {
    this.props.updateSearchString(e.target.value);
  }

  onSearchClearBtnClick = () => {
    this.props.updateSearchString('');
  }

  onProfileBtnClick = () => {
    if (this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.updatePopup(SETTINGS_POPUP, true);
  }

  onSignOutBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  }

  renderAddPopup() {

    const { url, msg, isAskingConfirm } = this.state;

    return (
      <React.Fragment>
        <button onClick={this.onAddCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none"></button>
        <div className="mt-2 px-4 pt-6 pb-6 absolute right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-41 md:w-96">
          <input onChange={this.onAddInputChange} onKeyPress={this.onAddInputKeyPress} className="px-4 py-2 w-full bg-white text-gray-900 border border-gray-600 rounded-full appearance-none focus:outline-none focus:shadow-outline" type="url" placeholder="https://" value={url} autoFocus />
          <p className="pt-3 text-red-600">{msg}</p>
          <div className="pt-3">
            <button onClick={this.onAddOkBtnClick} className="px-5 py-2 bg-gray-900 text-base text-white font-medium rounded-full shadow-sm hover:bg-gray-800 active:bg-black focus:outline-none focus:shadow-outline">{isAskingConfirm ? 'Sure' : 'Save'}</button>
            <button onClick={this.onAddCancelBtnClick} className="ml-2 underline rounded-sm focus:outline-none focus:shadow-outline">Cancel</button>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderProfilePopup() {
    return (
      <React.Fragment>
        <button onClick={this.onProfileCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none"></button>
        <div className="mt-2 py-2 absolute right-0 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-41">
          <button onClick={this.onSettingsBtnClick} className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Settings</button>
          <a className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline" href="/#support">Support</a>
          <button onClick={this.onSignOutBtnClick} className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline">Sign out</button>
        </div>
      </React.Fragment>
    );
  }

  renderCommands() {

    const { isAddPopupShown, isProfilePopupShown } = this.props;
    const { searchString } = this.props;

    const searchClearBtnClasses = searchString.length === 0 ? 'hidden' : '';

    return (
      <div className="flex justify-end items-center">
        <div className="relative">
          <button onClick={this.onAddBtnClick} className={`w-8 h-8 ${isAddPopupShown ? 'z-41' : ''} focus:outline-none-outer`}>
            <div className="flex items-center w-8 h-7 bg-gray-900 rounded-lg shadow-sm hover:bg-gray-800 active:bg-black focus:shadow-outline-inner">
              <svg className="mx-auto w-4 text-white" viewBox="0 0 16 14" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
          {isAddPopupShown && this.renderAddPopup()}
        </div>
        <div className="relative ml-4 w-48 lg:w-56">
          <div className="pl-3 absolute inset-y-0 left-0 flex items-center">
            <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            </svg>
          </div>
          <input onChange={this.onSearchInputChange} className="py-1 pl-10 pr-6 block w-full bg-gray-200 text-gray-900 border border-transparent rounded-full appearance-none focus:outline-none focus:shadow-outline focus:bg-white focus:border-gray-300" type="search" placeholder="Search" value={searchString} />
          <button onClick={this.onSearchClearBtnClick} className={`pr-2 ${searchClearBtnClasses} absolute inset-y-0 right-0 flex items-center focus:outline-none-outer`}>
            <svg className="h-5 text-gray-600 cursor-pointer rounded-full focus:shadow-outline-inner" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </svg>
          </button>
        </div>
        <div className="relative ml-4">
          <button onClick={this.onProfileBtnClick} className={`relative block h-8 w-8 overflow-hidden border-2 border-gray-200 ${isProfilePopupShown ? 'z-41' : ''} focus:outline-none focus:shadow-outline ${this.profileBtnStyleClasses}`}>
            <GracefulImage className="h-full w-full bg-white object-cover" src={this.userImage} alt="Profile" />
          </button>
          {isProfilePopupShown && this.renderProfilePopup()}
        </div>
      </div>
    );
  }

  renderSignInBtn() {

    return (
      <button onClick={() => this.props.signIn()} className="block h-14 focus:outline-none-outer">
        <span className="px-3 py-1 bg-white text-base text-gray-700 border border-gray-700 rounded-full shadow-sm hover:bg-gray-800 hover:text-white active:bg-gray-900 focus:shadow-outline-inner">Sign in</span>
      </button>
    );
  }

  renderListName() {

    const { offsetY } = this.state;

    let top, left;
    if (window.innerWidth < MD_WIDTH) {
      top = START_Y + (offsetY * (END_Y - START_Y) / DISTANCE_Y);
      left = offsetY * DISTANCE_X / DISTANCE_Y;
    } else {
      top = START_Y_MD + (offsetY * (END_Y_MD - START_Y_MD) / DISTANCE_Y_MD);
      left = offsetY * DISTANCE_X_MD / DISTANCE_Y_MD;
    }

    const listNameStyle = { position: 'absolute', top, left };

    return (
      <React.Fragment>
        {/** @ts-ignore */}
        < div style={listNameStyle} >
          <ListName fetched={this.props.fetched} />
        </div >
        <StatusPopup offsetY={offsetY} />
      </React.Fragment>
    );
  }

  render() {

    const rightPaneProp = this.props.rightPane;

    let rightPane;
    if (rightPaneProp === SHOW_BLANK) rightPane = null;
    else if (rightPaneProp === SHOW_SIGN_IN) rightPane = this.renderSignInBtn();
    else if (rightPaneProp === SHOW_COMMANDS) rightPane = this.renderCommands();
    else throw new Error(`Invalid rightPane: ${rightPaneProp}`);

    const { isListNameShown } = this.props;

    let headerStyle, headerStyleClasses;
    if (isListNameShown) {

      const { offsetY } = this.state;

      let height;
      if (window.innerWidth < MD_WIDTH) {
        height = toPx(TOP_BAR_HEIGHT) + (offsetY * (toPx(TOP_HEADER_HEIGHT) - toPx(TOP_BAR_HEIGHT)) / DISTANCE_Y);
      } else {
        height = toPx(TOP_BAR_HEIGHT_MD) + (offsetY * (toPx(TOP_HEADER_HEIGHT) - toPx(TOP_BAR_HEIGHT_MD)) / DISTANCE_Y_MD);
      }

      headerStyle = { height };
      headerStyleClasses = 'fixed inset-x-0 top-0 bg-white z-30';
      if (height === toPx(TOP_HEADER_HEIGHT)) {
        headerStyleClasses += ' border-b border-gray-300';
      }
    } else {
      headerStyle = { height: toPx(TOP_HEADER_HEIGHT) };
      headerStyleClasses = '';
    }

    return (
      <header style={headerStyle} className={`mx-auto px-4 max-w-6xl md:px-6 lg:px-8 ${headerStyleClasses}`}>
        <div className="relative">
          <div className="flex justify-between items-center h-14">
            <div className="relative">
              <img className="h-8 md:hidden" src={shortLogo} alt="Brace logo" />
              <img className="hidden h-6 md:block" src={fullLogo} alt="Brace logo" />
            </div>
            {rightPane}
          </div>
          {isListNameShown ? this.renderListName() : null}
        </div>
      </header>
    );
  }
}

TopBar.defaultProps = {
  isListNameShown: false,
};

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
  signIn, signOut, updatePopup, addLink, updateSearchString,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
