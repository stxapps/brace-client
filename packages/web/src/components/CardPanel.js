import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { motion, AnimateSharedLayout } from "framer-motion";

import { fetchMore, updateFetchedMore } from '../actions';
import {
  PC_100, PC_50, PC_33,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH,
} from '../types/const';
import { getLinks, getIsFetchingMore } from '../selectors';
import { addRem, getWindowHeight, getWindowScrollHeight, throttle } from '../utils';
import { cardItemFMV } from '../types/animConfigs';
import vars from '../vars';

import CardItem from './CardItem';
import EmptyContent from './EmptyContent';

class CardPanel extends React.PureComponent {

  constructor(props) {
    super(props);

    this.updateScrollY = throttle(this.updateScrollY, 16);
    this.doPreventFetchMore = false;
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    window.addEventListener('scroll', this.updateScrollY);

    this.doPreventFetchMore = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.listChangedCount !== prevProps.listChangedCount) {
      window.scrollTo(0, 0);
    }

    this.doPreventFetchMore = false;
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateScrollY);
  }

  updateScrollY = () => {
    // https://gist.github.com/enqtran/25c6b222a73dc497cc3a64c090fb6700
    const scrollHeight = getWindowScrollHeight()
    const windowHeight = getWindowHeight();
    const scrollTop = window.pageYOffset;

    vars.scrollPanel.contentHeight = scrollHeight;
    vars.scrollPanel.layoutHeight = windowHeight;
    vars.scrollPanel.pageYOffset = scrollTop;

    // if has more, not fetching more, and at the bottom
    const { hasMoreLinks, hasFetchedMore, isFetchingMore } = this.props;
    if (!hasMoreLinks || hasFetchedMore || isFetchingMore) return;
    if (this.doPreventFetchMore) return;

    const windowBottom = windowHeight + scrollTop;
    if (windowBottom > (scrollHeight * 0.96)) {
      this.doPreventFetchMore = true;
      this.props.fetchMore();
    }
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  }

  onUpdateFetchedBtnClick = () => {
    this.props.updateFetchedMore();
  }

  renderFetchMoreBtn() {
    return (
      <button onClick={this.onFetchMoreBtnClick} className="my-4 py-2 block w-full group focus:outline-none">
        <span className="px-3 py-1 inline-block bg-white text-sm text-gray-500 border border-gray-400 rounded-full group-hover:text-gray-600 group-hover:border-gray-500 group-focus:ring">More</span>
      </button>
    );
  }

  renderFetchingMore() {
    return (
      <div className="flex justify-center items-center">
        <div className="lds-ellipsis">
          <div className="bg-gray-400" />
          <div className="bg-gray-400" />
          <div className="bg-gray-400" />
          <div className="bg-gray-400" />
        </div>
      </div>
    );
  }

  renderUpdateFetchedBtn() {
    return (
      <button onClick={this.onUpdateFetchedBtnClick} className="my-4 py-2 block w-full group focus:outline-none">
        <span className="px-3 py-1 inline-block bg-white text-sm text-gray-500 border border-gray-400 rounded-full group-hover:text-gray-600 group-hover:border-gray-500 group-focus:ring">Show more</span>
      </button>
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
              <div key={`col-${i}`} className={`w-full ${columnClassNames} min-w-0`}>
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

    const {
      links, hasMoreLinks, hasFetchedMore, isFetchingMore, columnWidth, safeAreaWidth,
    } = this.props;

    let fetchMoreBtn;
    if (!hasMoreLinks) fetchMoreBtn = null;
    else if (hasFetchedMore) fetchMoreBtn = this.renderUpdateFetchedBtn();
    else if (isFetchingMore) fetchMoreBtn = this.renderFetchingMore();
    else fetchMoreBtn = this.renderFetchMoreBtn();

    let paddingBottom = '1.5rem';
    if (columnWidth === PC_100) {
      paddingBottom = addRem(SEARCH_POPUP_HEIGHT, addRem(BOTTOM_BAR_HEIGHT, '1.5rem'));
    }

    const style = {
      paddingTop: safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD,
      paddingBottom,
    };

    return (
      <div style={style} className="mx-auto px-4 relative max-w-6xl md:px-6 lg:px-8">
        <div className="pt-6 md:pt-10">
          {links.length === 0 && <EmptyContent />}
          {links.length > 0 && this.renderPanel()}
          {fetchMoreBtn}
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

  let links = getLinks(state);
  if (links === null) {
    console.log(`Invalid links: ${links}. Links cannot be undefined as in LinkSelector and if links is null, it should be handled in Main, not in CardPanel.`);
    links = [];
  }

  return {
    links: links,
    hasMoreLinks: state.hasMoreLinks[listName],
    hasFetchedMore: state.fetchedMore[listName] ? true : false,
    isFetchingMore: getIsFetchingMore(state),
    listChangedCount: state.display.listChangedCount,
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToProps = { fetchMore, updateFetchedMore };

export default connect(mapStateToProps, mapDispatchToProps)(CardPanel);
