export const ZERO = 'ZERO'; // top or left of the window
export const CENTER = 'CENTER'; // center of the window
export const EDGE = 'EDGE'; // bottom or right of the window
export const AT_TRIGGER = 'AT_TRIGGER'; // top or left of the trigger
export const EDGE_TRIGGER = 'EDGE_TRIGGER'; // bottom or right of the trigger

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

export const computePosition = (layouts, triggerOffsets) => {
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
  const [top, topOrigin] = axisPosition(oHeight, wHeight, tY - wY, tHeight);
  const [left, leftOrigin] = axisPosition(oWidth, wWidth, tX - wX, tWidth);

  return { top, left, topOrigin, leftOrigin };
};

export const createLayouts = (triggerLayout, optionsLayout) => {

  // Not include scroll bar width if possible
  const windowWidth = document.documentElement.clientWidth || window.innerWidth;

  return {
    windowLayout: {
      x: 0,
      y: 0,
      width: windowWidth,
      height: window.innerHeight,
    },
    triggerLayout: triggerLayout,
    optionsLayout: optionsLayout,
  };
};
