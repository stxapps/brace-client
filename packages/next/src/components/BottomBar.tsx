import React from 'react';
import { connect } from 'react-redux';
import { motion } from 'motion/react';

import { BOTTOM_BAR_HEIGHT } from '../types/const';
import { getSafeAreaWidth, getSafeAreaInsets, getThemeMode } from '../selectors';
import { bbFMV } from '../types/animConfigs';

import { withTailwind } from '.';
import BottomBarCommands from './BottomBarCommands';
import BottomBarBulkEditCommands from './BottomBarBulkEditCommands';

class BottomBar extends React.PureComponent<any, any> {

  render() {
    const { isShown, isBulkEditing, insets, tailwind } = this.props;

    const bbStyle = {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right,
    }
    const style = { height: BOTTOM_BAR_HEIGHT };

    return (
      <React.Fragment>
        <motion.div style={bbStyle} className={tailwind('fixed inset-x-0 bottom-0 z-30 bg-white blk:bg-gray-800')} variants={bbFMV} initial={false} animate={isShown ? 'visible' : 'hidden'}>
          <div style={style} className={tailwind('border-t border-gray-200 blk:border-gray-700')}>
            {isBulkEditing ? <BottomBarBulkEditCommands /> : <BottomBarCommands />}
          </div>
        </motion.div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const {
    isCardItemMenuPopupShown, isListNamesPopupShown, isPinMenuPopupShown,
  } = state.display;

  return {
    isShown: (
      !isCardItemMenuPopupShown && !isListNamesPopupShown &&
      !isPinMenuPopupShown
    ),
    isBulkEditing: state.display.isBulkEditing,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
    insets: getSafeAreaInsets(state),
  };
};

export default connect(mapStateToProps)(withTailwind(BottomBar));
