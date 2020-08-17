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
  LIST_NAME_POPUP, ADD_POPUP,
  PC_100, PC_50, PC_33,
  MY_LIST, TRASH,
  SHOW_BLANK, SHOW_COMMANDS,
  BAR_HEIGHT,
} from '../types/const';
import { getListNames, getLinks } from '../selectors';
import { addRem, getWindowHeight, getWindowScrollHeight, throttle } from '../utils';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardItem from './CardItem';
import CardItemMenuPopup from './CardItemMenuPopup';
import StatusPopup from './StatusPopup';

import emptyBox from '../images/empty-box-sided.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkAtUrlBar from '../images/save-link-at-url-bar.svg';

class Main extends React.PureComponent {

  fetched = [];

  constructor(props) {
    super(props);

    this.state = {
      columnWidth: this.getColumnWidth(),
      paddingBottom: this.getDefaultPaddingBottom(),
    };

    this.main = React.createRef();

    this.updateColumnWidth = throttle(this.updateColumnWidth, 16);
    this.updateScrollY = throttle(this.updateScrollY, 16);
  }

  componentDidMount() {

    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, '', window.location.href);
      window.history.pushState(BACK_POPUP, '', window.location.href);
    }

    window.addEventListener('resize', this.updateColumnWidth);
    window.addEventListener('scroll', this.updateScrollY);

    this.props.fetch(true, true);
    this.fetched.push(this.props.listName);
  }

  componentDidUpdate() {
    this.updatePaddingBottom();
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
    const scrollHeight = getWindowScrollHeight()
    const windowHeight = getWindowHeight();
    const windowBottom = windowHeight + window.pageYOffset;

    if (windowBottom > (scrollHeight * 0.96)) {
      this.props.fetchMore();
    }
  }

  getDefaultPaddingBottom = () => {
    if (this.getColumnWidth() === PC_100) return addRem(BAR_HEIGHT, '1.5rem');
    return '1.5rem';
  };

  updatePaddingBottom = () => {

    if (!this.props.cardItemMenuPopupPosition) {
      const paddingBottom = this.getDefaultPaddingBottom()
      if (paddingBottom !== this.state.paddingBottom) {
        this.setState({ paddingBottom: paddingBottom });
      }
      return;
    }

    const scrollHeight = getWindowScrollHeight();
    const menuBottom = this.props.cardItemMenuPopupPosition.bottom + window.pageYOffset;

    if (menuBottom > scrollHeight) {

      const fontSize = parseFloat(window.getComputedStyle(window.document.documentElement).fontSize);

      let paddingBottom = ((menuBottom - scrollHeight) / fontSize).toString() + 'rem';
      paddingBottom = addRem(paddingBottom, this.getDefaultPaddingBottom());
      paddingBottom = addRem(paddingBottom, '1.5rem');

      const mainBottom = this.main.current.getBoundingClientRect().bottom + window.pageYOffset;
      if (mainBottom < scrollHeight) {
        const space = ((scrollHeight - mainBottom) / fontSize).toString() + 'rem';
        paddingBottom = addRem(paddingBottom, space);
      }

      if (paddingBottom !== this.state.paddingBottom) {
        this.setState({ paddingBottom: paddingBottom });
      }
    }
  };

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

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;

    this.props.updatePopup(ADD_POPUP, true);
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  };

  renderListName() {

    const { listName, isListNamePopupShown } = this.props;

    return (
      <div className="inline-block relative">
        <button onClick={this.onListNameBtnClick} className={`relative flex items-center ${isListNamePopupShown ? 'z-41' : ''} focus:outline-none focus:shadow-outline`}>
          <h2 className="text-lg text-gray-900 font-semibold">{listName}</h2>
          <svg className="ml-1 w-5 text-black" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <button onClick={this.onListNameCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default z-40 focus:outline-none"></button>
        <div onClick={this.onListNamePopupClick} className="mt-2 py-2 absolute right-0 bottom-0 w-28 bg-white border border-gray-200 rounded-lg shadow-xl transform translate-x-11/12 translate-y-full z-41">
          {this.props.listNames.map(listName => <button className="py-2 pl-4 block w-full text-gray-800 text-left hover:bg-gray-400 focus:outline-none focus:shadow-outline" key={listName} data-key={listName}>{listName}</button>)}
        </div>
      </React.Fragment>
    );
  }

  renderEmpty() {

    const { listName, searchString } = this.props;

    if (searchString !== '') {
      return (
        <React.Fragment>
          <h3 className="text-base text-gray-900">Your search - <span className="text-lg text-gray-900 font-medium">{searchString}</span> - did not match any links.</h3>
          <p className="pt-4 md:pt-6">Suggestion:</p>
          <ul className="pt-2 pl-2 list-disc list-inside">
            <li>Make sure all words are spelled correctly.</li>
            <li>Try different keywords.</li>
            <li>Try more general keywords.</li>
          </ul>
        </React.Fragment>
      );
    }

    if (listName === MY_LIST) {
      return (
        <div style={{ borderRadius: '1.5rem' }} className="mx-auto px-4 pt-16 pb-8 w-full max-w-md bg-gray-100">
          <img className="mx-auto h-16" src={undrawLink} alt="unDraw link icon" />
          <h3 className="mt-6 text-lg text-gray-900 text-center">Get started saving links</h3>
          <button onClick={this.onAddBtnClick} className="mx-auto mt-4 px-3 py-1 flex items-baseline bg-gray-900 rounded-lg shadow-lg hover:bg-gray-800 active:bg-black focus:outline-none focus:shadow-outline">
            <svg className="w-4 text-white" viewBox="0 0 16 14" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ml-1 text-xl text-white font-semibold">Save link</span>
          </button>
          <p className="mx-auto mt-16 max-w-md text-lg text-gray-900 text-center">Or type <span className="font-semibold">"brace.to/"</span> in front of any link <br className="new-line-in-address-bar" />in Address bar.</p>
          <img className="mx-auto mt-4 w-full" src={saveLinkAtUrlBar} alt="Save link at address bar" />
        </div>
      );
    }

    if (listName === TRASH) {
      return (
        <React.Fragment>
          <div className="mx-auto mt-6 flex justify-center items-center w-20 h-20 bg-gray-400 rounded-full">
            <svg className="w-10 text-gray-800" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
            </svg>
          </div>
          <h3 className="mt-6 text-lg text-gray-900 text-center">No links in Trash</h3>
          <p className="mx-auto mt-4 max-w-md text-base text-gray-900 text-center">Click <span className="font-semibold">"Remove"</span> from the Link menu to move links you don't need anymore to the Trash.</p>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <img className="mx-auto mt-10 w-40" src={emptyBox} alt="An empty box lying down" />
        <h3 className="mt-6 text-lg text-gray-900 text-center">No links in {listName}</h3>
        <p className="mx-auto mt-4 max-w-md text-base text-gray-900 text-center">Click <span className="font-semibold">"{listName}"</span> from the Link menu to move links here.</p>
      </React.Fragment>
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

    const { links, popupLink } = this.props;

    if (links === null) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(this.state.columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;
    const style = {
      paddingBottom: this.state.paddingBottom,
      transitionProperty: 'padding-bottom',
    };

    return (
      <React.Fragment>
        <TopBar rightPane={topBarRightPane} />
        <main ref={this.main} style={style} className="mx-auto px-4 pt-4 relative max-w-6xl duration-150 ease-in-out md:px-6 md:pt-6 lg:px-8">
          {this.renderListName()}
          <div className="pt-6 md:pt-10">
            {links.length === 0 && this.renderEmpty()}
            {this.renderLinks()}
          </div>
          <StatusPopup />
        </main>
        {this.state.columnWidth === PC_100 && <BottomBar isShown={popupLink === null} />}
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
    isAddPopupShown: state.display.isAddPopupShown,
    popupLink: popupLink,
    hasMoreLinks: state.hasMoreLinks[listName],
    isFetchingMore: state.display.isFetchingMore,
    searchString: state.display.searchString,
    cardItemMenuPopupPosition: state.display.cardItemMenuPopupPosition,
  };
};

const mapDispatchToProps = {
  updateHistoryPosition, fetch, fetchMore, changeListName, updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
