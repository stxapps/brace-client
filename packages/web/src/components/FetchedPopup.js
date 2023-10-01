import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updateFetched } from '../actions';
import { getSafeAreaWidth, getThemeMode } from '../selectors';
import { MD_WIDTH } from '../types/const';
import { fetchedPopupFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class FetchedPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = { isShown: true };
    this.state = { ...this.initialState };
  }

  // If user clicks close, don't bother her again, even list changed.
  /*UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.fetched && nextProps.fetched) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }*/

  onUpdateBtnClick = () => {
    this.props.updateFetched(null, true);
  }

  onCloseBtnClick = () => {
    this.setState({ isShown: false });
  }

  render() {
    const { fetched, safeAreaWidth, tailwind } = this.props;
    const { isShown } = this.state;
    if (!fetched || !isShown) return (
      <AnimatePresence key="AnimatePresence_FetchedPopup" />
    );

    const initialTop = safeAreaWidth < MD_WIDTH ? '4.625rem' : '5.125rem';
    const style = { top: initialTop };
    const updateBtnStyle = { padding: '0.25rem 0rem 0.3125rem 0.75rem' };
    const closeBtnStyle = { marginRight: '0.5rem' };

    return (
      <AnimatePresence key="AnimatePresence_FetchedPopup">
        <motion.div style={style} className={tailwind('fixed left-1/2 z-30 flex items-center rounded-full bg-blue-400 shadow-lg')} variants={fetchedPopupFMV} initial="hidden" animate="visible" exit="hidden">
          <button style={updateBtnStyle} onClick={this.onUpdateBtnClick} className={tailwind('text-sm text-white focus:outline-none')}>There is an update</button>
          <button style={closeBtnStyle} onClick={this.onCloseBtnClick} className={tailwind('ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-50 hover:bg-blue-100 hover:text-blue-400 focus:bg-blue-100 focus:text-blue-400 focus:outline-none')}>
            <span className={tailwind('sr-only')}>Remove new update option</span>
            <svg className={tailwind('h-2 w-2')} viewBox="0 0 8 8" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
            </svg>
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }
}

const mapStateToProps = (state, props) => {

  const listName = state.display.listName;
  const queryString = state.display.queryString;
  const lnOrQt = queryString ? queryString : listName;

  return {
    fetched: state.fetched[lnOrQt],
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToProps = { updateFetched };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(FetchedPopup));
