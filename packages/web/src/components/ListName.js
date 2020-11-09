import React from 'react';
import { connect } from 'react-redux';

import {
  changeListName, updatePopup,
} from '../actions';
import {
  LIST_NAME_POPUP,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName, getLongestListNameDisplayName } from '../utils';

class ListName extends React.PureComponent {

  onListNameBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, true);
  };

  onListNamePopupClick = (e) => {

    const newListName = e.target.getAttribute('data-key');
    if (!newListName) return;

    this.props.changeListName(newListName, this.props.fetched);
    this.props.fetched.push(newListName);

    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  onListNameCancelBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  renderListNamePopup() {

    const { listNameMap } = this.props;
    const longestDisplayNameLength = getLongestListNameDisplayName(listNameMap).length;

    const popupStyle = { width: '7rem', maxHeight: '16rem' };
    if (longestDisplayNameLength > 7) {
      // Approx 10px or 0.625rem per additional character
      const width = Math.min(7 + 0.625 * (longestDisplayNameLength - 7), 16);
      popupStyle.width = `${width}rem`;
    }

    return (
      <React.Fragment>
        <button onClick={this.onListNameCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none"></button>
        <div onClick={this.onListNamePopupClick} style={popupStyle} className="mt-2 py-2 absolute right-0 bottom-0 bg-white border border-gray-200 rounded-lg shadow-xl overflow-auto transform translate-x-11/12 translate-y-full z-41">
          {listNameMap.map(listNameObj => <button className="py-2 pl-4 pr-2 block w-full text-gray-800 text-left truncate hover:bg-gray-400 focus:outline-none focus:shadow-outline" key={listNameObj.listName} data-key={listNameObj.listName}>{listNameObj.displayName}</button>)}
        </div>
      </React.Fragment>
    );
  }

  render() {

    const { listName, listNameMap, isListNamePopupShown } = this.props;
    const displayName = getListNameDisplayName(listName, listNameMap);

    return (
      <div className="inline-block relative">
        <button onClick={this.onListNameBtnClick} className={`relative flex items-center rounded ${isListNamePopupShown ? 'z-41' : ''} hover:shadow-outline focus:outline-none focus:shadow-outline`}>
          <h2 className="max-w-40 text-lg text-gray-900 font-semibold leading-7 truncate sm:max-w-xs lg:max-w-lg">{displayName}</h2>
          <svg className="ml-1 w-5 text-black" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isListNamePopupShown && this.renderListNamePopup()}
      </div>
    );
  }
}

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
