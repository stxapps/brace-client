import React from 'react';
import { connect } from 'react-redux';

import { updatePopup, addLink } from '../actions';
import {
  ADD_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
} from '../types/const';
import { validateUrl, isEqual } from '../utils';

class BottomBarAddPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    this.addInput = React.createRef();
    this.didClick = false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isAddPopupShown && this.props.isAddPopupShown) {
      this.addInput.current.focus();
      this.didClick = false;
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
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
    if (this.didClick) return;

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

    this.props.addLink(this.state.url, null, null);
    this.props.updatePopup(ADD_POPUP, false);
    this.didClick = true;
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  render() {

    const { isAddPopupShown } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    return (
      <React.Fragment>
        <button onClick={this.onAddCancelBtnClick} tabIndex={-1} className={`${!isAddPopupShown ? 'hidden' : ''} fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none`} />
        <div className={`px-4 pt-6 pb-6 fixed inset-x-0 bottom-0 bg-white border border-gray-100 rounded-t-lg shadow-xl transform ${!isAddPopupShown ? 'translate-y-full' : ''} z-41`}>
          <div className="flex">
            <span className="inline-flex items-center bg-white text-sm text-gray-600">Url:</span>
            <div className="ml-3 flex-1">
              <input ref={this.addInput} onChange={this.onAddInputChange} onKeyPress={this.onAddInputKeyPress} className="px-3.5 py-1 w-full bg-white text-base text-gray-700 rounded-full border border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 focus:border-gray-400" type="url" placeholder="https://" value={url} autoCapitalize="none" />
            </div>
          </div>
          {msg !== '' && <p className="pt-3 text-sm text-red-500">{msg}</p>}
          <div className={`${msg !== '' ? 'pt-3' : 'pt-5'}`}>
            <button onClick={this.onAddOkBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className="px-4 bg-gray-800 text-sm text-gray-50 font-medium rounded-full hover:bg-gray-900 focus:outline-none focus:ring">{isAskingConfirm ? 'Sure' : 'Save'}</button>
            <button onClick={this.onAddCancelBtnClick} className="ml-2 px-2.5 py-1.5 text-sm text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset">Cancel</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
  };
};

const mapDispatchToProps = { updatePopup, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarAddPopup);
