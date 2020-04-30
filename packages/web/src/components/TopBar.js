import React from 'react';
import { connect } from 'react-redux';

import { addLink, searchLinks, signOut, updatePopup } from '../actions';
import { ADD_POPUP } from '../types/const';

class TopBar extends React.Component {

  state = {
    url: '',
    msg: '',
  }

  validateUrl(url) {
    if (!url) {
      return [false, 'Please fill in a link you want to save in the textbox.'];
    }

    return [true, ''];
  }

  onAddBtnClick = () => {
    this.setState({
      url: '',
      msg: '',
    });
    this.props.updatePopup(ADD_POPUP, true);
  };

  onAddOkBtnClick = () => {
    const [isValid, msg] = this.validateUrl(this.state.url);
    if (!isValid) {
      this.setState({ msg: msg });
      return;
    }

    this.props.addLink(this.state.url);
    this.props.updatePopup(ADD_POPUP, false);
  };

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  };

  renderAddPopup() {
    return (
      <React.Fragment>
        <button onClick={this.onAddCancelBtnClick} tabIndex="-1" className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-10"></button>
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
          <input
            type="text"
            placeholder="http://"
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })} />
          <button onClick={this.onAddOkBtnClick}>Save</button>
          <button onClick={this.onAddCancelBtnClick}>Cancel</button>
          <p className="text-red-500">{this.state.msg}</p>
        </div>
      </React.Fragment >
    );
  }

  render() {

    const { isAddPopupShown } = this.props;

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
      </React.Fragment >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
  };
};

export default connect(mapStateToProps, { addLink, searchLinks, signOut, updatePopup })(TopBar);
