import React from 'react';
import { connect } from 'react-redux';

import { MAX_SELECTED_LINK_IDS } from '../types/const';
import {
  addSelectedLinkIds, deleteSelectedLinkIds,
} from '../actions';
import { makeIsLinkIdSelected, getSelectedLinkIdsLength } from '../selectors';

class CardItemSelector extends React.Component {

  shouldComponentUpdate(nextProps) {
    if (
      this.props.isBulkEditing !== nextProps.isBulkEditing ||
      this.props.isSelected !== nextProps.isSelected
    ) {
      return true;
    }

    return false;
  }

  onSelectBtnClick = () => {

    const { linkId, isSelected, selectedLinkIdsLength } = this.props;

    // To select but already max, just do nothing here.
    if (!isSelected && selectedLinkIdsLength === MAX_SELECTED_LINK_IDS) return;

    if (isSelected) this.props.deleteSelectedLinkIds([linkId]);
    else this.props.addSelectedLinkIds([linkId]);
  }

  render() {

    const { isBulkEditing, isSelected } = this.props;
    if (!isBulkEditing) return null;

    const svgStyleClasses = isSelected ? 'text-gray-100' : 'text-gray-700';

    return (
      <React.Fragment>
        <div className="absolute inset-0 bg-black opacity-75"></div>
        <button onClick={this.onSelectBtnClick} className="absolute inset-0 flex justify-center items-center w-full h-full bg-transparent">
          <svg className={`w-20 h-20 ${svgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
          </svg>
        </button>
      </React.Fragment>
    );
  }
}

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
