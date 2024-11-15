import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopup } from '../actions';
import {
  updateSelectingLinkId, moveLinks, pinLinks, updateDeleteAction, updateListNamesMode,
  updateCustomEditorPopup, updateTagEditorPopup,
} from '../actions/chunk';
import {
  MY_LIST, TRASH, ADDING, MOVING, UPDATING, EXTRD_UPDATING, COPY_LINK, ARCHIVE, REMOVE,
  RESTORE, DELETE, MOVE_TO, CHANGE, PIN, MANAGE_PIN, PINNED, CARD_ITEM_MENU_POPUP,
  LIST_NAMES_POPUP, PIN_MENU_POPUP, CONFIRM_DELETE_POPUP, LG_WIDTH, LAYOUT_LIST,
  DELETE_ACTION_LINK_ITEM_MENU, LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
  ADD_TAGS, MANAGE_TAGS, TAGGED,
} from '../types/const';
import {
  getListNameMap, getPopupLink, getLayoutType, makeGetPinStatus, getThemeMode,
  getSafeAreaWidth, getSafeAreaHeight, makeGetTagStatus,
} from '../selectors';
import {
  copyTextToClipboard, getListNameDisplayName, isObject, isEqual, getLastHalfHeight,
} from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { withTailwind } from '.';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';

const CARD_ITEM_POPUP_MENU = {
  [MY_LIST]: [COPY_LINK, ARCHIVE, REMOVE, MOVE_TO],
  [TRASH]: [COPY_LINK, RESTORE, DELETE],
  [ARCHIVE]: [COPY_LINK, REMOVE, MOVE_TO],
};
const QUERY_STRING_MENU = [COPY_LINK, REMOVE];

class CardItemMenuPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { menuPopupSize: null };
    this.menuPopup = React.createRef();
    this.didClick = false;
  }

  componentDidMount() {
    this.updateState(this.props.isShown);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isShown && this.props.isShown) {
      this.updateState(true);
      this.didClick = false;
    }

    if (prevProps.isShown && !this.props.isShown) {
      this.updateState(false);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isShown && nextProps.isShown) {
      this.setState({ menuPopupSize: null });
    }
  }

  componentWillUnmount() {
    this.updateState(false);
  }

  updateState(isShown) {
    if (isShown) {
      if (this.menuPopup.current) {
        const menuPopupSize = this.menuPopup.current.getBoundingClientRect();
        if (!isEqual(menuPopupSize, this.state.menuPopupSize)) {
          this.setState({ menuPopupSize });
        }
      }
    }
  }

  populateMenu() {
    const {
      listName, queryString, popupLink, pinStatus, tagStatus, layoutType, safeAreaWidth,
    } = this.props;

    let menu = null;
    if (listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }
    if (queryString) menu = QUERY_STRING_MENU;

    if (
      !isObject(popupLink) ||
      [ADDING, MOVING, UPDATING, EXTRD_UPDATING].includes(popupLink.status) ||
      ![null, PINNED].includes(pinStatus) ||
      ![null, TAGGED].includes(tagStatus)
    ) {
      menu = menu.slice(0, 1);
    } else if (listName !== TRASH || queryString) {
      if (tagStatus === TAGGED) menu = [...menu, MANAGE_TAGS];
      else if (tagStatus === null) menu = [...menu, ADD_TAGS];

      if (pinStatus === PINNED) menu = [...menu, MANAGE_PIN];
      else if (pinStatus === null) menu = [...menu, PIN];

      menu = [...menu, CHANGE];
    }

    if (layoutType === LAYOUT_LIST && safeAreaWidth >= LG_WIDTH) {
      menu = menu.filter(text => ![ARCHIVE, REMOVE, RESTORE].includes(text));
    }

    return { menu };
  }

  onMenuPopupClick = (text) => {
    if (!text || this.didClick || !isObject(this.props.popupLink)) return;

    const { anchorPosition } = this.props;
    const { id, url } = this.props.popupLink;

    if (text === COPY_LINK) {
      copyTextToClipboard(url);
    } else if (text === ARCHIVE) {
      this.props.moveLinks(ARCHIVE, [id]);
    } else if (text === REMOVE) {
      this.props.moveLinks(TRASH, [id]);
    } else if (text === RESTORE) {
      this.props.moveLinks(MY_LIST, [id]);
    } else if (text === DELETE) {
      this.props.updateDeleteAction(DELETE_ACTION_LINK_ITEM_MENU);
      this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
      return;
    } else if (text === MOVE_TO) {
      this.props.updateSelectingLinkId(id);
      this.props.updateListNamesMode(
        LIST_NAMES_MODE_MOVE_LINKS, LIST_NAMES_ANIM_TYPE_POPUP,
      );

      const newX = anchorPosition.x + 8;
      const newY = anchorPosition.y + 12;
      const newWidth = anchorPosition.width - 8 - 12;
      const newHeight = anchorPosition.height - 12 - 0;
      const rect = {
        x: newX, y: newY, width: newWidth, height: newHeight,
        top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
      };
      this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
    } else if (text === PIN) {
      this.props.pinLinks([id]);
    } else if (text === MANAGE_PIN) {
      this.props.updateSelectingLinkId(id);

      const newX = anchorPosition.x + 8;
      const newY = anchorPosition.y + 12;
      const newWidth = anchorPosition.width - 8 - 12;
      const newHeight = anchorPosition.height - 12 - 0;
      const rect = {
        x: newX, y: newY, width: newWidth, height: newHeight,
        top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
      };
      this.props.updatePopup(PIN_MENU_POPUP, true, rect);
    } else if (text === ADD_TAGS || text === MANAGE_TAGS) {
      this.props.updateSelectingLinkId(id);
      this.props.updateTagEditorPopup(true, text === ADD_TAGS);
    } else if (text === CHANGE) {
      this.props.updateCustomEditorPopup(true, id);
    } else {
      console.log(`In CardItemMenuPopup, invalid text: ${text}`);
    }

    this.props.updatePopup(CARD_ITEM_MENU_POPUP, false);
    this.didClick = true;
  };

  onCancelBtnClick = () => {
    // In Chrome desktop, touch mode,
    //   double clicks on menu popup, the second click is on cancelBtn.
    this.props.updatePopup(CARD_ITEM_MENU_POPUP, false);
  };

  renderMenu() {
    const { listNameMap, tailwind } = this.props;
    const { menu } = this.populateMenu();

    return (
      <React.Fragment>
        {menu.map(text => {
          let displayText = text;
          if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
          return <button key={text} onClick={() => this.onMenuPopupClick(text)} className={tailwind('block w-full truncate rounded-md py-2.5 pl-4 pr-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')}>{displayText}</button>;
        })}
      </React.Fragment>
    );
  }

  render() {
    const {
      isShown, anchorPosition, safeAreaWidth, safeAreaHeight, tailwind,
    } = this.props;
    if (!isShown) return (
      <AnimatePresence key="AnimatePresence_CIMP_menuPopup" />
    );

    const { menuPopupSize } = this.state;

    let popupClassNames = 'fixed z-41 min-w-32 max-w-64 overflow-auto rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';
    let menuPopup;
    if (menuPopupSize) {
      const maxHeight = getLastHalfHeight(safeAreaHeight - 16, 40, 8, 0, 0.55);
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
      const popupStyle = { top, left, maxHeight };
      popupClassNames += ' ' + getOriginClassName(topOrigin, leftOrigin);

      menuPopup = (
        <motion.div key="CIMP_menuPopup" ref={this.menuPopup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          {this.renderMenu()}
        </motion.div>
      )
    } else {
      menuPopup = (
        <div key="CIMP_menuPopup" ref={this.menuPopup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={tailwind(popupClassNames)}>
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
  const getTagStatus = makeGetTagStatus();

  const mapStateToProps = (state, props) => {
    const popupLink = getPopupLink(state);
    const pinStatus = getPinStatus(state, popupLink);
    const tagStatus = getTagStatus(state, popupLink);

    return {
      isShown: state.display.isCardItemMenuPopupShown,
      anchorPosition: state.display.cardItemMenuPopupPosition,
      listName: state.display.listName,
      queryString: state.display.queryString,
      listNameMap: getListNameMap(state),
      popupLink,
      pinStatus,
      tagStatus,
      layoutType: getLayoutType(state),
      themeMode: getThemeMode(state),
      safeAreaWidth: getSafeAreaWidth(state),
      safeAreaHeight: getSafeAreaHeight(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = {
  updatePopup, updateSelectingLinkId, moveLinks, pinLinks, updateDeleteAction,
  updateListNamesMode, updateCustomEditorPopup, updateTagEditorPopup,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemMenuPopup));
