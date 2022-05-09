import { ZERO, CENTER, EDGE, AT_TRIGGER, EDGE_TRIGGER } from '../types/const';

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

  // Not include scroll bar width if possible
  const windowWidth = document.documentElement.clientWidth || windowLayout.width;

  return {
    windowLayout: { x: 0, y: 0, width: windowWidth, height: windowLayout.height },
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
