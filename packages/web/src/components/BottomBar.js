import React from 'react';
import { connect } from 'react-redux';

import { BOTTOM_BAR_HEIGHT, BOTTOM_BAR_DURATION_CLASSNAME } from '../types/const';
import { getPopupLink } from '../selectors';

import BottomBarCommands from './BottomBarCommands';
import BottomBarAddPopup from './BottomBarAddPopup';
import BottomBarSearchPopup from './BottomBarSearchPopup';
import BottomBarBulkEditCommands from './BottomBarBulkEditCommands';

class BottomBar extends React.PureComponent {

  render() {

    const { isShown, isBulkEditing } = this.props;
    const style = { height: BOTTOM_BAR_HEIGHT };

    return (
      <React.Fragment>
        <div style={style} className={`fixed inset-x-0 bottom-0 bg-white border-t border-gray-300 transform ${!isShown ? 'translate-y-full' : ''} transition-transform ${BOTTOM_BAR_DURATION_CLASSNAME} ease-in-out z-30`}>
          {isBulkEditing ? <BottomBarBulkEditCommands /> : <BottomBarCommands />}
        </div>
        <BottomBarAddPopup />
        <BottomBarSearchPopup />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const popupLink = getPopupLink(state);

  return {
    isShown: popupLink === null,
    isBulkEditing: state.display.isBulkEditing,
  };
};

export default connect(mapStateToProps)(BottomBar);
