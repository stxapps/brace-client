import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopup, deleteLinks, updateBulkEdit, deleteListNames,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP, DELETE_ACTION_LINK_COMMANDS, DELETE_ACTION_LIST_NAME, SM_WIDTH,
} from '../types/const';
import { getPopupLink } from '../selectors';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class ConfirmDeletePopup extends React.Component {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isConfirmDeletePopupShown && this.props.isConfirmDeletePopupShown) {
      this.didClick = false;
    }
  }

  shouldComponentUpdate(nextProps) {
    if (
      this.props.isConfirmDeletePopupShown !== nextProps.isConfirmDeletePopupShown ||
      this.props.safeAreaWidth !== nextProps.safeAreaWidth ||
      this.props.safeAreaHeight !== nextProps.safeAreaHeight
    ) {
      return true;
    }

    return false;
  }

  onConfirmDeleteOkBtnClick = () => {
    if (this.didClick) return;
    this.didClick = true;

    const { deleteAction, popupLink, selectedLinkIds, deletingListName } = this.props;

    if (deleteAction === DELETE_ACTION_LINK_COMMANDS) {
      const v1 = popupLink ? 1 : 0;
      const v2 = selectedLinkIds.length > 0 ? 1 : 0;
      if (v1 + v2 !== 1) {
        console.log(`In ConfirmDeletePopup, invalid popupLink: ${popupLink} and selectedLinkIds: ${selectedLinkIds}`);
        return;
      }

      if (popupLink) {
        this.props.deleteLinks([popupLink.id]);
        this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
        this.props.updatePopup(popupLink.id, false);
        return;
      }

      if (selectedLinkIds.length > 0) {
        this.props.deleteLinks(selectedLinkIds);
        this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
        this.props.updateBulkEdit(false);
        return;
      }

      console.log(`In ConfirmDeletePopup, invalid popupLink: ${popupLink} and selectedLinkIds: ${selectedLinkIds}`);
    } else if (deleteAction === DELETE_ACTION_LIST_NAME) {
      this.props.deleteListNames([deletingListName]);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    } else {
      console.log('In ConfirmDeletePopup, invalid deleteAction: ', deleteAction);
    }
  }

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
  }

  render() {
    const {
      isConfirmDeletePopupShown, safeAreaWidth, safeAreaHeight, tailwind,
    } = this.props;

    if (!isConfirmDeletePopupShown) return <AnimatePresence key="AP_CDP" />;

    const spanStyle = {};
    if (safeAreaWidth >= SM_WIDTH) spanStyle.height = safeAreaHeight;

    const cancelBtnStyle = {};
    if (safeAreaWidth < SM_WIDTH) {
      cancelBtnStyle.paddingTop = '0.44rem';
      cancelBtnStyle.paddingBottom = '0.44rem';
    }

    return (
      <AnimatePresence key="AP_CDP">
        <div className={tailwind('fixed inset-0 z-50 overflow-y-auto')} aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div style={{ minHeight: safeAreaHeight }} className={tailwind('flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0')}>
            <div className={tailwind('fixed inset-0')} aria-hidden="true">
              <motion.button onClick={this.onConfirmDeleteCancelBtnClick} tabIndex={-1} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
            </div>
            <span style={spanStyle} className={tailwind('hidden sm:inline-block sm:h-screen sm:align-middle')} aria-hidden="true">&#8203;</span>
            <motion.div className={tailwind('relative inline-block overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden">
              <div className={tailwind('sm:flex sm:items-start')}>
                <div className={tailwind('mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10')}>
                  <svg className={tailwind('h-6 w-6 text-red-600')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className={tailwind('mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left')}>
                  <h3 className={tailwind('text-lg font-medium leading-6 text-gray-900')} id="modal-title">Confirm delete?</h3>
                  <div className={tailwind('mt-2')}>
                    <p className={tailwind('text-sm text-gray-500')}>Are you sure you want to permanently delete? This action cannot be undone.</p>
                  </div>
                </div>
              </div>
              <div className={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:flex sm:pl-4')}>
                <button onClick={this.onConfirmDeleteOkBtnClick} type="button" className={tailwind('inline-flex w-full justify-center rounded-full border border-red-600 bg-red-600 py-2 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring sm:w-auto sm:px-3.5 sm:py-1.5 sm:text-sm')}>Delete</button>
                <button onClick={this.onConfirmDeleteCancelBtnClick} type="button" style={cancelBtnStyle} className={tailwind('mt-3 inline-flex w-full justify-center rounded-full border border-gray-400 bg-white text-base font-normal text-gray-500 hover:border-gray-500 hover:text-gray-600 focus:outline-none focus:ring sm:mt-0 sm:ml-3 sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm')}>Cancel</button>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isConfirmDeletePopupShown: state.display.isConfirmDeletePopupShown,
    deleteAction: state.display.deleteAction,
    popupLink: getPopupLink(state),
    selectedLinkIds: state.display.selectedLinkIds,
    deletingListName: state.display.deletingListName,
    safeAreaWidth: state.window.width,
    safeAreaHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  updatePopup, deleteLinks, updateBulkEdit, deleteListNames
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(ConfirmDeletePopup));
