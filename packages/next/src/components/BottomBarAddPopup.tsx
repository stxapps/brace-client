import React from 'react';
import { connect } from 'react-redux';

import { updatePopup } from '../actions';
import { updateLinkEditor, addLink } from '../actions/chunk';
import { ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS } from '../types/const';
import { getSafeAreaWidth, getSafeAreaInsets, getThemeMode } from '../selectors';
import { validateUrl } from '../utils';

import { withTailwind } from '.';

class BottomBarAddPopup extends React.PureComponent<any, any> {

  addInput: any;
  didClick: boolean;

  constructor(props) {
    super(props);

    this.addInput = React.createRef();
    this.didClick = false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isAddPopupShown && this.props.isAddPopupShown) {
      this.addInput.current.focus();
      this.didClick = false;
    }
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

    const url = this.props.url.trim();
    if (!this.props.isAskingConfirm) {
      const urlValidatedResult = validateUrl(url);
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

    this.props.addLink(url, null, null);
    this.props.updatePopup(ADD_POPUP, false);
    this.didClick = true;
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  render() {

    const { isAddPopupShown, url, msg, isAskingConfirm, insets, tailwind } = this.props;
    const popupStyle = {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right,
    };

    return (
      <React.Fragment>
        <button onClick={this.onAddCancelBtnClick} tabIndex={-1} className={tailwind(`fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none ${!isAddPopupShown ? 'hidden' : ''}`)} />
        <div style={popupStyle} className={tailwind(`fixed inset-x-0 bottom-0 z-41 transform rounded-t-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25 ${!isAddPopupShown ? 'translate-y-full' : ''}`)}>
          <div className={tailwind('px-4 pt-6 pb-6')}>
            <div className={tailwind('flex')}>
              <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>Url:</span>
              <div className={tailwind('ml-3 flex-1')}>
                <input ref={this.addInput} onChange={this.onAddInputChange} onKeyDown={this.onAddInputKeyPress} className={tailwind('w-full rounded-full border border-gray-400 bg-white px-3.5 py-1 text-base text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 blk:placeholder:text-gray-400 blk:focus:border-transparent')} type="url" placeholder="https://" value={url} autoCapitalize="none" />
              </div>
            </div>
            {msg !== '' && <p className={tailwind('pt-3 text-sm text-red-500')}>{msg}</p>}
            <div className={tailwind(`${msg !== '' ? 'pt-3' : 'pt-5'}`)}>
              <button onClick={this.onAddOkBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className={tailwind('rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:text-gray-800 blk:hover:bg-white')}>{isAskingConfirm ? 'Sure' : 'Save'}</button>
              <button onClick={this.onAddCancelBtnClick} className={tailwind('ml-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')}>Cancel</button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
    url: state.linkEditor.url,
    msg: state.linkEditor.msg,
    isAskingConfirm: state.linkEditor.isAskingConfirm,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
    insets: getSafeAreaInsets(state),
  };
};

const mapDispatchToProps = { updatePopup, updateLinkEditor, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarAddPopup));
