import React from 'react';
import { connect } from 'react-redux';
import Url from 'url-parse';

import { signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  ADD_POPUP,
  HTTP, HTTPS,
} from '../types/const';

class TopBar extends React.Component {

  state = {
    url: '',
    msg: '',
    isAskingConfirm: false,
  }

  validateUrl(url) {

    if (!url) {
      return [false, 'Please fill in a link you want to save in the textbox.', false];
    }

    if (!url.startsWith(HTTP) && !url.startsWith(HTTPS)) {
      url = HTTP + url;
    }

    const urlObj = new Url(url, {});
    if (!urlObj.hostname.match(/^([-a-zA-Z0-9@:%_\+~#=]{2,256}\.)+[a-z]{2,6}$/)) {
      return [false, 'Look like invalid link. Are you sure?', true];
    }

    return [true, '', null];
  }

  onAddBtnClick = () => {
    this.setState({
      url: '',
      msg: '',
      isAskingConfirm: false,
    });
    this.props.updatePopup(ADD_POPUP, true);
  }

  onAddInputChange = (e) => {
    this.setState({ url: e.target.value, msg: '', isAskingConfirm: false });
  }

  onAddOkBtnClick = () => {
    if (!this.state.isAskingConfirm) {
      const [isValid, msg, isAskingConfirm] = this.validateUrl(this.state.url);
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

  renderAddPopup() {

    const { isAskingConfirm } = this.state;

    return (
      <React.Fragment>
        <button onClick={this.onAddCancelBtnClick} tabIndex="-1" className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-10"></button>
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
          <input
            type="text"
            placeholder="http://"
            value={this.state.url}
            onChange={this.onAddInputChange} />
          <button onClick={this.onAddOkBtnClick}>{isAskingConfirm ? 'Sure' : 'Save'}</button>
          <button onClick={this.onAddCancelBtnClick}>Cancel</button>
          <p className="text-red-500">{this.state.msg}</p>
        </div>
      </React.Fragment >
    );
  }

  render() {

    const { searchString, isAddPopupShown, updateSearchString } = this.props;

    return (
      <React.Fragment>
        <button onClick={() => this.props.signOut()}>Sign out</button>
        <div className="relative p-3">
          <button onClick={this.onAddBtnClick} className={`relative px-2 py-2 bg-gray-900 rounded-lg shadow-sm hover:bg-gray-800 active:bg-black ${isAddPopupShown && 'z-20'}`}>
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
      </React.Fragment >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    searchString: state.display.searchString,
    isAddPopupShown: state.display.isAddPopupShown,
  };
};

export default connect(mapStateToProps, { signOut, updatePopup, addLink, updateSearchString })(TopBar);
