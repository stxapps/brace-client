import React from 'react';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';

import { BOTTOM_BAR_HEIGHT } from '../types/const';
import { getPopupLink } from '../selectors';
import { bbFMV } from '../types/animConfigs';

import { withTailwind } from '.';
import BottomBarCommands from './BottomBarCommands';
import BottomBarAddPopup from './BottomBarAddPopup';
import BottomBarSearchPopup from './BottomBarSearchPopup';
import BottomBarProfilePopup from './BottomBarProfilePopup';
import BottomBarBulkEditCommands from './BottomBarBulkEditCommands';

class BottomBar extends React.PureComponent {

  render() {
    const { isShown, isBulkEditing, tailwind } = this.props;
    const style = { height: BOTTOM_BAR_HEIGHT };

    return (
      <React.Fragment>
        <motion.div style={style} className={tailwind('fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white')} variants={bbFMV} initial={false} animate={isShown ? 'visible' : 'hidden'}>
          {isBulkEditing ? <BottomBarBulkEditCommands /> : <BottomBarCommands />}
        </motion.div>
        <BottomBarAddPopup />
        <BottomBarSearchPopup />
        <BottomBarProfilePopup />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const { isListNamesPopupShown, isPinMenuPopupShown } = state.display;
  const popupLink = getPopupLink(state);

  return {
    isShown: popupLink === null && !isListNamesPopupShown && !isPinMenuPopupShown,
    isBulkEditing: state.display.isBulkEditing,
    safeAreaWidth: state.window.width,
  };
};

export default connect(mapStateToProps)(withTailwind(BottomBar));
