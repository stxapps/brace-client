import React from 'react';
import { connect } from 'react-redux';

import {
  changeListName, updatePopup,
} from '../actions';
import {
  LIST_NAME_POPUP,
} from '../types/const';
import { getListNames } from '../selectors';

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

    return (
      <React.Fragment>
        <button onClick={this.onListNameCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none"></button>
        <div onClick={this.onListNamePopupClick} className="mt-2 py-2 absolute right-0 bottom-0 w-28 bg-white border border-gray-200 rounded-lg shadow-xl transform translate-x-11/12 translate-y-full z-41">
          {this.props.listNames.map(listName => <button className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline" key={listName} data-key={listName}>{listName}</button>)}
        </div>
      </React.Fragment>
    );
  }

  render() {

    const { listName, isListNamePopupShown } = this.props;

    return (
      <div className="inline-block relative">
        <button onClick={this.onListNameBtnClick} className={`relative flex items-center rounded ${isListNamePopupShown ? 'z-41' : ''} hover:shadow-outline focus:outline-none focus:shadow-outline`}>
          <h2 className="text-lg text-gray-900 font-semibold leading-7">{listName}</h2>
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
    listNames: getListNames(state),
    isListNamePopupShown: state.display.isListNamePopupShown,
  }
};

const mapDispatchToProps = {
  changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(ListName);
