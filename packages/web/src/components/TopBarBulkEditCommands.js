import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP, BULK_EDIT_MOVE_TO_POPUP,
  MY_LIST, ARCHIVE, TRASH,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName } from '../utils';
import { ccPopupFMV } from '../types/animConfigs';

import TopBarBulkEditMoveToPopup from './TopBarBulkEditMoveToPopup';

class TopBarBulkEditCommands extends React.Component {

  constructor(props) {
    super(props);

    this.state = { isEmptyErrorShown: false };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.isEmptyErrorShown === true &&
      (
        nextProps.selectedLinkIds.length > 0 ||
        this.props.listName !== nextProps.listName
      )
    ) {
      this.setState({ isEmptyErrorShown: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.listName !== nextProps.listName ||
      this.props.listNameMap !== nextProps.listNameMap ||
      this.state.isEmptyErrorShown !== nextState.isEmptyErrorShown
    ) {
      return true;
    }

    return false;
  }

  checkNoLinkIdSelected = () => {
    if (this.props.selectedLinkIds.length === 0) {
      this.setState({ isEmptyErrorShown: true });
      return true;
    }

    this.setState({ isEmptyErrorShown: false });
    return false;
  }

  onBulkEditArchiveBtnClick = () => {
    // As animation takes time, increase chance to several clicks
    if (!this.props.isBulkEditing) return;
    if (this.checkNoLinkIdSelected()) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    moveLinks(ARCHIVE, selectedLinkIds);
    clearSelectedLinkIds();
    updateBulkEdit(false);
  }

  onBulkEditRemoveBtnClick = () => {
    // As animation takes time, increase chance to several clicks
    if (!this.props.isBulkEditing) return;
    if (this.checkNoLinkIdSelected()) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    moveLinks(TRASH, selectedLinkIds);
    clearSelectedLinkIds();
    updateBulkEdit(false);
  }

  onBulkEditRestoreBtnClick = () => {
    // As animation takes time, increase chance to several clicks
    if (!this.props.isBulkEditing) return;
    if (this.checkNoLinkIdSelected()) return;

    const {
      selectedLinkIds, moveLinks, clearSelectedLinkIds, updateBulkEdit,
    } = this.props;

    moveLinks(MY_LIST, selectedLinkIds);
    clearSelectedLinkIds();
    updateBulkEdit(false);
  }

  onBulkEditDeleteBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;
    this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
  }

  onBulkEditMoveToBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;
    this.props.updatePopup(BULK_EDIT_MOVE_TO_POPUP, true);
  }

  onBulkEditCancelBtnClick = () => {
    // As animation takes time, increase chance to several clicks
    if (!this.props.isBulkEditing) return;
    this.props.clearSelectedLinkIds();
    this.props.updateBulkEdit(false);
  }

  renderEmptyError() {

    if (!this.state.isEmptyErrorShown) return (
      <AnimatePresence key="AnimatePresence_TBBEC_emptyError"></AnimatePresence>
    );

    return (
      <AnimatePresence key="AnimatePresence_TBBEC_emptyError">
        <motion.div className="absolute top-full left-0 flex justify-center items-start" variants={ccPopupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className="mt-3 ml-4 p-4 rounded-md bg-red-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm leading-5 font-medium text-red-800 text-left">Please select item(s) below first before continuing.</h3>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  render() {

    const { listName, listNameMap } = this.props;
    const rListName = [MY_LIST, ARCHIVE, TRASH].includes(listName) ? listName : MY_LIST;

    const isArchiveBtnShown = [MY_LIST].includes(rListName);
    const isRemoveBtnShown = [MY_LIST, ARCHIVE].includes(rListName);
    const isRestoreBtnShown = [TRASH].includes(rListName);
    const isDeleteBtnShown = [TRASH].includes(rListName);
    const isMoveToBtnShown = [ARCHIVE].includes(rListName) || (rListName === MY_LIST && listNameMap.length > 3);

    const btnStyle = {
      height: '2.125rem',
      paddingLeft: '0.625rem',
      paddingRight: '0.75rem',
    };

    return (
      <div className="relative flex justify-end items-center">
        {isArchiveBtnShown && <div className="relative ml-4">
          <button onClick={this.onBulkEditArchiveBtnClick} className={`group focus:outline-none-outer`}>
            <div style={btnStyle} className="flex justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm hover:border-gray-900 group-hover:text-gray-900 active:bg-gray-200 focus:shadow-outline-inner">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-700" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
              </svg>
              <span className="ml-1 max-w-16 text-base text-gray-700 truncate group-hover:text-gray-900">{getListNameDisplayName(ARCHIVE, listNameMap)}</span>
            </div>
          </button>
        </div>}
        {isRemoveBtnShown && <div className="relative ml-4">
          <button onClick={this.onBulkEditRemoveBtnClick} className={`group focus:outline-none-outer`}>
            <div style={btnStyle} className="flex justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm hover:border-gray-900 group-hover:text-gray-900 active:bg-gray-200 focus:shadow-outline-inner">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-700" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
              </svg>
              <span className="ml-1 text-base text-gray-700 group-hover:text-gray-900">Remove</span>
            </div>
          </button>
        </div>}
        {isRestoreBtnShown && <div className="relative ml-4">
          <button onClick={this.onBulkEditRestoreBtnClick} className={`group focus:outline-none-outer`}>
            <div style={btnStyle} className="flex justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm hover:border-gray-900 group-hover:text-gray-900 active:bg-gray-200 focus:shadow-outline-inner">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-700" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.8034 5.19398C11.9177 2.30766 7.26822 2.27141 4.33065 5.0721L3 3.66082V8.62218H7.6776L6.38633 7.25277C8.14886 5.56148 10.9471 5.58024 12.6821 7.31527C15.3953 10.0285 13.7677 14.9973 9.25014 14.9973V17.9974C11.5677 17.9974 13.384 17.2199 14.8034 15.8005C17.7322 12.8716 17.7322 8.12279 14.8034 5.19398V5.19398Z" />
              </svg>
              <span className="ml-1 text-base text-gray-700 group-hover:text-gray-900">Restore</span>
            </div>
          </button>
        </div>}
        {isDeleteBtnShown && <div className="relative ml-4">
          <button onClick={this.onBulkEditDeleteBtnClick} className={`group focus:outline-none-outer`}>
            <div style={btnStyle} className="flex justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm hover:border-gray-900 group-hover:text-gray-900 active:bg-gray-200 focus:shadow-outline-inner">
              <svg className="w-5 h-5 text-red-600 group-hover:text-red-700" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
              </svg>
              <span className="ml-1 text-base text-gray-700 group-hover:text-gray-900">Permanently Delete</span>
            </div>
          </button>
        </div>}
        {isMoveToBtnShown && <div className="relative ml-4">
          <button onClick={this.onBulkEditMoveToBtnClick} className={`group focus:outline-none-outer`}>
            <div style={btnStyle} className="flex justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm hover:border-gray-900 group-hover:text-gray-900 active:bg-gray-200 focus:shadow-outline-inner">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-700" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
              </svg>
              <span className="ml-1 text-base text-gray-700 group-hover:text-gray-900">Move to...</span>
            </div>
          </button>
          <TopBarBulkEditMoveToPopup />
        </div>}
        <button onClick={this.onBulkEditCancelBtnClick} className={`ml-1 w-10 h-10 group focus:outline-none-outer`}>
          <svg className="mx-auto w-7 h-7 text-gray-600 rounded-full group-hover:text-gray-700 focus:shadow-outline-inner" viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M14 25.2001C20.1857 25.2001 25.2001 20.1857 25.2001 14C25.2001 7.81446 20.1857 2.80005 14 2.80005C7.81446 2.80005 2.80005 7.81446 2.80005 14C2.80005 20.1857 7.81446 25.2001 14 25.2001ZM12.19 10.2101C11.6433 9.66337 10.7568 9.66337 10.2101 10.2101C9.66337 10.7568 9.66337 11.6433 10.2101 12.19L12.0202 14L10.2101 15.8101C9.66337 16.3568 9.66337 17.2433 10.2101 17.79C10.7568 18.3367 11.6433 18.3367 12.19 17.79L14 15.9799L15.8101 17.79C16.3568 18.3367 17.2433 18.3367 17.79 17.79C18.3367 17.2433 18.3367 16.3568 17.79 15.8101L15.9799 14L17.79 12.19C18.3367 11.6433 18.3367 10.7568 17.79 10.2101C17.2433 9.66337 16.3568 9.66337 15.8101 10.2101L14 12.0202L12.19 10.2101Z" />
          </svg>
        </button>
        {this.renderEmptyError()}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    isBulkEditing: state.display.isBulkEditing,
    selectedLinkIds: state.display.selectedLinkIds,
  };
};

const mapDispatchToProps = {
  updatePopup, updateBulkEdit, clearSelectedLinkIds, moveLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBarBulkEditCommands);
