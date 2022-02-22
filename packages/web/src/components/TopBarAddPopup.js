import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";

import { updatePopup, addLink } from '../actions';
import { ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS } from '../types/const';
import { validateUrl, isEqual } from '../utils';
import { popupBgFMV, tlPopupFMV, trPopupFMV } from '../types/animConfigs';

class TopBarAddPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    this.didClick = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
    this.didClick = false;
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

  renderAddPopup() {

    const { isAddPopupShown, safeAreaWidth, safeAreaHeight } = this.props;
    if (!isAddPopupShown) return (
      <AnimatePresence key="AnimatePresence_TopBarAddPopup" />
    );

    const { url, msg, isAskingConfirm } = this.state;

    const style = safeAreaWidth < 832 ? { left: 0 } : { right: 0 };
    if (safeAreaHeight <= 360) style.top = -12;

    const popupFMV = safeAreaWidth < 832 ? tlPopupFMV : trPopupFMV;

    return (
      <AnimatePresence key="AnimatePresence_TopBarAddPopup">
        <motion.button key="TopBarAddPopup_cancelBtn" onClick={this.onAddCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        <motion.div key="TopBarAddPopup_addPopup" style={style} className="mt-2 px-4 pt-6 pb-5 absolute w-96 bg-white border border-gray-100 rounded-lg shadow-xl z-41" variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className="flex">
            <span className="inline-flex items-center bg-white text-sm text-gray-600">Url:</span>
            <div className="ml-3 flex-1">
              <input onChange={this.onAddInputChange} onKeyPress={this.onAddInputKeyPress} className="px-3.5 py-1 w-full bg-white text-base text-gray-700 rounded-full border border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 focus:border-gray-400" type="url" placeholder="https://" value={url} autoCapitalize="none" autoFocus />
            </div>
          </div>
          {msg !== '' && <p className="pt-3 text-sm text-red-500">{msg}</p>}
          <div className={`${msg !== '' ? 'pt-3' : 'pt-5'}`}>
            <button onClick={this.onAddOkBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className="px-4 bg-gray-800 text-sm text-gray-50 font-medium rounded-full hover:bg-gray-900 focus:outline-none focus:ring">{isAskingConfirm ? 'Sure' : 'Save'}</button>
            <button onClick={this.onAddCancelBtnClick} className="ml-2 px-2.5 py-1.5 text-sm text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset">Cancel</button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  render() {
    return (
      <div className="relative">
        {/* If want to show the button along with the popup, add relative and z-41 */}
        <button onClick={this.onAddBtnClick} style={{ height: '2rem', paddingLeft: '0.625rem', paddingRight: '0.75rem' }} className="flex justify-center items-center bg-white border border-gray-400 rounded-full group hover:border-gray-500 focus:outline-none focus:ring">
          <svg className="w-3 text-gray-500 group-hover:text-gray-600" viewBox="0 0 16 14" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-1 text-sm text-gray-500 group-hover:text-gray-600">Add</span>
        </button>
        {this.renderAddPopup()}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
    safeAreaWidth: state.window.width,
    safeAreaHeight: state.window.height,
  };
};

const mapDispatchToProps = { updatePopup, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(TopBarAddPopup);
