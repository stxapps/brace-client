import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import { updatePopup, addLink } from '../actions';
import {
  ADD_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
} from '../types/const';
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

    this.props.addLink(this.state.url, null);
    this.props.updatePopup(ADD_POPUP, false);
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  renderAddPopup() {

    const { isAddPopupShown } = this.props;
    if (!isAddPopupShown) return (
      <AnimatePresence key="AnimatePresence_TopBarAddPopup"></AnimatePresence>
    );

    const { url, msg, isAskingConfirm } = this.state;

    const style = window.innerWidth < 832 ? { left: 0 } : { right: 0 };
    const popupFMV = window.innerWidth < 832 ? tlPopupFMV : trPopupFMV;

    return (
      <AnimatePresence key="AnimatePresence_TopBarAddPopup">
        <motion.button key="TopBarAddPopup_cancelBtn" onClick={this.onAddCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
        <motion.div key="TopBarAddPopup_addPopup" style={style} className="mt-2 px-4 pt-6 pb-6 absolute w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-41" variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className="flex">
            <span className="inline-flex items-center bg-white text-sm font-medium text-gray-700">Url:</span>
            <div className="ml-3 flex-1">
              <input onChange={this.onAddInputChange} onKeyPress={this.onAddInputKeyPress} className="px-4 py-2 form-input w-full bg-white text-base text-gray-900 rounded-full border border-gray-500 appearance-none focus:outline-none focus:shadow-outline" type="url" placeholder="https://" value={url} autoFocus />
            </div>
          </div>
          <p className="pt-3 text-red-500">{msg}</p>
          <div className="pt-3">
            <button onClick={this.onAddOkBtnClick} className="px-5 py-2 bg-gray-800 text-base text-white font-medium rounded-full shadow-sm hover:shadow-outline active:bg-gray-600 focus:outline-none focus:shadow-outline">{isAskingConfirm ? 'Sure' : 'Save'}</button>
            <button onClick={this.onAddCancelBtnClick} className="ml-4 text-gray-700 rounded-sm hover:text-gray-900 hover:underline focus:outline-none focus:shadow-outline">Cancel</button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  render() {
    return (
      <div className="relative">
        {/* If want to show the button along with the popup, add relative and z-41 */}
        <button onClick={this.onAddBtnClick} style={{ height: '2rem', paddingLeft: '0.625rem', paddingRight: '0.75rem' }} className="flex justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm group hover:border-gray-900 hover:shadow-outline active:bg-gray-200 focus:outline-none focus:shadow-outline">
          <svg className="w-3 text-gray-700 group-hover:text-gray-900" viewBox="0 0 16 14" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-1 text-base text-gray-700 group-hover:text-gray-900">Add</span>
        </button>
        {this.renderAddPopup()}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
  };
};

const mapDispatchToProps = { updatePopup, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(TopBarAddPopup);
