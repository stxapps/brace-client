import React from 'react';
import { connect } from 'react-redux';
import { Animated } from 'react-native';

import { BOTTOM_BAR_HEIGHT, BOTTOM_BAR_DURATION } from '../types/const';
import { getPopupLink } from '../selectors';
import { toPx } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

import BottomBarCommands from './BottomBarCommands';
import BottomBarAddPopup from './BottomBarAddPopup';
import BottomBarSearchPopup from './BottomBarSearchPopup';
import BottomBarBulkEditCommands from './BottomBarBulkEditCommands';

class BottomBar extends React.PureComponent {

  constructor(props) {
    super(props);

    this.bottomBarTranslateY = new Animated.Value(0);
  }

  componentDidUpdate(prevProps, prevState) {

    const { isShown, insets } = this.props;
    const duration = isShown ? 0 : BOTTOM_BAR_DURATION;

    if (prevProps.isShown != isShown) {

      const totalHeight = toPx(BOTTOM_BAR_HEIGHT) + insets.bottom;
      const toValue = isShown ? 0 : totalHeight;

      Animated.timing(this.bottomBarTranslateY, {
        toValue: toValue,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }
  }

  render() {

    const { isBulkEditing, insets } = this.props;

    const style = {
      height: toPx(BOTTOM_BAR_HEIGHT) + insets.bottom,
      transform: [{ translateY: this.bottomBarTranslateY }],
    };

    return (
      <React.Fragment>
        <Animated.View style={[tailwind('absolute inset-x-0 bottom-0 bg-white border-t border-gray-300 z-30'), style]}>
          {isBulkEditing ? <BottomBarBulkEditCommands /> : <BottomBarCommands />}
        </Animated.View>
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

export default connect(mapStateToProps)(withSafeAreaContext(BottomBar));
