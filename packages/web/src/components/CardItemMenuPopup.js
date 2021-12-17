import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";

import { updatePopup, updateSelectingLinkId, moveLinks } from '../actions';
import {
  MY_LIST, TRASH, ADDING, MOVING,
  OPEN, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO,
  CARD_ITEM_POPUP_MENU, LIST_NAMES_POPUP, CONFIRM_DELETE_POPUP,
  LG_WIDTH, LAYOUT_LIST,
} from '../types/const';
import { getListNameMap, getPopupLink } from '../selectors';
import {
  copyTextToClipboard, ensureContainUrlProtocol, getListNameDisplayName, getAllListNames,
  isEqual, throttle, getLastHalfHeight,
} from '../utils';
import { popupBgFMV, getPopupFMV } from '../types/animConfigs';
import { computePosition, createLayouts } from './MenuPopupRenderer';

class CardItemMenuPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialScrollY = window.pageYOffset;
    this.state = {
      scrollY: this.initialScrollY,
      menuPopupSize: null,
    };

    this.menuPopup = React.createRef();
    this.updateScrollY = throttle(this.updateScrollY, 16);

    this.didClick = false;
  }

  componentDidMount() {
    this.updateState(this.props.popupLink !== null);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.popupLink && this.props.popupLink) {
      this.updateState(true);
      this.didClick = false;
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
      window.addEventListener('scroll', this.updateScrollY);
    } else {
      window.removeEventListener('scroll', this.updateScrollY);
    }
  }

  updateScrollY = () => {
    this.setState({ scrollY: window.pageYOffset });
  }

  populateMenu() {

    const { listName, listNameMap, popupLink, layoutType } = this.props;

    let menu = null;
    if (listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }

    if (listName === MY_LIST && getAllListNames(listNameMap).length === 3) {
      menu = menu.slice(0, -1);
    }

    if ([ADDING, MOVING].includes(popupLink.status)) {
      menu = menu.slice(0, 2);
    }

    if (layoutType === LAYOUT_LIST && window.innerWidth >= LG_WIDTH) {
      menu = menu.filter(text => ![ARCHIVE, REMOVE, RESTORE].includes(text));
    }

    return { menu };
  }

  onMenuPopupClick = (text) => {
    if (!text || this.didClick) return;

    const { id, url, popupAnchorPosition } = this.props.popupLink;

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
    } else if (text === MOVE_TO) {
      this.props.updateSelectingLinkId(id);

      const newX = popupAnchorPosition.x + 16;
      const newY = popupAnchorPosition.y + 8;
      const rect = {
        x: newX, y: newY,
        width: popupAnchorPosition.width - 16 - 8,
        height: popupAnchorPosition.height - 8,
        top: newY, bottom: popupAnchorPosition.bottom,
        left: newX, right: popupAnchorPosition.right - 8,
      };
      this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
    } else {
      throw new Error(`Invalid text: ${text}`);
    }

    this.props.updatePopup(id, false);
    this.didClick = true;
  };

  onCancelBtnClick = () => {
    // In Chrome desktop, touch mode,
    //   double clicks on menu popup, the second click is on cancelBtn.
    if (this.props.popupLink) this.props.updatePopup(this.props.popupLink.id, false);
  };

  renderMenu() {

    const { listNameMap } = this.props;
    const { menu } = this.populateMenu();

    return (
      <React.Fragment>
        {menu.map(text => {
          let displayText = text;
          if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
          return <button key={text} onClick={() => this.onMenuPopupClick(text)} className="py-2.5 pl-4 pr-4 block w-full text-sm text-gray-700 text-left truncate rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset">{displayText}</button>;
        })}
      </React.Fragment>
    );
  }

  render() {

    const { popupLink } = this.props;
    if (!popupLink) return (
      <AnimatePresence key="AnimatePresence_CIMP_menuPopup" />
    );

    const { scrollY, menuPopupSize } = this.state;
    const menuPopupClassNames = 'py-2 fixed min-w-32 max-w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-auto z-41';

    let menuPopup;
    if (menuPopupSize) {

      const maxHeight = getLastHalfHeight(
        Math.min(288, window.innerHeight - 16), 36, 8, 0
      );

      const anchorPosition = popupLink.popupAnchorPosition;
      const layouts = createLayouts(
        anchorPosition,
        { width: menuPopupSize.width, height: Math.min(menuPopupSize.height, maxHeight) }
      );
      const triggerOffsets = { x: 8, y: (16 - 4), width: -1 * (16 + 8 - 4), height: -6 };
      const popupPosition = computePosition(layouts, triggerOffsets, 8);

      const { top, left, topOrigin, leftOrigin } = popupPosition;
      const offsetScrollY = this.initialScrollY - scrollY;
      const popupStyle = { top: top + offsetScrollY, left: left, maxHeight };

      const popupFMV = getPopupFMV(topOrigin, leftOrigin);

      menuPopup = (
        <motion.div key="CIMP_menuPopup" ref={this.menuPopup} style={popupStyle} className={menuPopupClassNames} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          {this.renderMenu()}
        </motion.div>
      )
    } else {
      menuPopup = (
        <div key="CIMP_menuPopup" ref={this.menuPopup} className={menuPopupClassNames}>
          {this.renderMenu()}
        </div>
      );
    }

    return (
      <AnimatePresence key="AnimatePresence_CIMP_menuPopup">
        <motion.button key="CIMP_cancelBtn" onClick={this.onCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        {menuPopup}
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    popupLink: getPopupLink(state),
    layoutType: state.localSettings.layoutType,
  }
};

const mapDispatchToProps = { updatePopup, updateSelectingLinkId, moveLinks };

export default connect(mapStateToProps, mapDispatchToProps)(CardItemMenuPopup);
