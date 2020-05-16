import React from 'react';
import { connect } from 'react-redux';

import {
  updatePopup,
  moveLinks, deleteLinks,
} from '../actions';
import {
  CONFIRM_DELETE_POPUP,
  MY_LIST, TRASH,
  ADDING, MOVING,
  OPEN, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO,
  CARD_ITEM_POPUP_MENU,
} from '../types/const';
import { copyTextToClipboard } from '../utils';

const MOVE_TO_LABEL = 'MOVE_TO_LABEL';

class CardItemMenuPopup extends React.Component {

  constructor(props) {
    super(props);

    this.initialScrollY = window.pageYOffset;
    this.state = { scrollY: this.initialScrollY };

    const { menu, moveTo } = this.populateMenu(props);
    this.menu = menu;
    this.moveTo = moveTo;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.updateScrollY);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateScrollY);
  }

  populateMenu(props) {
    let menu = null;
    if (props.listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[props.listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }
    if ([ADDING, MOVING].includes(props.link.status)) {
      menu = menu.slice(0, 2);
    }

    const moveTo = [];
    if (menu.includes(MOVE_TO)) {
      for (const listName of props.listNames) {
        if ([TRASH, ARCHIVE].includes(listName)) continue;
        if (props.listName === listName) continue;

        moveTo.push(listName);
      }
    }

    menu = menu.filter(text => text !== MOVE_TO);

    return { menu, moveTo };
  }

  updateScrollY = () => {
    this.setState({ scrollY: window.pageYOffset });
  }

  onMenuPopupClick = (e) => {

    const text = e.target.getAttribute('data-key');
    if (text === MOVE_TO_LABEL) return;

    const { id, url } = this.props.link;

    if (text === OPEN) {
      window.open(url);
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

    this.props.updatePopup(this.props.link.id, false);
  };

  onCancelBtnClick = () => {
    this.props.updatePopup(this.props.link.id, false);
  };

  onConfirmDeleteOkBtnClick = () => {
    this.props.deleteLinks([this.props.link.id]);
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
    this.props.updatePopup(this.props.link.id, false);
  };

  onConfirmDeleteCancelBtnClick = () => {
    this.props.updatePopup(CONFIRM_DELETE_POPUP, false);
  };

  renderMenu() {

    let moveTo = null;
    if (this.moveTo && this.moveTo.length) {
      moveTo = (
        <React.Fragment>
          <li key={MOVE_TO_LABEL} data-key={MOVE_TO_LABEL}>{MOVE_TO}</li>
          {this.moveTo.map(text => {
            const key = MOVE_TO + ' ' + text;
            return <li key={key} data-key={key}>{text}</li>;
          })}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {this.menu.map(text => <li key={text} data-key={text}>{text}</li>)}
        {moveTo && moveTo}
      </React.Fragment>
    );
  }

  renderConfirmDeletePopup() {
    return (
      <React.Fragment>
        <button onClick={this.onConfirmDeleteCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-50"></button>
        <div className="fixed top-1/2 left-1/2 w-full max-w-xs h-20 bg-white transform -translate-x-1/2 -translate-y-1/2 z-51">
          <p>Confirm delete?</p>
          <button onClick={this.onConfirmDeleteOkBtnClick}>Yes</button>
          <button onClick={this.onConfirmDeleteCancelBtnClick}>No</button>
        </div>
      </React.Fragment>
    );
  }

  render() {

    const anchorPosition = this.props.link.popupAnchorPosition;

    const offsetScrollY = this.initialScrollY - this.state.scrollY;
    const windowWidth = window.innerWidth;
    const menuBtnWidth = 48;
    const menuBtnHeight = 40;
    const popupWidth = 192;
    const popupRightMargin = 10;

    const menuBtnPosition = {
      top: `${anchorPosition.top + offsetScrollY}px`, left: `${anchorPosition.left}px`
    };

    let left = anchorPosition.left;
    if (left + popupWidth + popupRightMargin >= windowWidth) {
      left = left - popupWidth + menuBtnWidth;
    }
    const popupPosition = {
      top: `${anchorPosition.top + offsetScrollY + menuBtnHeight}px`, left: `${left}px`
    };

    return (
      <div className="relative">
        <button onClick={this.onCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-40"></button>
        <button style={menuBtnPosition} className="fixed pl-4 pr-2 pt-4 pb-2 bg-white z-41">
          <svg className="w-6 text-gray-600" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ul onClick={this.onMenuPopupClick} style={popupPosition} className="fixed mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-41 cursor-pointer">
          {this.renderMenu()}
        </ul>
        {this.props.isConfirmDeletePopupShown && this.renderConfirmDeletePopup()}
      </div >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isConfirmDeletePopupShown: state.display.isConfirmDeletePopupShown,
  }
};

const mapDispatchToProps = {
  updatePopup, moveLinks, deleteLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(CardItemMenuPopup);
