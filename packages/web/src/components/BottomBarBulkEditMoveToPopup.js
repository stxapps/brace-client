import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";

import { updatePopup, updateBulkEdit, moveLinks } from '../actions';
import { BULK_EDIT_MOVE_TO_POPUP, ARCHIVE, TRASH, MOVE_TO } from '../types/const';
import { getListNameMap } from '../selectors';
import { getLastHalfHeight } from '../utils';
import { popupBgFMV, bModalFMV } from '../types/animConfigs';

class BottomBarBulkEditMoveToPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isBulkEditMoveToPopupShown && this.props.isBulkEditMoveToPopupShown) {
      this.didClick = false;
    }
  }

  onBulkEditMoveToPopupClick = (text) => {
    if (!text || this.didClick) return;

    const { selectedLinkIds } = this.props;

    if (text.startsWith(MOVE_TO)) {
      this.props.moveLinks(text.substring(MOVE_TO.length + 1), selectedLinkIds);
      this.props.updateBulkEdit(false);
    } else {
      throw new Error(`Invalid text: ${text}`);
    }

    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, false);
    this.didClick = true;
  }

  onBulkEditMoveToCancelBtnClick = () => {
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
      return <button key={key} onClick={() => this.onBulkEditMoveToPopupClick(key)} className="py-4 pl-8 pr-4 block w-full text-sm text-gray-700 text-left truncate rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">{listNameObj.displayName}</button>;
    });
  }

  render() {

    const { isBulkEditMoveToPopupShown } = this.props;
    if (!isBulkEditMoveToPopupShown) return (
      <AnimatePresence key="AnimatePresence_BBBEC_moveToPopup" />
    );

    const popupStyle = {
      maxHeight: getLastHalfHeight(384, 56, 16 + 1, 48 + 2),
    };

    return (
      <AnimatePresence key="AnimatePresence_BBBEC_moveToPopup">
        <motion.button key="BBBEC_cancelBtn" onClick={this.onBulkEditMoveToCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        {/* For spring animation, need space in padding bottom so max height need to be adjusted too. */}
        <motion.div key="BBBEC_moveToPopup" style={popupStyle} className="pt-4 pb-16 fixed inset-x-0 -bottom-12 bg-white border border-gray-100 rounded-t-lg shadow-xl overflow-auto z-41" variants={bModalFMV} initial="hidden" animate="visible" exit="hidden">
          <div className="py-4 pl-4 pr-4 block w-full text-sm text-gray-700 text-left">Move to...</div>
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

const mapDispatchToProps = { updatePopup, updateBulkEdit, moveLinks };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarBulkEditMoveToPopup);
