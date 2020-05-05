import React from 'react';
import { connect } from 'react-redux';
import StackGrid from "react-stack-grid";

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
import CardItem from './CardItem';
import CardItemMenuPopup from './CardItemMenuPopup';

class Main extends React.Component {

  fetched = [];

  constructor(props) {
    super(props);

    this.state = { columnWidth: this.getColumnWidth() };
  }

  componentDidMount() {

    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, null, window.location.href);
      window.history.pushState(BACK_POPUP, null, window.location.href);
    }

    window.addEventListener('resize', this.updateColumnWidth);

    // BUG:
    //this.props.fetch();
    this.fetched.push(this.props.listName);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateColumnWidth);
  }

  getColumnWidth = () => {
    let columnWidth = '100%';
    if (window.innerWidth >= 640) {
      columnWidth = '50%';
    }
    if (window.innerWidth >= 768) {
      columnWidth = '33%';
    }
    return columnWidth;
  }

  updateColumnWidth = () => {
    this.setState({ columnWidth: this.getColumnWidth() });
  }

  onListNameBtnClick = () => {
    this.props.updatePopup(LIST_NAME_POPUP, true);
  };

  onListNamePopupClick = (e) => {

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
      <div className="relative">
        <button onClick={this.onListNameCancelBtnClick} tabIndex="-1" className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default focus:outline-none z-10"></button>
        <div onClick={this.onListNamePopupClick} className="absolute right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 cursor-pointer">
          {this.props.listNames.map(listName => <div key={listName}>{listName}</div>)}
        </div>
      </div>
    );
  }

  render() {

    const { listName, listNames, links, isListNamePopupShown, popupLink } = this.props;

    if (links === null) {
      return <Loading />;
    }

    return (
      <React.Fragment>
        <TopBar />
        <div className="p-3 flex">
          <h1 className="font-bold">Main page: {listName}</h1>
          <button onClick={this.onListNameBtnClick} className={`ml-1 px-2 bg-green-400 ${isListNamePopupShown && 'z-20'}`}>&darr;</button>
        </div>
        {isListNamePopupShown && this.renderListNamePopup()}

        <div><p>This is a main page.</p></div>

        <StackGrid columnWidth={this.state.columnWidth}>
          {links.map(link => <CardItem key={link.id} link={link} />)}
        </StackGrid>
        {popupLink && <CardItemMenuPopup listName={listName} listNames={listNames} link={popupLink} />}
        <BottomBar />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const { links, popupLink } = getLinks(state);

  return {
    listName: state.display.listName,
    listNames: getListNames(state),
    links: links,
    isListNamePopupShown: state.display.isListNamePopupShown,
    popupLink: popupLink,
  };
};

const mapDispatchToProps = {
  updateHistoryPosition, fetch, fetchMore, changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
