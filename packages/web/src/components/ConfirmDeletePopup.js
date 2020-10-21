import React from 'react';
import { connect } from 'react-redux';

import {
  updatePopup, deleteLinks, clearSelectedLinkIds, updateBulkEdit,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP,
} from '../types/const';
import { getPopupLink } from '../selectors';

class ConfirmDeletePopup extends React.Component {

  shouldComponentUpdate(nextProps) {
    if (this.props.isConfirmDeletePopupShown !== nextProps.isConfirmDeletePopupShown) {
      return true;
    }

    return false;
  }

  onConfirmDeleteOkBtnClick = () => {

    const { popupLink, selectedLinkIds } = this.props;

    if (
      (popupLink && selectedLinkIds.length > 0) ||
      (!popupLink && selectedLinkIds.length === 0)
    ) {
      throw new Error(`Invalid popupLink: ${popupLink} and selectedLinkIds: ${selectedLinkIds}`);
    }

    if (popupLink) {

      const { deleteLinks, updatePopup } = this.props;

      deleteLinks([popupLink.id]);
      updatePopup(CONFIRM_DELETE_POPUP, false);
      updatePopup(popupLink.id, false);
      return;
    }

    if (selectedLinkIds.length > 0) {

      const {
        deleteLinks, updatePopup, clearSelectedLinkIds, updateBulkEdit,
      } = this.props;

      deleteLinks(selectedLinkIds);
      updatePopup(CONFIRM_DELETE_POPUP, false);
      clearSelectedLinkIds();
      updateBulkEdit(false);
      return;
    }

    throw new Error('Must not reach here!');
  };

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
  };

  render() {

    const { isConfirmDeletePopupShown } = this.props;
    if (!isConfirmDeletePopupShown) return null;

    return (
      <React.Fragment>
        <button onClick={this.onConfirmDeleteCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-50 focus:outline-none"></button>
        <div className="p-4 fixed top-1/2 left-1/2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl transform -translate-x-1/2 -translate-y-1/2 z-51">
          <p className="py-2 text-lg text-gray-900 text-center">Confirm delete?</p>
          <div className="py-2 text-center">
            <button onClick={this.onConfirmDeleteOkBtnClick} className="mr-2 py-2 focus:outline-none-outer">
              <span className="px-3 py-1 bg-white text-base text-gray-900 border border-gray-900 rounded-full shadow-sm hover:bg-gray-800 hover:text-white active:bg-gray-900 focus:shadow-outline-inner">Yes</span>
            </button>
            <button onClick={this.onConfirmDeleteCancelBtnClick} className="ml-2 py-2 focus:outline-none-outer">
              <span className="px-3 py-1 bg-white text-base text-gray-900 border border-gray-900 rounded-full shadow-sm hover:bg-gray-800 hover:text-white active:bg-gray-900 focus:shadow-outline-inner">No</span>
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isConfirmDeletePopupShown: state.display.isConfirmDeletePopupShown,
    popupLink: getPopupLink(state),
    selectedLinkIds: state.display.selectedLinkIds,
  }
};

const mapDispatchToProps = {
  updatePopup, deleteLinks, clearSelectedLinkIds, updateBulkEdit,
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmDeletePopup);
