import React from 'react';
import { View, Animated } from 'react-native';
import { connect } from 'react-redux';

import { BOTTOM_BAR_HEIGHT } from '../types/const';
import { getThemeMode } from '../selectors';
import { toPx } from '../utils';
import { bbFMV } from '../types/animConfigs';

import { withTailwind } from '.';
import BottomBarCommands from './BottomBarCommands';
import BottomBarBulkEditCommands from './BottomBarBulkEditCommands';

class BottomBar extends React.PureComponent<any, any> {

  bottomBarTranslateY: Animated.Value;

  constructor(props) {
    super(props);

    this.bottomBarTranslateY = new Animated.Value(0);
  }

  componentDidUpdate(prevProps, prevState) {

    const { isShown, insets } = this.props;

    if (prevProps.isShown !== isShown) {

      const totalHeight = toPx(BOTTOM_BAR_HEIGHT) + insets.bottom;
      const toValue = isShown ? 0 : totalHeight;
      const animConfig = isShown ? bbFMV.visible : bbFMV.hidden;
      Animated.timing(this.bottomBarTranslateY, { toValue, ...animConfig }).start();
    }
  }

  render() {

    const { isBulkEditing, insets, tailwind } = this.props;

    const bbStyle = {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right,
      transform: [{ translateY: this.bottomBarTranslateY }],
    };
    const style = { height: toPx(BOTTOM_BAR_HEIGHT) };

    return (
      <React.Fragment>
        <Animated.View style={[tailwind('absolute inset-x-0 bottom-0 z-30 bg-white blk:bg-gray-800'), bbStyle]}>
          <View style={[tailwind('border-t border-gray-200 blk:border-gray-700'), style]}>
            {isBulkEditing ? <BottomBarBulkEditCommands /> : <BottomBarCommands />}
          </View>
        </Animated.View>
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
  };
};

export default connect(mapStateToProps)(withTailwind(BottomBar));
