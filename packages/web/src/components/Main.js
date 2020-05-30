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
  PC_100, PC_50, PC_33,
  TRASH,
  SHOW_BLANK, SHOW_COMMANDS,
  BAR_HEIGHT,
} from '../types/const';
import { getListNames, getLinks } from '../selectors';
import { addRem } from '../utils';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardItem from './CardItem';
import CardItemMenuPopup from './CardItemMenuPopup';
import StatusPopup from './StatusPopup';

class Main extends React.Component {

  fetched = [];

  constructor(props) {
    super(props);

    this.state = { columnWidth: this.getColumnWidth() };
  }

  componentDidMount() {

    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, '', window.location.href);
      window.history.pushState(BACK_POPUP, '', window.location.href);
    }

    window.addEventListener('resize', this.updateColumnWidth);
    window.addEventListener('scroll', this.updateScrollY);

    this.props.fetch(true);
    this.fetched.push(this.props.listName);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateColumnWidth);
    window.removeEventListener('scroll', this.updateScrollY);
  }

  getColumnWidth = () => {
    let columnWidth = PC_100;
    if (window.innerWidth >= 640) columnWidth = PC_50;
    if (window.innerWidth >= 1024) columnWidth = PC_33;

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

    const newListName = e.target.getAttribute('data-key');
    if (!newListName) return;

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

  renderListName() {

    const { listName, isListNamePopupShown } = this.props;

    return (
      <div className="inline-block relative">
        <button onClick={this.onListNameBtnClick} className={`relative flex items-center ${isListNamePopupShown ? 'z-41' : ''} focus:outline-none focus:shadow-outline`}>
          <h2 className="text-lg text-gray-900 font-semibold">{listName}</h2>
          <svg className="ml-1 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isListNamePopupShown && this.renderListNamePopup()}
      </div>
    );
  }

  renderListNamePopup() {

    return (
      <React.Fragment>
        <button onClick={this.onListNameCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-50 cursor-default z-40 focus:outline-none"></button>
        <div onClick={this.onListNamePopupClick} className="mt-2 py-2 absolute right-0 bottom-0 w-28 bg-white cursor-pointer border border-gray-200 rounded-lg shadow-xl transform translate-x-11/12 translate-y-full z-41">
          {this.props.listNames.map(listName => <button className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline" key={listName} data-key={listName}>{listName}</button>)}
        </div>
      </React.Fragment>
    );
  }

  renderEmpty() {

    const { listName, searchString } = this.props;

    if (searchString !== '') {
      return (
        <div>
          <h3>Search not found!</h3>
          <p>No links contains search words.</p>
        </div>
      );
    }

    if (listName === TRASH) {
      return (
        <div>
          <h3>Empty trash</h3>
          <p>There is no removed link!</p>
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

  renderFetchMoreBtn() {
    return (
      <button onClick={this.onFetchMoreBtnClick} className="my-4 py-2 block w-full focus:outline-none-outer">
        <span className="px-3 py-1 inline-block text-base text-gray-900 border border-gray-900 rounded-full shadow-sm hover:bg-gray-800 hover:text-white active:bg-gray-900 focus:shadow-outline-inner">More</span>
      </button>
    );
  }

  renderFetchingMore() {
    return (
      <div className="flex justify-center items-center">
        <div className="lds-ellipsis">
          <div className="bg-gray-600"></div>
          <div className="bg-gray-600"></div>
          <div className="bg-gray-600"></div>
          <div className="bg-gray-600"></div>
        </div>
      </div>
    );
  }

  renderLinks() {

    const { listName, listNames, links, popupLink } = this.props;
    const { hasMoreLinks, isFetchingMore } = this.props;

    const { columnWidth } = this.state;

    const showFetchMoreBtn = hasMoreLinks && !isFetchingMore;
    const showFetchingMore = hasMoreLinks && isFetchingMore;

    let gutterWidth, gutterHeight;
    if (columnWidth === PC_100) [gutterWidth, gutterHeight] = [16, 16];
    else if (columnWidth === PC_50) [gutterWidth, gutterHeight] = [24, 24];
    else if (columnWidth === PC_33) [gutterWidth, gutterHeight] = [32, 32];
    else throw new Error(`Invalid columnWidth: ${columnWidth}`);

    return (
      <React.Fragment>
        <StackGrid className={links.length === 0 ? 'hidden' : ''} columnWidth={columnWidth} gutterWidth={gutterWidth} gutterHeight={gutterHeight}>
          {links.map(link => <CardItem key={link.id} link={link} />)}
        </StackGrid>
        {popupLink && <CardItemMenuPopup listName={listName} listNames={listNames} link={popupLink} />}
        {showFetchMoreBtn && this.renderFetchMoreBtn()}
        {showFetchingMore && this.renderFetchingMore()}
      </React.Fragment>
    );
  }

  render() {

    const { links } = this.props;

    if (links === null) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(this.state.columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;
    const style = { paddingBottom: addRem(BAR_HEIGHT, '1.5rem') };

    return (
      <React.Fragment>
        <TopBar rightPane={topBarRightPane} />
        <main style={style} className="mx-auto px-4 pt-4 max-w-6xl md:px-6 md:pt-6 lg:px-8">
          {this.renderListName()}
          <div className="pt-6 md:pt-10">
            {links.length === 0 && this.renderEmpty()}
            {this.renderLinks()}
          </div>
        </main>
        {this.state.columnWidth === PC_100 && <BottomBar />}
        <StatusPopup />
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
