import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';

import { updatePopup } from '../actions';
import { updateLinkEditor, addLink } from '../actions/chunk';
import { ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS } from '../types/const';
import {
  getSafeAreaWidth, getSafeAreaHeight, getSafeAreaInsets, getThemeMode,
} from '../selectors';
import { isObject, isEqual, validateUrl, getRect } from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';

import { getTopBarSizes, withTailwind } from '.';

class TopBarAddPopup extends React.PureComponent<any, any> {

  menuPopup: any;
  didClick: boolean;

  constructor(props) {
    super(props);

    this.state = { menuPopupSize: null };
    this.menuPopup = React.createRef();
    this.didClick = false;
  }

  componentDidMount() {
    this.updateState(this.props.isShown);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isShown && this.props.isShown) {
      this.updateState(true);
      this.didClick = false;
    }

    if (prevProps.isShown && !this.props.isShown) {
      this.updateState(false);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isShown && nextProps.isShown) {
      this.setState({ menuPopupSize: null });
    }
  }

  componentWillUnmount() {
    this.updateState(false);
  }

  updateState(isShown) {
    if (isShown) {
      if (this.menuPopup.current) {
        const menuPopupSize = this.menuPopup.current.getBoundingClientRect();
        if (!isEqual(menuPopupSize, this.state.menuPopupSize)) {
          this.setState({ menuPopupSize });
        }
      }
    }
  }

  onAddInputChange = (e) => {
    this.props.updateLinkEditor(
      { url: e.target.value, msg: '', isAskingConfirm: false }
    );
  };

  onAddInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.onAddOkBtnClick();
      if (window.document.activeElement instanceof HTMLInputElement) {
        window.document.activeElement.blur();
      }
    }
  };

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
  };

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  };

  renderContent() {
    const { tailwind } = this.props;
    const { url, msg, isAskingConfirm } = this.props;

    return (
      <>
        <div className={tailwind('flex')}>
          <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>Url:</span>
          <div className={tailwind('ml-3 flex-1')}>
            <input onChange={this.onAddInputChange} onKeyDown={this.onAddInputKeyPress} className={tailwind('w-full rounded-full border border-gray-400 bg-white px-3.5 py-1 text-base text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 blk:placeholder:text-gray-400 blk:focus:border-transparent')} type="url" placeholder="https://" value={url} autoCapitalize="none" autoFocus />
          </div>
        </div>
        {msg !== '' && <p className={tailwind('pt-3 text-sm text-red-500')}>{msg}</p>}
        <div className={tailwind(`${msg !== '' ? 'pt-3' : 'pt-5'}`)}>
          <button onClick={this.onAddOkBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className={tailwind('rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:text-gray-800 blk:hover:bg-white')}>{isAskingConfirm ? 'Sure' : 'Save'}</button>
          <button onClick={this.onAddCancelBtnClick} className={tailwind('ml-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')}>Cancel</button>
        </div>
      </>
    );
  }

  render() {
    const {
      isShown, anchorPosition, safeAreaWidth, safeAreaHeight, insets, tailwind,
    } = this.props;
    if (!isShown) return (
      <AnimatePresence key="AnimatePresence_TopBarAddPopup" />
    );

    const { menuPopupSize } = this.state;

    const popupClassNames = 'fixed z-41 w-96 overflow-auto rounded-lg bg-white px-4 pt-6 pb-5 shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';

    let menuPopup;
    if (menuPopupSize) {
      const maxHeight = safeAreaHeight - 16;
      const posStyle = computePositionStyle(
        anchorPosition,
        {
          width: menuPopupSize.width,
          height: Math.min(menuPopupSize.height, maxHeight),
        },
        { width: safeAreaWidth, height: safeAreaHeight },
        null,
        insets,
        8,
      );
      const popupStyle = { ...posStyle, maxHeight };

      menuPopup = (
        <motion.div key="TopBarAddPopup_addPopup" ref={this.menuPopup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          {this.renderContent()}
        </motion.div>
      );
    } else {
      menuPopup = (
        <div key="TopBarAddPopup_addPopup" ref={this.menuPopup} style={{ top: safeAreaHeight + 256, left: safeAreaWidth + 256 }} className={tailwind(popupClassNames)}>
          {this.renderContent()}
        </div>
      );
    }

    return (
      <AnimatePresence key="AnimatePresence_TopBarAddPopup">
        <motion.button key="TopBarAddPopup_cancelBtn" onClick={this.onAddCancelBtnClick} tabIndex={-1} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        {menuPopup}
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {
  const isShown = state.display.isAddPopupShown;
  const safeAreaWidth = getSafeAreaWidth(state);
  const insets = getSafeAreaInsets(state);

  let derivedAnchorPosition = state.display.addPopupPosition;
  if (isShown && !isObject(derivedAnchorPosition)) {
    const { headerPaddingX, commandsWidth } = getTopBarSizes(safeAreaWidth);

    const x = insets.left + safeAreaWidth - commandsWidth - (headerPaddingX / 2);
    const y = insets.top + 12 + 42;
    derivedAnchorPosition = getRect(x, y, 66, 32);
  }

  return {
    isShown,
    anchorPosition: derivedAnchorPosition,
    url: state.linkEditor.url,
    msg: state.linkEditor.msg,
    isAskingConfirm: state.linkEditor.isAskingConfirm,
    themeMode: getThemeMode(state),
    safeAreaWidth,
    safeAreaHeight: getSafeAreaHeight(state),
    insets,
  };
};

const mapDispatchToProps = { updatePopup, updateLinkEditor, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBarAddPopup));
