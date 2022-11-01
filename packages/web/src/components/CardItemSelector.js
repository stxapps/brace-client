import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { addSelectedLinkIds, deleteSelectedLinkIds } from '../actions';
import { MAX_SELECTED_LINK_IDS } from '../types/const';
import {
  makeIsLinkIdSelected, getSelectedLinkIdsLength, getThemeMode,
} from '../selectors';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class CardItemSelector extends React.Component {

  constructor(props) {
    super(props);

    this.state = { isMaxErrorShown: false };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.isMaxErrorShown === true &&
      nextProps.selectedLinkIdsLength < MAX_SELECTED_LINK_IDS
    ) {
      this.setState({ isMaxErrorShown: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.linkId !== nextProps.linkId ||
      this.props.isBulkEditing !== nextProps.isBulkEditing ||
      this.props.isSelected !== nextProps.isSelected ||
      this.props.tailwind !== nextProps.tailwind ||
      this.state.isMaxErrorShown !== nextState.isMaxErrorShown
    ) {
      return true;
    }

    return false;
  }

  onSelectBtnClick = () => {

    const { linkId, isSelected, selectedLinkIdsLength } = this.props;

    if (!isSelected && selectedLinkIdsLength === MAX_SELECTED_LINK_IDS) {
      this.setState({ isMaxErrorShown: true });
      return;
    }
    this.setState({ isMaxErrorShown: false });

    if (isSelected) this.props.deleteSelectedLinkIds([linkId]);
    else this.props.addSelectedLinkIds([linkId]);
  }

  renderMaxError() {
    if (!this.state.isMaxErrorShown) return (
      <AnimatePresence key="AnimatePresence_CIS_maxError" />
    );

    const { tailwind } = this.props;

    return (
      <AnimatePresence key="AnimatePresence_CIS_maxError">
        <motion.div className={tailwind('absolute inset-x-0 top-0 flex items-start justify-center')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow')}>
            <div className={tailwind('flex')}>
              <div className={tailwind('flex-shrink-0')}>
                <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={tailwind('ml-3 mt-0.5')}>
                <h3 className={tailwind('text-left text-sm leading-5 text-red-800')}>To prevent network overload, up to {MAX_SELECTED_LINK_IDS} items can be selected.</h3>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  render() {
    const { linkId, isBulkEditing, isSelected, tailwind } = this.props;

    if (!isBulkEditing) return (
      <AnimatePresence key={`AnimatePresence_CardItemSelector_${linkId}`} />
    );

    const circleStyleClasses = isSelected ? 'bg-gray-800 blk:border blk:border-gray-700' : 'bg-white opacity-70';
    const svgStyleClasses = isSelected ? 'text-gray-50' : 'text-gray-500';

    return (
      <AnimatePresence key={`AnimatePresence_CardItemSelector_${linkId}`}>
        <motion.div key={`CardItemSelector_shade_${linkId}`} className={tailwind('absolute inset-0 bg-black bg-opacity-40')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
        <motion.button key={`CardItemSelector_selectBtn_${linkId}`} onClick={this.onSelectBtnClick} className={tailwind('group absolute inset-0 flex h-full w-full items-center justify-center bg-transparent focus:outline-none')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('rounded-full group-hover:ring group-focus:ring')}>
            <div className={tailwind(`flex h-32 w-32 items-center justify-center rounded-full ${circleStyleClasses}`)}>
              <svg className={tailwind(`h-20 w-20 ${svgStyleClasses}`)} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
              </svg>
            </div>
          </div>
          {this.renderMaxError()}
        </motion.button>
      </AnimatePresence>
    );
  }
}

CardItemSelector.propTypes = {
  linkId: PropTypes.string.isRequired,
};

const makeMapStateToProps = () => {

  const isLinkIdSelected = makeIsLinkIdSelected();

  const mapStateToProps = (state, props) => {
    return {
      isBulkEditing: state.display.isBulkEditing,
      isSelected: isLinkIdSelected(state, props),
      selectedLinkIdsLength: getSelectedLinkIdsLength(state),
      themeMode: getThemeMode(state),
      safeAreaWidth: state.window.width,
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = { addSelectedLinkIds, deleteSelectedLinkIds };

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemSelector));
