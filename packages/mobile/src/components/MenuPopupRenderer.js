import React from 'react';
import { I18nManager, Animated, StyleSheet } from 'react-native';

import { ZERO, CENTER, EDGE, AT_TRIGGER, EDGE_TRIGGER } from '../types/const';
import { popupOpenAnimConfig, popupCloseAnimConfig } from '../types/animConfigs';

const axisPosition = (oDim, wDim, tPos, tDim) => {
  // if options are bigger than window dimension, then render at 0
  if (oDim > wDim) {
    return [0, ZERO];
  }
  // render at trigger position if possible
  if (tPos + oDim <= wDim) {
    return [tPos, AT_TRIGGER];
  }
  // aligned to the trigger from the bottom (right)
  if (tPos + tDim - oDim >= 0) {
    return [tPos + tDim - oDim, EDGE_TRIGGER];
  }
  // compute center position
  let pos = Math.round(tPos + (tDim / 2) - (oDim / 2));
  // check top boundary
  if (pos < 0) {
    return [0, ZERO];
  }
  // check bottom boundary
  if (pos + oDim > wDim) {
    return [wDim - oDim, EDGE];
  }
  // if everything ok, render in center position
  return [pos, CENTER];
};

export const computePosition = (layouts, triggerOffsets, popupMargin = 0) => {

  const { windowLayout, triggerLayout, optionsLayout } = layouts;

  const { x: wX, y: wY, width: wWidth, height: wHeight } = windowLayout;
  let { x: tX, y: tY, height: tHeight, width: tWidth } = triggerLayout;
  if (triggerOffsets) {
    const { x: xOffset, y: yOffset, width: wOffset, height: hOffset } = triggerOffsets;
    tX = tX + xOffset;
    tY = tY + yOffset;
    tWidth = tWidth + wOffset;
    tHeight = tHeight + hOffset;
  }
  const { height: oHeight, width: oWidth } = optionsLayout;

  let [top, topOrigin] = axisPosition(oHeight, wHeight, tY - wY, tHeight);
  let [left, leftOrigin] = axisPosition(oWidth, wWidth, tX - wX, tWidth);

  if (topOrigin === ZERO) top += popupMargin;
  else if (topOrigin === EDGE) top -= popupMargin;

  if (leftOrigin === ZERO) left += popupMargin;
  else if (leftOrigin === EDGE) left -= popupMargin;

  return { top, left, topOrigin, leftOrigin };
};

export const createLayouts = (triggerLayout, optionsLayout, windowLayout) => {
  return {
    windowLayout: { x: 0, y: 0, width: windowLayout.width, height: windowLayout.height },
    triggerLayout: triggerLayout,
    optionsLayout: optionsLayout,
  };
};

export const getOriginClassName = (topOrigin, leftOrigin) => {
  if (topOrigin === AT_TRIGGER && leftOrigin === AT_TRIGGER) {
    return 'origin-top-left';
  } else if (topOrigin === AT_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return 'origin-top-right';
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === AT_TRIGGER) {
    return 'origin-bottom-left';
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return 'origin-bottom-right';
  } else {
    return 'origin-center';
  }
};

function fit(pos, len, minPos, maxPos) {
  if (pos === undefined) {
    return undefined;
  }
  if (pos + len > maxPos) {
    pos = maxPos - len;
  }
  if (pos < minPos) {
    pos = minPos;
  }
  return pos;
}

// fits options (position) into safeArea
export const fitPositionIntoSafeArea = (position, layouts) => {
  const { windowLayout, safeAreaLayout, optionsLayout } = layouts;
  if (!safeAreaLayout) {
    return position;
  }
  const { x: saX, y: saY, height: saHeight, width: saWidth } = safeAreaLayout;
  const { height: oHeight, width: oWidth } = optionsLayout;
  const { width: wWidth } = windowLayout;
  let { top, left, right } = position;
  top = fit(top, oHeight, saY, saY + saHeight);
  left = fit(left, oWidth, saX, saX + saWidth);
  right = fit(right, oWidth, wWidth - saX - saWidth, saX);
  return { top, left, right };
};

export const originalComputePosition = (layouts, isRTL, triggerOffsets) => {

  const { windowLayout, triggerLayout, optionsLayout } = layouts;

  const { x: wX, y: wY, width: wWidth, height: wHeight } = windowLayout;
  let { x: tX, y: tY, height: tHeight, width: tWidth } = triggerLayout;
  if (triggerOffsets) {
    const { x: xOffset, y: yOffset, width: wOffset, height: hOffset } = triggerOffsets;
    tX = tX + xOffset;
    tY = tY + yOffset;
    tWidth = tWidth + wOffset;
    tHeight = tHeight + hOffset;
  }
  const { height: oHeight, width: oWidth } = optionsLayout;

  let [top, topOrigin] = axisPosition(oHeight, wHeight, tY - wY, tHeight);
  let [left, leftOrigin] = axisPosition(oWidth, wWidth, tX - wX, tWidth);

  const popupMargin = 8;
  if (topOrigin === ZERO) top += popupMargin;
  else if (topOrigin === EDGE) top -= popupMargin;

  if (leftOrigin === ZERO) left += popupMargin;
  else if (leftOrigin === EDGE) left -= popupMargin;

  const start = isRTL ? 'right' : 'left';
  const position = { top, [start]: left };

  return { ...fitPositionIntoSafeArea(position, layouts), topOrigin, leftOrigin };
};

export default class MenuPopupRenderer extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      scaleAnim: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.spring(
      this.state.scaleAnim, { toValue: 1, ...popupOpenAnimConfig }
    ).start();
  }

  close() {
    return new Promise(resolve => {
      Animated.spring(
        this.state.scaleAnim, { toValue: 0, ...popupCloseAnimConfig }
      ).start(resolve);
    });
  }

  render() {
    const { style, children, layouts, triggerOffsets, popupStyle, ...other } = this.props;
    const { scaleAnim } = this.state;
    const {
      topOrigin, leftOrigin, ...position
    } = originalComputePosition(layouts, I18nManager.isRTL, triggerOffsets);

    const { height: oHeight, width: oWidth } = layouts.optionsLayout;

    let startTranslateX, startTranslateY;
    if (topOrigin === AT_TRIGGER && leftOrigin === AT_TRIGGER) {
      startTranslateX = -1 * oWidth / 2;
      startTranslateY = -1 * oHeight / 2;
    } else if (topOrigin === AT_TRIGGER && leftOrigin === EDGE_TRIGGER) {
      startTranslateX = oWidth / 2;
      startTranslateY = -1 * oHeight / 2;
    } else if (topOrigin === EDGE_TRIGGER && leftOrigin === AT_TRIGGER) {
      startTranslateX = -1 * oWidth / 2;
      startTranslateY = oHeight / 2;
    } else if (topOrigin === EDGE_TRIGGER && leftOrigin === EDGE_TRIGGER) {
      startTranslateX = oWidth / 2;
      startTranslateY = oHeight / 2;
    } else {
      startTranslateX = 0;
      startTranslateY = 0;
    }

    const changingTranslateX = scaleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [startTranslateX, 0],
    });
    const changingTranslateY = scaleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [startTranslateY, 0],
    });

    const animation = {
      transform: [
        { translateX: changingTranslateX },
        { translateY: changingTranslateY },
        { scale: scaleAnim },
      ],
    };

    return (
      <Animated.View {...other} style={[styles.options, style, popupStyle, animation, position]}>
        {children}
      </Animated.View>
    );
  }
}

// public exports
MenuPopupRenderer.computePosition = originalComputePosition;
MenuPopupRenderer.fitPositionIntoSafeArea = fitPositionIntoSafeArea;

export const styles = StyleSheet.create({
  options: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'white',

    // Shadow only works on iOS.
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 4,

    // This will elevate the view on Android, causing shadow to be drawn.
    elevation: 5,
  },
});
