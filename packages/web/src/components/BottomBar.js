import React from 'react';
import { connect } from 'react-redux';

import { signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  PC_100
} from '../types/const';
import { subtractPixel, validateUrl } from '../utils';

const HEIGHT = '80px';
const ADD_POPUP_HEIGHT = '80px';
const SEARCH_POPUP_HEIGHT = '40px';
const PROFILE_POPUP_HEIGHT = '80px';

class BottomBar extends React.Component {

  initialState = {
    didAnimationEnd: true,
    url: '',
    msg: '',
    isAskingConfirm: false,
  };

  state = { ...this.initialState };

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;

    this.props.updatePopup(ADD_POPUP, true);
    this.setState({ ...this.initialState, didAnimationEnd: false });
  }

  onAddPopupAnimationEnd = () => {
    this.setState({ didAnimationEnd: true });
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

    this.setState({ didAnimationEnd: false });
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
    this.setState({ didAnimationEnd: false });
  }

  onSearchBtnClick = () => {
    if (this.props.isSearchPopupShown) return;
    this.props.updatePopup(SEARCH_POPUP, true);
  }

  onSearchCancelBtnClick = () => {
    if (this.props.searchString !== '') {
      this.props.updateSearchString('');
      return;
    }

    this.props.updatePopup(SEARCH_POPUP, false);
  }

  onProfileBtnClick = () => {
    if (this.props.isProfilePopupShown) return;

    this.props.updatePopup(PROFILE_POPUP, true);
    this.setState({ didAnimationEnd: false });
  }

  onProfilePopupAnimationEnd = () => {
    this.setState({ didAnimationEnd: true });
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.setState({ didAnimationEnd: false });
  }

  onSignOutBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()

    this.setState({ didAnimationEnd: false });
  }

  renderAddPopup() {

    const { isAddPopupShown } = this.props;
    const { didAnimationEnd, url, msg, isAskingConfirm } = this.state;

    const cancelBtn = isAddPopupShown && didAnimationEnd ? <button onClick={this.onAddCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-40"></button> : null;

    const style = {}
    style.height = ADD_POPUP_HEIGHT;
    style.bottom = isAddPopupShown ? HEIGHT : '0px';
    style.zIndex = isAddPopupShown && didAnimationEnd ? 41 : 20;
    style.transitionProperty = 'bottom';

    return (
      <React.Fragment>
        {cancelBtn}
        <div onTransitionEnd={this.onAddPopupAnimationEnd} style={style} className="fixed inset-x-0 p-2 bg-white border border-gray-200 rounded-lg shadow-xl duration-300 ease-in-out">
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

  renderSearchPopup() {
    const { isSearchPopupShown, searchString, updateSearchString } = this.props;

    const style = {}
    style.height = SEARCH_POPUP_HEIGHT;
    style.bottom = isSearchPopupShown ? HEIGHT : subtractPixel(HEIGHT, SEARCH_POPUP_HEIGHT);
    style.transitionProperty = 'bottom';

    return (
      <div style={style} className="fixed inset-x-0 bg-white border-t-2 border-gray-900 duration-150 ease-in-out z-10">
        <input
          type="text"
          placeholder="Search"
          value={searchString}
          onChange={e => updateSearchString(e.target.value)} />
        <button onClick={this.onSearchCancelBtnClick}>Cancel</button>
      </div>
    );
  }

  renderProfilePopup() {

    const { isProfilePopupShown } = this.props;
    const { didAnimationEnd } = this.state;

    const cancelBtn = isProfilePopupShown && didAnimationEnd ? <button onClick={this.onProfileCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-40"></button> : null;

    const style = {}
    style.height = PROFILE_POPUP_HEIGHT;
    style.bottom = isProfilePopupShown ? HEIGHT : '0px';
    style.zIndex = isProfilePopupShown && didAnimationEnd ? 41 : 20;
    style.transitionProperty = 'bottom';

    return (
      <React.Fragment>
        {cancelBtn}
        <div onTransitionEnd={this.onProfilePopupAnimationEnd} style={style} className="fixed inset-x-0 p-2 bg-white border border-gray-200 rounded-lg shadow-xl duration-300 ease-in-out">
          <button onClick={this.onSignOutBtnClick}>Sign out</button>
        </div>
      </React.Fragment >
    );
  }

  render() {

    const isShown = this.props.columnWidth === PC_100;
    if (!isShown) {
      return null;
    }

    const style = { height: HEIGHT };

    return (
      <React.Fragment>
        <div style={style} className="fixed inset-x-0 bottom-0 bg-white border-t-2 border-gray-900 z-30">
          <div className="flex justify-evenly content-between w-full h-full">
            <button onClick={this.onAddBtnClick} className="w-full h-full border-r-2 border-gray-900">Add</button>
            <button onClick={this.onSearchBtnClick} className="w-full h-full border-r-2 border-gray-900">Search</button>
            <button onClick={this.onProfileBtnClick} className="w-full h-full">Profile</button>
          </div>
        </div>
        {this.renderAddPopup()}
        {this.renderSearchPopup()}
        {this.renderProfilePopup()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    searchString: state.display.searchString,
    isAddPopupShown: state.display.isAddPopupShown,
    isSearchPopupShown: state.display.isSearchPopupShown,
    isProfilePopupShown: state.display.isProfilePopupShown,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, addLink, updateSearchString,
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomBar);
