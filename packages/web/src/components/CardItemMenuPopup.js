import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopup, updateSelectingLinkId, moveLinks, pinLinks, updateDeleteAction,
  updateListNamesMode,
} from '../actions';
import {
  MY_LIST, TRASH, ADDING, MOVING, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE,
  MOVE_TO, PIN, MANAGE_PIN, PINNED, CARD_ITEM_POPUP_MENU, LIST_NAMES_POPUP,
  PIN_MENU_POPUP, CONFIRM_DELETE_POPUP, LG_WIDTH, LAYOUT_LIST,
  DELETE_ACTION_LINK_COMMANDS, LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
} from '../types/const';
import {
  getListNameMap, getPopupLink, getDoEnableExtraFeatures, makeGetPinStatus,
} from '../selectors';
import {
  copyTextToClipboard, getListNameDisplayName, getAllListNames,
  isEqual, throttle, getLastHalfHeight,
} from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { withTailwind } from '.';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';

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

    const {
      listName, listNameMap, popupLink, pinStatus, layoutType, safeAreaWidth,
      doEnableExtraFeatures,
    } = this.props;

    let menu = null;
    if (listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }

    if (listName === MY_LIST && getAllListNames(listNameMap).length === 3) {
      menu = menu.slice(0, -1);
    }

    if (
      [ADDING, MOVING].includes(popupLink.status) ||
      ![null, PINNED].includes(pinStatus)
    ) {
      menu = menu.slice(0, 1);
    } else if (listName !== TRASH) {
      // Only when no other pending actions and list name is not TRASH
      if (pinStatus === PINNED) menu = [...menu, MANAGE_PIN];
      else if (doEnableExtraFeatures && pinStatus === null) menu = [...menu, PIN];
    }

    if (layoutType === LAYOUT_LIST && safeAreaWidth >= LG_WIDTH) {
      menu = menu.filter(text => ![ARCHIVE, REMOVE, RESTORE].includes(text));
    }

    return { menu };
  }

  onMenuPopupClick = (text) => {
    if (!text || this.didClick) return;

    const { id, url, popupAnchorPosition } = this.props.popupLink;

    if (text === COPY_LINK) {
      copyTextToClipboard(url);
    } else if (text === ARCHIVE) {
      this.props.moveLinks(ARCHIVE, [id]);
    } else if (text === REMOVE) {
      this.props.moveLinks(TRASH, [id]);
    } else if (text === RESTORE) {
      this.props.moveLinks(MY_LIST, [id]);
    } else if (text === DELETE) {
      this.props.updateDeleteAction(DELETE_ACTION_LINK_COMMANDS);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
      return;
    } else if (text === MOVE_TO) {
      this.props.updateSelectingLinkId(id);
      this.props.updateListNamesMode(
        LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
      );

      const newX = popupAnchorPosition.x + 8;
      const newY = popupAnchorPosition.y + 12;
      const newWidth = popupAnchorPosition.width - 8 - 12;
      const newHeight = popupAnchorPosition.height - 12 - 0;
      const rect = {
        x: newX, y: newY, width: newWidth, height: newHeight,
        top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
      };
      this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
    } else if (text === PIN) {
      this.props.pinLinks([id]);
    } else if (text === MANAGE_PIN) {
      this.props.updateSelectingLinkId(id);

      const newX = popupAnchorPosition.x + 8;
      const newY = popupAnchorPosition.y + 12;
      const newWidth = popupAnchorPosition.width - 8 - 12;
      const newHeight = popupAnchorPosition.height - 12 - 0;
      const rect = {
        x: newX, y: newY, width: newWidth, height: newHeight,
        top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
      };
      this.props.updatePopup(PIN_MENU_POPUP, true, rect);
    } else {
      console.log(`In CardItemMenuPopup, invalid text: ${text}`);
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
    const { listNameMap, tailwind } = this.props;
    const { menu } = this.populateMenu();

    return (
      <React.Fragment>
        {menu.map(text => {
          let displayText = text;
          if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
          return <button key={text} onClick={() => this.onMenuPopupClick(text)} className={tailwind('block w-full truncate rounded-md py-2.5 pl-4 pr-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset')}>{displayText}</button>;
        })}
      </React.Fragment>
    );
  }

  render() {
    const { popupLink, safeAreaWidth, safeAreaHeight, tailwind } = this.props;
    if (!popupLink) return (
      <AnimatePresence key="AnimatePresence_CIMP_menuPopup" />
    );

    const { scrollY, menuPopupSize } = this.state;

    let popupClassNames = 'fixed z-41 min-w-32 max-w-64 overflow-auto rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5';
    let menuPopup;
    if (menuPopupSize) {

      const maxHeight = getLastHalfHeight(Math.min(288, safeAreaHeight - 16), 40, 8, 8);

      const anchorPosition = popupLink.popupAnchorPosition;
      const layouts = createLayouts(
        anchorPosition,
        {
          width: menuPopupSize.width,
          height: Math.min(menuPopupSize.height, maxHeight),
        },
        { width: safeAreaWidth, height: safeAreaHeight },
      );
      const triggerOffsets = { x: 8, y: 12, width: -20, height: -12 };
      const popupPosition = computePosition(layouts, triggerOffsets, 8);

      const { top, left, topOrigin, leftOrigin } = popupPosition;
      const offsetScrollY = this.initialScrollY - scrollY;
      const popupStyle = { top: top + offsetScrollY, left: left, maxHeight };
      popupClassNames += ' ' + getOriginClassName(topOrigin, leftOrigin);

      menuPopup = (
        <motion.div key="CIMP_menuPopup" ref={this.menuPopup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          {this.renderMenu()}
        </motion.div>
      )
    } else {
      menuPopup = (
        <div key="CIMP_menuPopup" ref={this.menuPopup} className={tailwind(popupClassNames)}>
          {this.renderMenu()}
        </div>
      );
    }

    return (
      <AnimatePresence key="AnimatePresence_CIMP_menuPopup">
        <motion.button key="CIMP_cancelBtn" onClick={this.onCancelBtnClick} tabIndex={-1} className={tailwind('fixed inset-0 z-40 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        {menuPopup}
      </AnimatePresence>
    );
  }
}

const makeMapStateToProps = () => {

  const getPinStatus = makeGetPinStatus();

  const mapStateToProps = (state, props) => {
    const popupLink = getPopupLink(state);
    const pinStatus = getPinStatus(state, popupLink);
    const doEnableExtraFeatures = getDoEnableExtraFeatures(state);

    return {
      listName: state.display.listName,
      listNameMap: getListNameMap(state),
      popupLink,
      pinStatus,
      layoutType: state.localSettings.layoutType,
      safeAreaWidth: state.window.width,
      safeAreaHeight: state.window.height,
      doEnableExtraFeatures,
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = {
  updatePopup, updateSelectingLinkId, moveLinks, pinLinks, updateDeleteAction,
  updateListNamesMode,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemMenuPopup));
