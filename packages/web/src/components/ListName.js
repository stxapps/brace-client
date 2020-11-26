import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import {
  changeListName, updatePopup,
} from '../actions';
import {
  LIST_NAME_POPUP, SM_WIDTH, LG_WIDTH,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName } from '../utils';
import { popupBgFMV, tlPopupFMV } from '../types/animConfigs';

import { getTopBarSizes } from '.';

class ListName extends React.PureComponent {

  onListNameBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, true);
    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
  };

  onListNamePopupClick = (e) => {

    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isListNamePopupShown) return;

    const newListName = e.target.getAttribute('data-key');
    if (!newListName) return;

    this.props.changeListName(newListName, this.props.fetched);
    this.props.fetched.push(newListName);

    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  onListNameCancelBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isListNamePopupShown) return;
    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  renderListNamePopup() {

    const { isListNamePopupShown, listNameMap } = this.props;
    if (!isListNamePopupShown) return (
      <AnimatePresence key="AnimatePresence_ListNamePopup"></AnimatePresence>
    );

    return (
      <AnimatePresence key="AnimatePresence_ListNamePopup">
        <motion.button key="ListNamePopup_cancelBtn" onClick={this.onListNameCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
        <motion.div key="ListNamePopup_menuPopup" onClick={this.onListNamePopupClick} className="py-2 absolute top-0 left-0 min-w-28 max-w-64 max-h-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-auto z-41" variants={tlPopupFMV} initial="hidden" animate="visible" exit="hidden">
          {listNameMap.map(listNameObj => <button className="py-2 pl-4 pr-4 block w-full text-gray-800 text-left truncate hover:bg-gray-400 focus:outline-none focus:shadow-outline" key={listNameObj.listName} data-key={listNameObj.listName}>{listNameObj.displayName}</button>)}
        </motion.div>
      </AnimatePresence>
    );
  }

  render() {

    const { listName, listNameMap } = this.props;
    const displayName = getListNameDisplayName(listName, listNameMap);

    let textMaxWidth = 160;
    if (window.innerWidth >= SM_WIDTH) textMaxWidth = 320;
    if (window.innerWidth >= LG_WIDTH) textMaxWidth = 512;

    if (window.innerWidth >= SM_WIDTH) {
      const {
        headerPaddingX, commandsWidth,
        listNameDistanceX, listNameArrowWidth, listNameArrowSpace,
      } = getTopBarSizes(window.innerWidth);
      const headerSpaceLeftover = window.innerWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth - listNameArrowSpace - commandsWidth - 4;

      textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover)
    }
    const textStyle = { maxWidth: textMaxWidth };

    return (
      <div className="inline-block relative">
        <button onClick={this.onListNameBtnClick} className="relative flex items-center rounded hover:shadow-outline focus:outline-none focus:shadow-outline">
          <h2 style={textStyle} className="max-w-40 text-lg text-gray-900 font-semibold leading-7 truncate sm:max-w-xs lg:max-w-lg">{displayName}</h2>
          <svg className="ml-1 w-5 text-black" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {this.renderListNamePopup()}
      </div>
    );
  }
}

ListName.propTypes = {
  fetched: PropTypes.arrayOf(PropTypes.string),
};

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    isListNamePopupShown: state.display.isListNamePopupShown,
  }
};

const mapDispatchToProps = {
  changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(ListName);
