import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
} from '../actions';
import { BULK_EDIT_MOVE_TO_POPUP, ARCHIVE, TRASH, MOVE_TO } from '../types/const';
import { getListNameMap } from '../selectors';
import { isEqual, getLastHalfHeight } from '../utils';
import { popupBgFMV, tlPopupFMV, tcPopupFMV } from '../types/animConfigs';

class TopBarBulkEditMoveToPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { menuPopupSize: null };
    this.menuPopup = React.createRef();
  }

  componentDidMount() {
    this.updateState(this.props.isBulkEditMoveToPopupShown);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isBulkEditMoveToPopupShown && this.props.isBulkEditMoveToPopupShown) {
      this.updateState(true);
    }

    if (prevProps.isBulkEditMoveToPopupShown && !this.props.isBulkEditMoveToPopupShown) {
      this.updateState(false);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isBulkEditMoveToPopupShown && nextProps.isBulkEditMoveToPopupShown) {
      this.setState({ menuPopupSize: null });
    }
  }

  componentWillUnmount() {
    this.updateState(false);
  }

  updateState(isShown) {
    if (isShown) {
      const menuPopupSize = this.menuPopup.current.getBoundingClientRect();
      if (!isEqual(menuPopupSize, this.state.menuPopupSize)) {
        this.setState({ menuPopupSize });
      }
    }
  }

  onBulkEditMoveToPopupClick = (text) => {
    // As animation takes time, increase chance to several clicks
    if (!this.props.isBulkEditMoveToPopupShown) return;
    if (!text) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    if (text.startsWith(MOVE_TO)) {
      moveLinks(text.substring(MOVE_TO.length + 1), selectedLinkIds);
      clearSelectedLinkIds();
      updateBulkEdit(false);
    } else {
      throw new Error(`Invalid text: ${text}`);
    }

    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  onBulkEditMoveToCancelBtnClick = () => {
    // As animation takes time, increase chance to several clicks
    if (!this.props.isBulkEditMoveToPopupShown) return;
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
  }

  renderMenu() {

    const moveTo = [];
    for (const listNameObj of this.props.listNameMap) {
      if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
      if (this.props.listName === listNameObj.listName) continue;

      moveTo.push(listNameObj);
    }

    return moveTo.map(listNameObj => {
      const key = MOVE_TO + ' ' + listNameObj.listName;
      return <button key={key} onClick={() => this.onBulkEditMoveToPopupClick(key)} className="py-2 pl-4 pr-4 block w-full text-gray-800 text-left truncate hover:bg-gray-400 focus:outline-none focus:shadow-outline">{listNameObj.displayName}</button>;
    });
  }

  render() {

    const { isBulkEditMoveToPopupShown } = this.props;
    if (!isBulkEditMoveToPopupShown) return (
      <AnimatePresence key="AnimatePresence_TBBEC_moveToPopup"></AnimatePresence>
    );

    const { menuPopupSize } = this.state;
    const menuPopupClassNames = 'mt-2 py-2 absolute min-w-28 max-w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-auto z-41';

    let menuPopup;
    if (menuPopupSize) {

      const popupStyle = {
        maxHeight: getLastHalfHeight(
          Math.min(256, window.innerHeight - menuPopupSize.top - 8), 40, 8 + 1, 2
        ),
      };

      let popupFMV;
      if (menuPopupSize.width <= 132) {
        popupStyle.left = '29%';
        popupFMV = tlPopupFMV;
      } else if (menuPopupSize.width <= 166) {
        popupStyle.left = 0;
        popupFMV = tlPopupFMV;
      } else {
        popupStyle.right = -44;
        popupFMV = tcPopupFMV;
      }

      menuPopup = (
        <motion.div key="TBBEC_moveToPopup" ref={this.menuPopup} style={popupStyle} className={menuPopupClassNames} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          {this.renderMenu()}
        </motion.div>
      );
    } else {
      menuPopup = (
        <div key="TBBEC_moveToPopup" ref={this.menuPopup} className={menuPopupClassNames}>
          {this.renderMenu()}
        </div>
      );
    }

    return (
      <AnimatePresence key="AnimatePresence_TBBEC_moveToPopup">
        <motion.button key="TBBEC_cancelBtn" onClick={this.onBulkEditMoveToCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
        {menuPopup}
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    isBulkEditMoveToPopupShown: state.display.isBulkEditMoveToPopupShown,
    selectedLinkIds: state.display.selectedLinkIds,
  };
};

const mapDispatchToProps = {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBarBulkEditMoveToPopup);
