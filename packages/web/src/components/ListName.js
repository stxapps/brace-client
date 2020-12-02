import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import { changeListName, updatePopup } from '../actions';
import {
  LIST_NAME_POPUP, SM_WIDTH, LG_WIDTH,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName, isEqual } from '../utils';
import { popupBgFMV, tlPopupFMV } from '../types/animConfigs';

import { getTopBarSizes } from '.';

class ListName extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { menuPopupSize: null };
    this.menuPopup = React.createRef();
  }

  componentDidMount() {
    this.updateState(this.props.isListNamePopupShown);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isListNamePopupShown && this.props.isListNamePopupShown) {
      this.updateState(true);
    }

    if (prevProps.isListNamePopupShown && !this.props.isListNamePopupShown) {
      this.updateState(false);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isListNamePopupShown && nextProps.isListNamePopupShown) {
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

  onListNameBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, true);
    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
  };

  onListNamePopupClick = (newListName) => {

    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isListNamePopupShown) return;
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

  renderMenu() {

    const { listNameMap, updates } = this.props;

    return listNameMap.map(listNameObj => {
      return (
        <button key={listNameObj.listName} onClick={() => this.onListNamePopupClick(listNameObj.listName)} className="py-2 pl-4 pr-4 flex items-center w-full hover:bg-gray-400 focus:outline-none focus:shadow-outline">
          <div className="text-base text-gray-800 truncate">{listNameObj.displayName}</div>
          {(listNameObj.listName) in updates && <div className="ml-1 flex-grow-0 flex-shrink-0 self-start w-2 h-2 bg-blue-500 rounded-full"></div>}
        </button>
      );
    });
  }

  renderListNamePopup() {

    const { isListNamePopupShown } = this.props;
    if (!isListNamePopupShown) return (
      <AnimatePresence key="AnimatePresence_ListNamePopup"></AnimatePresence>
    );

    const { menuPopupSize } = this.state;
    const menuPopupClassNames = 'py-2 absolute top-0 left-0 min-w-28 max-w-64 max-h-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-auto z-41';

    let menuPopup;
    if (menuPopupSize) {

      const popupStyle = {};
      if (menuPopupSize.height > window.innerHeight - menuPopupSize.top) {
        popupStyle.maxHeight = window.innerHeight - menuPopupSize.top - 16;
      }

      menuPopup = (
        <motion.div key="ListNamePopup_menuPopup" ref={this.menuPopup} style={popupStyle} className={menuPopupClassNames} variants={tlPopupFMV} initial="hidden" animate="visible" exit="hidden">
          {this.renderMenu()}
        </motion.div>
      );
    } else {
      menuPopup = (
        <div key="ListNamePopup_menuPopup" ref={this.menuPopup} className={menuPopupClassNames}>
          {this.renderMenu()}
        </div>
      );
    }

    return (
      <AnimatePresence key="AnimatePresence_ListNamePopup">
        <motion.button key="ListNamePopup_cancelBtn" onClick={this.onListNameCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
        {menuPopup}
      </AnimatePresence>
    );
  }

  render() {

    const { listName, listNameMap, updates } = this.props;
    const displayName = getListNameDisplayName(listName, listNameMap);

    let textMaxWidth = 160;
    if (window.innerWidth >= SM_WIDTH) textMaxWidth = 320;
    if (window.innerWidth >= LG_WIDTH) textMaxWidth = 512;

    if (window.innerWidth >= SM_WIDTH) {
      const {
        headerPaddingX, commandsWidth,
        listNameDistanceX, listNameArrowWidth, listNameArrowSpace,
      } = getTopBarSizes(window.innerWidth);
      let headerSpaceLeftover = window.innerWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth - listNameArrowSpace - commandsWidth - 4;
      if (listName in updates) headerSpaceLeftover -= 8;

      textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover)
    }
    const textStyle = { maxWidth: textMaxWidth };

    return (
      <div className="inline-block relative">
        <button onClick={this.onListNameBtnClick} className="flex items-center rounded hover:shadow-outline focus:outline-none focus:shadow-outline">
          <h2 style={textStyle} className="mr-1 max-w-40 text-lg text-gray-900 font-semibold leading-7 truncate sm:max-w-xs lg:max-w-lg">{displayName}</h2>
          {(listName in updates) && <div className="self-start w-2 h-2 bg-blue-500 rounded-full"></div>}
          <svg className="w-5 text-black" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    updates: state.fetched,
  }
};

const mapDispatchToProps = {
  changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(ListName);
