import React from 'react';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';

import { updatePopup, updateSearchString } from '../actions';
import { SEARCH_POPUP } from '../types/const';
import { getSafeAreaWidth, getSafeAreaInsets, getThemeMode } from '../selectors';
import { bbSearchPopupFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class BottomBarSearchPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.searchInput = React.createRef();
    this.animate = this.getAnimate(null, props);
  }

  componentDidMount() {
    const { searchString, isSearchPopupShown } = this.props;

    if (searchString && !isSearchPopupShown) {
      this.props.updatePopup(SEARCH_POPUP, true);
    } else if (!searchString && isSearchPopupShown) {
      this.props.updatePopup(SEARCH_POPUP, false);
    }
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
    const { searchString, insets, tailwind } = this.props;

    // Only transition when moving with BottomBar
    //   but when show/hide this search popup, no need animation
    //   as keyboard is already animated.
    const style = {
      paddingBottom: this.animate === 'bbHidden' ? 0 : insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right,
    };
    const searchClearBtnClasses = searchString.length === 0 ? 'hidden' : '';

    return (
      <motion.div style={style} className={tailwind('fixed inset-x-0 bottom-0 z-10 bg-white blk:bg-gray-800')} variants={bbSearchPopupFMV} initial={false} animate={this.animate}>
        <div className={tailwind('flex items-center justify-between border-t border-gray-200 px-2 py-2 blk:border-gray-700')}>
          <div className={tailwind('relative w-full')}>
            <input ref={this.searchInput} onChange={this.onSearchInputChange} className={tailwind('w-full flex-shrink flex-grow rounded-full border border-gray-400 bg-white py-1.5 pl-4 pr-6 text-sm text-gray-700 placeholder:text-gray-500 focus:border-gray-200 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-600 blk:bg-gray-800 blk:text-gray-200 blk:placeholder:text-gray-400 blk:focus:border-transparent')} type="search" placeholder="Search" value={searchString} autoCapitalize="none" />
            <button onClick={this.onSearchClearBtnClick} className={tailwind(`group absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none ${searchClearBtnClasses}`)}>
              <svg className={tailwind('h-5 cursor-pointer rounded-full text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
              </svg>
            </button>
          </div>
          <button onClick={this.onSearchCancelBtnClick} className={tailwind('ml-2 flex-shrink-0 flex-grow-0 rounded-md px-1.5 py-1 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')}>Cancel</button>
        </div>
      </motion.div>
    );
  }
}

const mapStateToProps = (state, props) => {

  const {
    isCardItemMenuPopupShown, isListNamesPopupShown, isPinMenuPopupShown,
    isBulkEditMenuPopupShown,
  } = state.display;

  return {
    searchString: state.display.searchString,
    isBottomBarShown: (
      !isCardItemMenuPopupShown && !isListNamesPopupShown &&
      !isPinMenuPopupShown && !isBulkEditMenuPopupShown
    ),
    isSearchPopupShown: state.display.isSearchPopupShown,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
    insets: getSafeAreaInsets(state),
  };
};

const mapDispatchToProps = { updatePopup, updateSearchString };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarSearchPopup));
