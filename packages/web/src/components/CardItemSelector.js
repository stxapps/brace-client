import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { MAX_SELECTED_LINK_IDS } from '../types/const';
import {
  addSelectedLinkIds, deleteSelectedLinkIds,
} from '../actions';
import { makeIsLinkIdSelected, getSelectedLinkIdsLength } from '../selectors';

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
      this.props.isBulkEditing !== nextProps.isBulkEditing ||
      this.props.isSelected !== nextProps.isSelected ||
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

    if (!this.state.isMaxErrorShown) return null;

    return (
      <div className="absolute top-0 inset-x-0 flex justify-center items-start">
        <div className="m-4 p-4 bg-red-100 rounded-md ">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm text-red-800 font-medium text-left leading-5">To prevent network overload, up to {MAX_SELECTED_LINK_IDS} items can be selected.</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {

    const { isBulkEditing, isSelected } = this.props;
    if (!isBulkEditing) return null;

    const circleStyleClasses = isSelected ? 'bg-gray-900' : 'bg-gray-100 opacity-75';
    const svgStyleClasses = isSelected ? 'text-white' : 'text-gray-500';

    return (
      <React.Fragment>
        <div className="absolute inset-0 bg-gray-900 opacity-25"></div>
        <button onClick={this.onSelectBtnClick} className="absolute inset-0 flex justify-center items-center w-full h-full bg-transparent group focus:outline-none-outer">
          <div className="rounded-full group-hover:shadow-outline-opaque focus:shadow-outline-inner-opaque">
            <div className={`flex justify-center items-center w-32 h-32 rounded-full ${circleStyleClasses}`}>
              <svg className={`w-20 h-20 ${svgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
              </svg>
            </div>
          </div>
          {this.renderMaxError()}
        </button>
      </React.Fragment>
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
    }
  }

  return mapStateToProps
};

const mapDispatchToProps = {
  addSelectedLinkIds, deleteSelectedLinkIds,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(CardItemSelector);
