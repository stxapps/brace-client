import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { motion, AnimateSharedLayout } from "framer-motion"

import { fetchMore, updatePopup } from '../actions';
import {
  ADD_POPUP,
  PC_100, PC_50, PC_33,
  MY_LIST, TRASH,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH,
} from '../types/const';
import { getListNameMap, getLinks } from '../selectors';
import {
  addRem, getWindowHeight, getWindowScrollHeight, throttle, getListNameDisplayName,
} from '../utils';
import { cardItemFMV } from '../types/animConfigs';

import CardItem from './CardItem';

import emptyBox from '../images/empty-box-sided.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkInUrlBar from '../images/save-link-in-url-bar.svg';

class CardPanel extends React.PureComponent {

  constructor(props) {
    super(props);

    this.panel = React.createRef();

    this.updateScrollY = throttle(this.updateScrollY, 16);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.updateScrollY);
  }

  componentDidUpdate(prevProps) {
    if (this.props.listChangedCount !== prevProps.listChangedCount) {
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateScrollY);
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

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  };

  renderEmpty() {

    const { listName, listNameMap, searchString } = this.props;

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
          <img className="mx-auto mt-4 w-full" src={saveLinkInUrlBar} alt="Save link at address bar" />
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

    const displayName = getListNameDisplayName(listName, listNameMap);

    return (
      <React.Fragment>
        <img className="mx-auto mt-10 w-40" src={emptyBox} alt="An empty box lying down" />
        <h3 className="mt-6 text-lg text-gray-900 text-center">No links in {displayName}</h3>
        <p className="mx-auto mt-4 max-w-md text-base text-gray-900 text-center">Click <span className="font-semibold">"{displayName}"</span> from the Link menu to move links here.</p>
      </React.Fragment>
    );
  }

  renderFetchMoreBtn() {
    return (
      <button onClick={this.onFetchMoreBtnClick} className="my-4 py-2 block w-full focus:outline-none-outer">
        <span className="px-3 py-1 inline-block bg-white text-base text-gray-900 border border-gray-900 rounded-full shadow-sm hover:bg-gray-800 hover:text-white active:bg-gray-900 focus:shadow-outline-inner">More</span>
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

  renderPanel() {

    const { links, columnWidth } = this.props;

    const colData = [];
    if (links.length > 0) {
      if (columnWidth === PC_100) {
        colData.push(links);
      } else if (columnWidth === PC_50) {
        colData.push(links.filter((_, i) => i % 2 === 0));
        colData.push(links.filter((_, i) => i % 2 === 1));
      } else if (columnWidth === PC_33) {
        colData.push(links.filter((_, i) => i % 3 === 0));
        colData.push(links.filter((_, i) => i % 3 === 1));
        colData.push(links.filter((_, i) => i % 3 === 2));
      } else {
        throw new Error(`Invalid columnWidth: ${columnWidth}`);
      }
    }

    let panelClassNames;
    if (columnWidth === PC_100) panelClassNames = 'space-x-4';
    else if (columnWidth === PC_50) panelClassNames = 'space-x-6';
    else if (columnWidth === PC_33) panelClassNames = 'space-x-8';
    else throw new Error(`Invalid columnWidth: ${columnWidth}`);

    let columnClassNames;
    if (columnWidth === PC_100) columnClassNames = 'space-y-4';
    else if (columnWidth === PC_50) columnClassNames = 'space-y-6';
    else if (columnWidth === PC_33) columnClassNames = 'space-y-8';
    else throw new Error(`Invalid columnWidth: ${columnWidth}`);

    return (
      <div className={`flex justify-evenly items-start ${panelClassNames}`}>
        <AnimateSharedLayout>
          {colData.map((colItems, i) => {
            return (
              <div key={`col-${i}`} className={`w-full ${columnClassNames}`}>
                {colItems.map(link => {
                  return (
                    <motion.div key={link.id} layoutId={link.id} variants={cardItemFMV} initial="hidden" animate="visible">
                      <CardItem link={link} />
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </AnimateSharedLayout>
      </div>
    );
  }

  render() {

    const { links, hasMoreLinks, isFetchingMore, columnWidth } = this.props;

    if (links === null) {
      throw new Error(`Invalid links: ${links}. Links cannot be undefined as in LinkSelector and if links is null, it should be handled in Main, not in CardPanel.`);
    }

    const showFetchMoreBtn = hasMoreLinks && !isFetchingMore;
    const showFetchingMore = hasMoreLinks && isFetchingMore;

    let paddingBottom = '1.5rem';
    if (columnWidth === PC_100) {
      paddingBottom = addRem(SEARCH_POPUP_HEIGHT, addRem(BOTTOM_BAR_HEIGHT, '1.5rem'));
    }

    const style = {
      paddingTop: window.innerWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD,
      paddingBottom,
    };

    return (
      <div ref={this.panel} style={style} className="mx-auto px-4 relative max-w-6xl duration-150 ease-in-out md:px-6 lg:px-8">
        <div className="pt-6 md:pt-10">
          {links.length === 0 && this.renderEmpty()}
          {links.length > 0 && this.renderPanel()}
          {showFetchMoreBtn && this.renderFetchMoreBtn()}
          {showFetchingMore && this.renderFetchingMore()}
        </div>
      </div>
    );
  }
}

CardPanel.propTypes = {
  columnWidth: PropTypes.string.isRequired,
};

const mapStateToProps = (state, props) => {

  const listName = state.display.listName;

  return {
    listName: listName,
    listNameMap: getListNameMap(state),
    links: getLinks(state),
    hasMoreLinks: state.hasMoreLinks[listName],
    isFetchingMore: state.display.isFetchingMore,
    searchString: state.display.searchString,
    listChangedCount: state.display.listChangedCount,
  };
};

const mapDispatchToProps = { fetchMore, updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(CardPanel);
