import React from 'react';
import { connect } from 'react-redux';

import {
  updateHistoryPosition,
  fetch, fetchMore, changeListName,
  updatePopup,
} from '../actions';
import {
  BACK_DECIDER, BACK_POPUP,
  LIST_NAME_POPUP,
} from '../types/const';
import { getListNames, getLinks } from '../selectors';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';

class Main extends React.Component {

  fetched = [];

  componentDidMount() {

    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, null, window.location.href);
      window.history.pushState(BACK_POPUP, null, window.location.href);
    }

    // BUG:
    //this.props.fetch();
    this.fetched.push(this.props.listName);
  }

  onListNameBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, true);
  };

  onListNameDropdownClick = (e) => {

    const newListName = e.target.innerText;
    this.props.changeListName(newListName, this.fetched);
    this.fetched.push(newListName);

    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  onListNameCancelBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, false);
  };

  renderListNamePopup() {

    return (
      <div className="relative p-2">
        <button onClick={this.onListNameCancelBtnClick} tabIndex="-1" className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-10"></button>
        <div onClick={this.onListNameDropdownClick} className="absolute right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 cursor-pointer">
          {this.props.listNames.map(listName => <div key={listName}>{listName}</div>)}
        </div>
      </div>
    );
  }

  render() {

    const { isListNamePopupShown } = this.props;

    if (this.props.links === null) {
      return <Loading />;
    }

    return (
      <React.Fragment>
        <TopBar />
        <div className="p-3 flex">
          <h1 className="font-bold">Main page: {this.props.listName}</h1>
          <button onClick={this.onListNameBtnClick} className={`ml-1 px-2 bg-green-400 ${isListNamePopupShown && 'z-20'}`}>&darr;</button>
        </div>
        {isListNamePopupShown && this.renderListNamePopup()}

        <div><p>This is a main page.</p></div>
        <div><p>Card Link1</p></div>
        <div><p>Card Link2</p></div>


        <button onClick={() => this.props.updatePopup(!this.props.isPopupShown)}>Toggle popup</button>
        <div><p>Now popup shown is {String(this.props.isPopupShown)}</p></div>
        <BottomBar />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNames: getListNames(state),
    links: getLinks(state),
    isListNamePopupShown: state.display.isListNamePopupShown,
  };
};

const mapDispatchToProps = {
  updateHistoryPosition, fetch, fetchMore, changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
