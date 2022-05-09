import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";

import { updatePopup, updateLinkEditor, addLink } from '../actions';
import { ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS } from '../types/const';
import { validateUrl } from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

class TopBarAddPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
    this.didClick = false;
  }

  onAddInputChange = (e) => {
    this.props.updateLinkEditor(
      { url: e.target.value, msg: '', isAskingConfirm: false }
    );
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

    if (!this.props.isAskingConfirm) {
      const urlValidatedResult = validateUrl(this.props.url);
      if (urlValidatedResult === NO_URL) {
        this.props.updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false }
        );
        return;
      }
      if (urlValidatedResult === ASK_CONFIRM_URL) {
        this.props.updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: true }
        );
        return;
      }
    }

    this.props.addLink(this.props.url, null, null);
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

    const { url, msg, isAskingConfirm } = this.props;

    let style;
    if (safeAreaWidth < 832) {
      style = { top: 'auto', left: 0, transformOrigin: 'top left' };
    } else {
      style = { top: 'auto', right: 0, transformOrigin: 'top right' };
    }

    if (safeAreaHeight <= 360) style.top = '-12px';

    return (
      <AnimatePresence key="AnimatePresence_TopBarAddPopup">
        <motion.button key="TopBarAddPopup_cancelBtn" onClick={this.onAddCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black bg-opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
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
    url: state.linkEditor.url,
    msg: state.linkEditor.msg,
    isAskingConfirm: state.linkEditor.isAskingConfirm,
    safeAreaWidth: state.window.width,
    safeAreaHeight: state.window.height,
  };
};

const mapDispatchToProps = { updatePopup, updateLinkEditor, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(TopBarAddPopup);
