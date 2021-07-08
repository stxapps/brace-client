import React from 'react';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';

import { BOTTOM_BAR_HEIGHT } from '../types/const';
import { getPopupLink } from '../selectors';
import { bbFMV } from '../types/animConfigs';

import BottomBarCommands from './BottomBarCommands';
import BottomBarAddPopup from './BottomBarAddPopup';
import BottomBarSearchPopup from './BottomBarSearchPopup';
import BottomBarProfilePopup from './BottomBarProfilePopup';
import BottomBarBulkEditCommands from './BottomBarBulkEditCommands';
import BottomBarBulkEditMoveToPopup from './BottomBarBulkEditMoveToPopup';

class BottomBar extends React.PureComponent {

  render() {

    const { isShown, isBulkEditing } = this.props;
    const style = { height: BOTTOM_BAR_HEIGHT };

    return (
      <React.Fragment>
        <motion.div style={style} className={`fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 z-30`} variants={bbFMV} initial={false} animate={isShown ? 'visible' : 'hidden'}>
          {isBulkEditing ? <BottomBarBulkEditCommands /> : <BottomBarCommands />}
        </motion.div>
        <BottomBarAddPopup />
        <BottomBarSearchPopup />
        <BottomBarProfilePopup />
        <BottomBarBulkEditMoveToPopup />
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
