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
    window.addEventListener('scroll', this.updateScrollY);

    // BUG:
    this.props.fetch();
    this.fetched.push(this.props.listName);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateColumnWidth);
    window.removeEventListener('scroll', this.updateScrollY);
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

  updateScrollY = () => {

    // if has more, not fetching more, and at the bottom
    const { hasMoreLinks, isFetchingMore } = this.props;
    if (!hasMoreLinks || isFetchingMore) {
      return;
    }

    // https://gist.github.com/enqtran/25c6b222a73dc497cc3a64c090fb6700
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    const windowBottom = windowHeight + window.pageYOffset;

    if (windowBottom > (docHeight * 0.96)) {
      this.props.fetchMore();
    }
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

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
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

  renderEmpty() {

    const { searchString } = this.props;

    if (searchString !== '') {
      return (
        <div>
          <h3>Search not found!</h3>
          <p>No links contains search words.</p>
        </div>
      );
    }

    return (
      <div>
        <h3>Empty</h3>
        <p>Save a link now!</p>
      </div>
    );
  }

  renderLinks() {

    const { listName, listNames, links, popupLink } = this.props;
    const { hasMoreLinks, isFetchingMore } = this.props;

    const showFetchMoreBtn = hasMoreLinks && !isFetchingMore;
    const showFetchingMore = hasMoreLinks && isFetchingMore;

    return (
      <React.Fragment>
        <StackGrid columnWidth={this.state.columnWidth}>
          {links.map(link => <CardItem key={link.id} link={link} />)}
        </StackGrid>
        {popupLink && <CardItemMenuPopup listName={listName} listNames={listNames} link={popupLink} />}
        {showFetchMoreBtn && <button onClick={this.onFetchMoreBtnClick}>More</button>}
        {showFetchingMore && <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>}
      </React.Fragment>
    );
  }

  render() {

    const { listName, links, isListNamePopupShown } = this.props;

    if (links === null) {
      return <Loading />;
    }

    const isEmpty = links.length === 0;

    return (
      <React.Fragment>
        <TopBar />
        <div className="p-3 flex">
          <h1 className="font-bold">Main page: {listName}</h1>
          <button onClick={this.onListNameBtnClick} className={`ml-1 px-2 bg-green-400 ${isListNamePopupShown && 'z-20'}`}>&darr;</button>
        </div>
        {isListNamePopupShown && this.renderListNamePopup()}

        <div><p>This is a main page.</p></div>
        {isEmpty && this.renderEmpty()}
        {!isEmpty && this.renderLinks()}
        <BottomBar />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const listName = state.display.listName;
  const { links, popupLink } = getLinks(state);

  return {
    listName: listName,
    listNames: getListNames(state),
    links: links,
    isListNamePopupShown: state.display.isListNamePopupShown,
    popupLink: popupLink,
    hasMoreLinks: state.hasMoreLinks[listName],
    isFetchingMore: state.display.isFetchingMore,
    searchString: state.display.searchString,
  };
};

const mapDispatchToProps = {
  updateHistoryPosition, fetch, fetchMore, changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
