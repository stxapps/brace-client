import React from 'react';
import { connect } from 'react-redux';

import {
  updatePopup, deleteLinks, clearSelectedLinkIds, updateBulkEdit,
  deleteListNames, updateDeletingListName,
} from '../actions';
import { CONFIRM_DELETE_POPUP } from '../types/const';
import { getPopupLink } from '../selectors';

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
    if (this.props.isConfirmDeletePopupShown !== nextProps.isConfirmDeletePopupShown) {
      return true;
    }

    return false;
  }

  onConfirmDeleteOkBtnClick = () => {
    if (this.didClick) return;
    this.didClick = true;

    const { popupLink, selectedLinkIds, deletingListName } = this.props;

    const v1 = popupLink ? 1 : 0;
    const v2 = selectedLinkIds.length > 0 ? 1 : 0;
    const v3 = deletingListName ? 1 : 0;
    if (v1 + v2 + v3 !== 1) {
      throw new Error(`Invalid popupLink: ${popupLink}, selectedLinkIds: ${selectedLinkIds}, and deletingListName: ${deletingListName}`);
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

    if (deletingListName) {
      const { deleteListNames, updatePopup, updateDeletingListName } = this.props;

      deleteListNames([deletingListName]);
      updatePopup(CONFIRM_DELETE_POPUP, false);
      updateDeletingListName(null);
      return;
    }

    throw new Error('Must not reach here!');
  }

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    this.props.updateDeletingListName(null);
  }

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
    deletingListName: state.display.deletingListName,
  }
};

const mapDispatchToProps = {
  updatePopup, deleteLinks, clearSelectedLinkIds, updateBulkEdit,
  deleteListNames, updateDeletingListName,
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmDeletePopup);
