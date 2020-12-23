import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
} from '../actions';
import { BULK_EDIT_MOVE_TO_POPUP, ARCHIVE, TRASH, MOVE_TO } from '../types/const';
import { getListNameMap } from '../selectors';
import { getLastHalfHeight } from '../utils';
import { popupBgFMV, bModalFMV } from '../types/animConfigs';

class BottomBarBulkEditMoveToPopup extends React.PureComponent {

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
      return <button key={key} onClick={() => this.onBulkEditMoveToPopupClick(key)} className="py-4 pl-8 pr-4 block w-full text-gray-800 text-left truncate hover:bg-gray-400 focus:outline-none focus:shadow-outline">{listNameObj.displayName}</button>;
    });
  }

  render() {

    const { isBulkEditMoveToPopupShown } = this.props;
    if (!isBulkEditMoveToPopupShown) return (
      <AnimatePresence key="AnimatePresence_BBBEC_moveToPopup"></AnimatePresence>
    );

    const popupStyle = {
      maxHeight: getLastHalfHeight(384, 56, 16 + 1, 32 + 2),
    };

    return (
      <AnimatePresence key="AnimatePresence_BBBEC_moveToPopup">
        <motion.button key="BBBEC_cancelBtn" onClick={this.onBulkEditMoveToCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
        {/* For spring animation, need space in padding bottom so max height need to be adjusted too. */}
        <motion.div key="BBBEC_moveToPopup" style={popupStyle} className="pt-4 pb-12 fixed inset-x-0 -bottom-8 bg-white border border-gray-200 rounded-t-lg shadow-xl overflow-auto z-41" variants={bModalFMV} initial="hidden" animate="visible" exit="hidden">
          <div className="py-4 pl-4 pr-4 block w-full text-gray-800 text-left">Move to...</div>
          {this.renderMenu()}
        </motion.div>
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

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarBulkEditMoveToPopup);
