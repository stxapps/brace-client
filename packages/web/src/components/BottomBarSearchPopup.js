import React from 'react';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';

import { updatePopup, updateSearchString } from '../actions';
import { SEARCH_POPUP } from '../types/const';
import { getPopupLink } from '../selectors';
import { bbSearchPopupFMV } from '../types/animConfigs';

class BottomBarSearchPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.searchInput = React.createRef();
    this.animate = this.getAnimate(null, props);
  }

  componentDidUpdate(prevProps) {

    const { isSearchPopupShown } = this.props;
    if (!prevProps.isSearchPopupShown && isSearchPopupShown) {
      this.searchInput.current.focus();
    }

    if (prevProps.isSearchPopupShown && !isSearchPopupShown) {
      this.searchInput.current.blur();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.animate = this.getAnimate(this.props, nextProps);
  }

  getAnimate(prevProps, props) {

    const isPrevBottomBarShown = prevProps ? prevProps.isBottomBarShown : true;
    const { isBottomBarShown, isSearchPopupShown } = props;

    if (!isBottomBarShown) return 'bbHidden';
    if (isSearchPopupShown) {
      return !isPrevBottomBarShown ? 'bbVisibleVisible' : 'visible';
    }
    if (!isPrevBottomBarShown) return 'bbVisible';
    return 'hidden';
  }

  onSearchInputChange = (e) => {
    this.props.updateSearchString(e.target.value);
  }

  onSearchClearBtnClick = () => {
    this.props.updateSearchString('');
    this.searchInput.current.focus();
  }

  onSearchCancelBtnClick = () => {
    this.props.updateSearchString('');
    this.props.updatePopup(SEARCH_POPUP, false);
  }

  render() {

    const { searchString } = this.props;

    // Only transition when moving with BottomBar
    //   but when show/hide this search popup, no need animation
    //   as keyboard is already animated.

    const searchClearBtnClasses = searchString.length === 0 ? 'hidden' : '';

    return (
      <motion.div className={`px-2 py-2 fixed inset-x-0 bottom-0 flex justify-between items-center bg-white border-t border-gray-200 z-10`} variants={bbSearchPopupFMV} initial={false} animate={this.animate}>
        <div className="relative w-full">
          <input ref={this.searchInput} onChange={this.onSearchInputChange} className="pl-4 pr-6 py-1.5 flex-grow-1 flex-shrink w-full bg-white text-sm text-gray-700 border border-gray-400 rounded-full placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 focus:border-gray-200" type="search" placeholder="Search" value={searchString} autoCapitalize="none" />
          <button onClick={this.onSearchClearBtnClick} className={`pr-2 ${searchClearBtnClasses} absolute inset-y-0 right-0 flex items-center group focus:outline-none`}>
            <svg className="h-5 text-gray-400 cursor-pointer rounded-full group-hover:text-gray-500 group-focus:ring" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </svg>
          </button>
        </div>
        <button onClick={this.onSearchCancelBtnClick} className="ml-2 px-1.5 py-1 flex-grow-0 flex-shrink-0 text-sm text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset">Cancel</button>
      </motion.div>
    );
  }
}

const mapStateToProps = (state, props) => {

  const popupLink = getPopupLink(state);

  return {
    searchString: state.display.searchString,
    isBottomBarShown: popupLink === null,
    isSearchPopupShown: state.display.isSearchPopupShown,
  };
};

const mapDispatchToProps = { updatePopup, updateSearchString };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarSearchPopup);
