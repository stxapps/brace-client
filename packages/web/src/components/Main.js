import React from 'react';
import { connect } from 'react-redux';

import {
  updateHistoryPosition,
  fetch, fetchMore, changeListName,
  updatePopup
} from '../actions';
import { BACK_DECIDER, BACK_POPUP } from '../types/const';
import { getListNames, getLinks } from '../selectors';

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

    this.props.fetch();
    this.fetched.push(this.props.listName);
  }

  onListNameDropdownClick(e) {
    const newListName = e.target.value;
    this.props.changeListName(newListName, this.fetched);
    this.fetched.push(newListName);
  }

  render() {
    return (
      <React.Fragment>
        <TopBar />
        <div className="p-3"><h1 className="font-bold">Main page</h1></div>

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
    isPopupShown: state.display.isPopupShown,
  }
};

const mapDispatchToProps = {
  updateHistoryPosition, fetch, fetchMore, changeListName, updatePopup,
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
