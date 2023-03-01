import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { fetchMore, updateFetchedMore } from '../actions';
import {
  PC_100, PC_50, PC_33,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
  MD_WIDTH,
} from '../types/const';
import {
  getLinks, getIsFetchingMore, getSafeAreaWidth, getThemeMode,
} from '../selectors';
import { addRem, getWindowHeight, getWindowScrollHeight, throttle } from '../utils';
import vars from '../vars';

import { withTailwind } from '.';
import CardItem from './CardItem';
import EmptyContent from './EmptyContent';

class CardPanel extends React.PureComponent {

  constructor(props) {
    super(props);

    this.updateScrollY = throttle(this.updateScrollY, 16);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    window.addEventListener('scroll', this.updateScrollY);
    vars.scrollPanel.pageYOffset = 0;
  }

  componentDidUpdate(prevProps) {
    if (this.props.listChangedCount !== prevProps.listChangedCount) {
      window.scrollTo(0, 0);
      vars.scrollPanel.pageYOffset = 0;
    }
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

    const { hasMoreLinks, hasFetchedMore, isFetchingMore } = this.props;
    if (!hasMoreLinks || hasFetchedMore || isFetchingMore) return;

    const windowBottom = windowHeight + scrollTop;
    if (windowBottom > (scrollHeight * 0.96)) this.props.fetchMore();
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  }

  onUpdateFetchedBtnClick = () => {
    this.props.updateFetchedMore();
  }

  renderEmtpy() {
    vars.scrollPanel.pageYOffset = 0;
    return <EmptyContent />;
  }

  renderFetchMoreBtn() {
    const { tailwind } = this.props;

    return (
      <button onClick={this.onFetchMoreBtnClick} className={tailwind('group my-4 block w-full py-2 focus:outline-none')}>
        <span className={tailwind('inline-block rounded-full border border-gray-400 bg-white px-3 py-1 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>More</span>
      </button>
    );
  }

  renderFetchingMore() {
    const { tailwind } = this.props;

    return (
      <div className={tailwind('flex items-center justify-center')}>
        <div className={tailwind('lds-ellipsis')}>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
        </div>
      </div>
    );
  }

  renderUpdateFetchedBtn() {
    const { tailwind } = this.props;

    return (
      <button onClick={this.onUpdateFetchedBtnClick} className={tailwind('group my-4 block w-full py-2 focus:outline-none')}>
        <span className={tailwind('inline-block rounded-full border border-gray-400 bg-white px-3 py-1 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>Show more</span>
      </button>
    );
  }

  renderPanel() {
    const { links, columnWidth, tailwind } = this.props;

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
      <div className={tailwind(`flex items-start justify-evenly ${panelClassNames}`)}>
        {colData.map((colItems, i) => {
          return (
            <div key={`col-${i}`} className={tailwind(`w-full min-w-0 ${columnClassNames}`)}>
              {colItems.map(link => <CardItem key={link.id} link={link} />)}
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const {
      links, hasMoreLinks, hasFetchedMore, isFetchingMore, columnWidth, safeAreaWidth,
      tailwind,
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
      <div style={style} className={tailwind('relative mx-auto max-w-6xl px-4 md:px-6 lg:px-8')}>
        <div className={tailwind('pt-6 md:pt-10')}>
          {links.length === 0 && this.renderEmtpy()}
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
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToProps = { fetchMore, updateFetchedMore };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(CardPanel));
