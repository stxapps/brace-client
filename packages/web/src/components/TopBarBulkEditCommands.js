import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopup, updateBulkEdit, moveLinks, updateDeleteAction, updateListNamesMode,
  updateBulkEditMenuMode,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP, LIST_NAMES_POPUP, BULK_EDIT_MENU_POPUP, MY_LIST, ARCHIVE, TRASH,
  DELETE_ACTION_LINK_COMMANDS, LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
  BULK_EDIT_MENU_ANIM_TYPE_POPUP,
} from '../types/const';
import { getListNameMap, getSafeAreaWidth, getThemeMode } from '../selectors';
import { getListNameDisplayName } from '../utils';
import { popupFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class TopBarBulkEditCommands extends React.Component {

  constructor(props) {
    super(props);

    this.state = { isEmptyErrorShown: false };
    this.didClick = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.isEmptyErrorShown === true &&
      (
        nextProps.selectedLinkIds.length > 0 ||
        this.props.listName !== nextProps.listName ||
        this.props.queryString !== nextProps.queryString
      )
    ) {
      this.setState({ isEmptyErrorShown: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.listName !== nextProps.listName ||
      this.props.queryString !== nextProps.queryString ||
      this.props.listNameMap !== nextProps.listNameMap ||
      this.props.tailwind !== nextProps.tailwind ||
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
    if (this.checkNoLinkIdSelected() || this.didClick) return;

    const { selectedLinkIds } = this.props;

    this.props.moveLinks(ARCHIVE, selectedLinkIds);
    this.props.updateBulkEdit(false);

    this.didClick = true;
  }

  onBulkEditRemoveBtnClick = () => {
    if (this.checkNoLinkIdSelected() || this.didClick) return;

    const { selectedLinkIds } = this.props;

    this.props.moveLinks(TRASH, selectedLinkIds);
    this.props.updateBulkEdit(false);

    this.didClick = true;
  }

  onBulkEditRestoreBtnClick = () => {
    if (this.checkNoLinkIdSelected() || this.didClick) return;

    const { selectedLinkIds } = this.props;

    this.props.moveLinks(MY_LIST, selectedLinkIds);
    this.props.updateBulkEdit(false);

    this.didClick = true;
  }

  onBulkEditDeleteBtnClick = () => {
    if (this.checkNoLinkIdSelected()) return;
    this.props.updateDeleteAction(DELETE_ACTION_LINK_COMMANDS);
    this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
  }

  onBulkEditMoveToBtnClick = (e) => {
    if (this.checkNoLinkIdSelected()) return;

    this.props.updateListNamesMode(
      LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
    );

    // Hacky to make sure the popup overlap all the button
    const _rect = e.currentTarget.getBoundingClientRect();
    const newX = _rect.x - 4;
    const newY = _rect.y - 4;
    const newWidth = _rect.width + 8;
    const newHeight = _rect.height + 8;
    const rect = {
      x: newX, y: newY, width: newWidth, height: newHeight,
      top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
    };
    this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
  }

  onBulkEditMoreBtnClick = (e) => {
    if (this.checkNoLinkIdSelected()) return;

    this.props.updateBulkEditMenuMode(BULK_EDIT_MENU_ANIM_TYPE_POPUP);

    // Hacky to make sure the popup overlap all the button
    const _rect = e.currentTarget.getBoundingClientRect();
    const newX = _rect.x - 4;
    const newY = _rect.y - 4;
    const newWidth = _rect.width + 8;
    const newHeight = _rect.height + 8;
    const rect = {
      x: newX, y: newY, width: newWidth, height: newHeight,
      top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
    };
    this.props.updatePopup(BULK_EDIT_MENU_POPUP, true, rect);
  }

  onBulkEditCancelBtnClick = () => {
    this.props.updateBulkEdit(false);
  }

  renderEmptyError() {
    if (!this.state.isEmptyErrorShown) return (
      <AnimatePresence key="AnimatePresence_TBBEC_emptyError" />
    );

    const { tailwind } = this.props;

    return (
      <AnimatePresence key="AnimatePresence_TBBEC_emptyError">
        <motion.div className={tailwind('absolute top-full left-0 flex items-start justify-center')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('mt-3 ml-4 rounded-md bg-red-50 p-4 shadow-lg')}>
            <div className={tailwind('flex')}>
              <div className={tailwind('flex-shrink-0')}>
                <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={tailwind('ml-3 mt-0.5')}>
                <h3 className={tailwind('text-left text-sm leading-5 text-red-800')}>Please select item(s) below first before continuing.</h3>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  render() {
    const { listName, queryString, listNameMap, tailwind } = this.props;

    const rListName = [MY_LIST, ARCHIVE, TRASH].includes(listName) ? listName : MY_LIST;

    let isArchiveBtnShown = [MY_LIST].includes(rListName);
    let isRemoveBtnShown = [MY_LIST, ARCHIVE].includes(rListName);
    let isRestoreBtnShown = [TRASH].includes(rListName);
    let isDeleteBtnShown = [TRASH].includes(rListName);
    let isMoveToBtnShown = [ARCHIVE].includes(rListName);
    let isMoreBtnShown = [MY_LIST, ARCHIVE].includes(rListName);
    if (queryString) {
      [isArchiveBtnShown, isRemoveBtnShown, isRestoreBtnShown] = [false, true, false];
      [isDeleteBtnShown, isMoveToBtnShown, isMoreBtnShown] = [false, false, true];
    }

    const btnStyle = {
      height: '2.125rem',
      paddingLeft: '0.625rem',
      paddingRight: '0.75rem',
    };
    const svgStyle = { width: '1.125rem', height: '1.125rem' };

    return (
      <div className={tailwind('relative flex min-w-[17rem] items-center justify-end')}>
        {isArchiveBtnShown && <div className={tailwind('relative ml-4')}>
          <button onClick={this.onBulkEditArchiveBtnClick} className={tailwind('group focus:outline-none')}>
            <div style={btnStyle} className={tailwind('flex items-center justify-center rounded-full border border-gray-400 bg-white group-hover:border-gray-500 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:group-hover:border-gray-300')}>
              <svg style={svgStyle} className={tailwind('text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 3C2.89543 3 2 3.89543 2 5C2 6.10457 2.89543 7 4 7H16C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3H4Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V8ZM8 11C8 10.4477 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H9C8.44772 12 8 11.5523 8 11Z" />
              </svg>
              <span className={tailwind('ml-1 max-w-16 truncate text-sm leading-none text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')}>{getListNameDisplayName(ARCHIVE, listNameMap)}</span>
            </div>
          </button>
        </div>}
        {isRemoveBtnShown && <div className={tailwind('relative ml-4')}>
          <button onClick={this.onBulkEditRemoveBtnClick} className={tailwind('group focus:outline-none')}>
            <div style={btnStyle} className={tailwind('flex items-center justify-center rounded-full border border-gray-400 bg-white group-hover:border-gray-500 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:group-hover:border-gray-300')}>
              <svg style={svgStyle} className={tailwind('text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
              </svg>
              <span className={tailwind('ml-1 text-sm leading-none text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')}>Remove</span>
            </div>
          </button>
        </div>}
        {isRestoreBtnShown && <div className={tailwind('relative ml-4')}>
          <button onClick={this.onBulkEditRestoreBtnClick} className={tailwind('group focus:outline-none')}>
            <div style={btnStyle} className={tailwind('flex items-center justify-center rounded-full border border-gray-400 bg-white group-hover:border-gray-500 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:group-hover:border-gray-300')}>
              <svg style={svgStyle} className={tailwind('text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.8034 5.19398C11.9177 2.30766 7.26822 2.27141 4.33065 5.0721L3 3.66082V8.62218H7.6776L6.38633 7.25277C8.14886 5.56148 10.9471 5.58024 12.6821 7.31527C15.3953 10.0285 13.7677 14.9973 9.25014 14.9973V17.9974C11.5677 17.9974 13.384 17.2199 14.8034 15.8005C17.7322 12.8716 17.7322 8.12279 14.8034 5.19398V5.19398Z" />
              </svg>
              <span className={tailwind('ml-1 text-sm leading-none text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')}>Restore</span>
            </div>
          </button>
        </div>}
        {isDeleteBtnShown && <div className={tailwind('relative ml-4')}>
          <button onClick={this.onBulkEditDeleteBtnClick} className={tailwind('group focus:outline-none')}>
            <div style={btnStyle} className={tailwind('flex items-center justify-center rounded-full border border-gray-400 bg-white group-hover:border-gray-500 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:group-hover:border-gray-300')}>
              <svg style={svgStyle} className={tailwind('text-red-500 group-hover:text-red-600 blk:text-red-500 blk:group-hover:text-red-600')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
              </svg>
              <span className={tailwind('ml-1 text-sm leading-none text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')}>Permanently Delete</span>
            </div>
          </button>
        </div>}
        {isMoveToBtnShown && <div className={tailwind('relative ml-4')}>
          <button onClick={this.onBulkEditMoveToBtnClick} className={tailwind('group focus:outline-none')}>
            <div style={btnStyle} className={tailwind('flex items-center justify-center rounded-full border border-gray-400 bg-white group-hover:border-gray-500 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:group-hover:border-gray-300')}>
              <svg style={svgStyle} className={tailwind('text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
              </svg>
              <span className={tailwind('ml-1 text-sm leading-none text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')}>Move to</span>
            </div>
          </button>
        </div>}
        {isMoreBtnShown && <div className={tailwind('relative ml-4')}>
          <button onClick={this.onBulkEditMoreBtnClick} className={tailwind('group focus:outline-none')}>
            <div style={btnStyle} className={tailwind('flex items-center justify-center rounded-full border border-gray-400 bg-white group-hover:border-gray-500 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:group-hover:border-gray-300')}>
              <svg style={svgStyle} className={tailwind('text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.73478 3.10536 4.48043 3.29289 4.29289C3.48043 4.10536 3.73478 4 4 4H16C16.2652 4 16.5196 4.10536 16.7071 4.29289C16.8946 4.48043 17 4.73478 17 5C17 5.26522 16.8946 5.51957 16.7071 5.70711C16.5196 5.89464 16.2652 6 16 6H4C3.73478 6 3.48043 5.89464 3.29289 5.70711C3.10536 5.51957 3 5.26522 3 5ZM3 10C3 9.73478 3.10536 9.48043 3.29289 9.29289C3.48043 9.10536 3.73478 9 4 9H10C10.2652 9 10.5196 9.10536 10.7071 9.29289C10.8946 9.48043 11 9.73478 11 10C11 10.2652 10.8946 10.5196 10.7071 10.7071C10.5196 10.8946 10.2652 11 10 11H4C3.73478 11 3.48043 10.8946 3.29289 10.7071C3.10536 10.5196 3 10.2652 3 10ZM3 15C3 14.7348 3.10536 14.4804 3.29289 14.2929C3.48043 14.1054 3.73478 14 4 14H16C16.2652 14 16.5196 14.1054 16.7071 14.2929C16.8946 14.4804 17 14.7348 17 15C17 15.2652 16.8946 15.5196 16.7071 15.7071C16.5196 15.8946 16.2652 16 16 16H4C3.73478 16 3.48043 15.8946 3.29289 15.7071C3.10536 15.5196 3 15.2652 3 15Z" />
              </svg>
              <span className={tailwind('ml-1 text-sm leading-none text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')}>More actions</span>
            </div>
          </button>
        </div>}
        <button onClick={this.onBulkEditCancelBtnClick} className={tailwind('group ml-1 h-8 w-10 focus:outline-none')}>
          <svg className={tailwind('mx-auto h-6 w-6 rounded-full text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
    queryString: state.display.queryString,
    listNameMap: getListNameMap(state),
    selectedLinkIds: state.display.selectedLinkIds,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToProps = {
  updatePopup, updateBulkEdit, moveLinks, updateDeleteAction, updateListNamesMode,
  updateBulkEditMenuMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBarBulkEditCommands));
