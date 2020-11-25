import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import { updatePopup, moveLinks } from '../actions';
import {
  CONFIRM_DELETE_POPUP,
  MY_LIST, TRASH,
  ADDING, MOVING,
  OPEN, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO,
  CARD_ITEM_POPUP_MENU,
} from '../types/const';
import { getListNameMap, getPopupLink } from '../selectors';
import {
  copyTextToClipboard, ensureContainUrlProtocol, getLongestListNameDisplayName,
  isEqual, throttle,
} from '../utils';
import {
  computePosition, createLayouts, AT_TRIGGER, EDGE_TRIGGER,
} from './MenuPopupRenderer';

class CardItemMenuPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialScrollY = window.pageYOffset;
    this.state = {
      scrollY: this.initialScrollY,
      menuPopupSize: null,
    };

    this.menuPopup = React.createRef();

    this.menu = null;
    this.moveTo = null;
    this.longestDisplayName = null;

    this.updateScrollY = throttle(this.updateScrollY, 16);

    if (props.popupLink) {
      const { menu, moveTo, longestDisplayName } = this.populateMenu(props);
      this.menu = menu;
      this.moveTo = moveTo;
      this.longestDisplayName = longestDisplayName;
    }
  }

  componentDidMount() {
    this.updateState(this.props.popupLink !== null);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.popupLink && this.props.popupLink) {
      this.updateState(true);
    }

    if (prevProps.popupLink && !this.props.popupLink) {
      this.updateState(false);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.popupLink && nextProps.popupLink) {

      this.initialScrollY = window.pageYOffset;
      this.setState({
        scrollY: this.initialScrollY,
        menuPopupSize: null,
      });

      const { menu, moveTo, longestDisplayName } = this.populateMenu(nextProps);
      this.menu = menu;
      this.moveTo = moveTo;
      this.longestDisplayName = longestDisplayName;
    }
  }

  componentWillUnmount() {
    this.updateState(false);
  }

  populateMenu(props) {
    let menu = null;
    if (props.listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[props.listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }
    if ([ADDING, MOVING].includes(props.popupLink.status)) {
      menu = menu.slice(0, 2);
    }

    const moveTo = [];
    if (menu.includes(MOVE_TO)) {
      for (const listNameObj of props.listNameMap) {
        if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
        if (props.listName === listNameObj.listName) continue;

        moveTo.push(listNameObj);
      }
    }

    menu = menu.filter(text => text !== MOVE_TO);

    const _listNameMap = [];
    menu.forEach(text => _listNameMap.push({ listName: text, displayName: text }));
    moveTo.forEach(listNameObj => _listNameMap.push(listNameObj));
    const longestDisplayName = getLongestListNameDisplayName(_listNameMap);

    return { menu, moveTo, longestDisplayName };
  }

  updateState(isShown) {
    if (isShown) {
      const menuPopupSize = this.menuPopup.current.getBoundingClientRect();
      if (!isEqual(menuPopupSize, this.state.menuPopupSize)) {
        this.setState({ menuPopupSize });
      }
      window.addEventListener('scroll', this.updateScrollY);
    } else {
      window.removeEventListener('scroll', this.updateScrollY);
    }
  }

  updateScrollY = () => {
    this.setState({ scrollY: window.pageYOffset });
  }

  onMenuPopupClick = (e) => {

    // As animation takes time, increase chance to several clicks
    if (!this.props.popupLink) return;

    const text = e.target.getAttribute('data-key');
    if (!text) return;

    const { id, url } = this.props.popupLink;

    if (text === OPEN) {
      window.open(ensureContainUrlProtocol(url));
    } else if (text === COPY_LINK) {
      copyTextToClipboard(url);
    } else if (text === ARCHIVE) {
      this.props.moveLinks(ARCHIVE, [id]);
    } else if (text === REMOVE) {
      this.props.moveLinks(TRASH, [id]);
    } else if (text === RESTORE) {
      this.props.moveLinks(MY_LIST, [id]);
    } else if (text === DELETE) {
      this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
      return;
    } else if (text.startsWith(MOVE_TO)) {
      this.props.moveLinks(text.substring(MOVE_TO.length + 1), [id]);
    } else {
      throw new Error(`Invalid text: ${text}`);
    }

    this.props.updatePopup(id, false);
  };

  onCancelBtnClick = () => {
    // As animation takes time, increase chance to several clicks
    if (!this.props.popupLink) return;
    this.props.updatePopup(this.props.popupLink.id, false);
  };

  renderMenu() {

    let moveTo = null;
    if (this.moveTo && this.moveTo.length) {
      moveTo = (
        <React.Fragment>
          <div className="py-2 pl-4 pr-2 block w-full text-gray-800 text-left">Move to...</div>
          {this.moveTo.map(listNameObj => {
            const key = MOVE_TO + ' ' + listNameObj.listName;
            return <button className="py-2 pl-8 pr-2 block w-full text-gray-800 text-left truncate hover:bg-gray-400 focus:outline-none focus:shadow-outline" key={key} data-key={key}>{listNameObj.displayName}</button>;
          })}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {this.menu.map(text => <button className="py-2 pl-4 pr-2 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline" key={text} data-key={text}>{text}</button>)}
        {moveTo && moveTo}
      </React.Fragment>
    );
  }

  render() {

    const { popupLink } = this.props;
    if (!popupLink) return (
      <AnimatePresence key="AnimatePresence_CardItemMenuPopup"></AnimatePresence>
    );

    // As under Move to... and indent so plus 1
    const longestDisplayNameLength = this.longestDisplayName.length + 1;

    const popupStyle = {};
    popupStyle.width = '8rem';
    popupStyle.maxHeight = '18rem';
    if (longestDisplayNameLength > 10) {
      // Approx 8px or 0.5rem per additional character
      const width = Math.min(8 + 0.5 * (longestDisplayNameLength - 10), 16);
      popupStyle.width = `${width}rem`;
    }

    const { scrollY, menuPopupSize } = this.state;
    const menuPopupClassNames = 'py-2 fixed bg-white border border-gray-200 rounded-lg shadow-xl overflow-auto z-41';

    let menuPopup;
    if (menuPopupSize) {

      const anchorPosition = popupLink.popupAnchorPosition;
      const offsetScrollY = this.initialScrollY - scrollY;

      const layouts = createLayouts(anchorPosition, menuPopupSize);
      const triggerOffsets = { x: 8, y: (16 - 4), width: -1 * (16 + 8 - 4), height: -6 };
      const popupPosition = computePosition(layouts, triggerOffsets);

      const { top, left, topOrigin, leftOrigin } = popupPosition;
      popupStyle.top = top + offsetScrollY;
      popupStyle.left = left;

      let hiddenTranslateX, hiddenTranslateY;
      if (topOrigin === AT_TRIGGER && leftOrigin === AT_TRIGGER) {
        [hiddenTranslateX, hiddenTranslateY] = ['-50%', '-50%'];
      } else if (topOrigin === AT_TRIGGER && leftOrigin === EDGE_TRIGGER) {
        [hiddenTranslateX, hiddenTranslateY] = ['50%', '-50%'];
      } else if (topOrigin === EDGE_TRIGGER && leftOrigin === AT_TRIGGER) {
        [hiddenTranslateX, hiddenTranslateY] = ['-50%', '50%'];
      } else if (topOrigin === EDGE_TRIGGER && leftOrigin === EDGE_TRIGGER) {
        [hiddenTranslateX, hiddenTranslateY] = ['50%', '50%'];
      } else {
        hiddenTranslateX = '0%';
        hiddenTranslateY = '0%';
      }

      const menuPopupFMV = {
        hidden: {
          scale: 0,
          translateX: hiddenTranslateX,
          translateY: hiddenTranslateY,
          transition: { duration: 0.25 },
        },
        visible: { scale: 1, translateX: '0%', translateY: '0%' }
      }

      menuPopup = (
        <motion.div ref={this.menuPopup} onClick={this.onMenuPopupClick} style={popupStyle} className={menuPopupClassNames} variants={menuPopupFMV} initial="hidden" animate="visible" exit="hidden">
          {this.renderMenu()}
        </motion.div>
      )
    } else {
      menuPopup = (
        <div ref={this.menuPopup} onClick={this.onMenuPopupClick} style={popupStyle} className={menuPopupClassNames}>
          {this.renderMenu()}
        </div>
      );
    }

    return (
      <AnimatePresence key="AnimatePresence_CardItemMenuPopup">
        <div key="CardItemMenuPopup" className="relative">
          <motion.button onClick={this.onCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={cancelBtnFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
          {menuPopup}
        </div >
      </AnimatePresence>
    );
  }
}

const cancelBtnFMV = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.25 }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    popupLink: getPopupLink(state),
  }
};

const mapDispatchToProps = { updatePopup, moveLinks };

export default connect(mapStateToProps, mapDispatchToProps)(CardItemMenuPopup);
