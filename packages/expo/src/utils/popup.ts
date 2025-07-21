const ZERO = 'ZERO'; // top or left of the window
const CENTER = 'CENTER'; // center of the window
//const EDGE = 'EDGE'; // bottom or right of the window
const AT_TRIGGER = 'AT_TRIGGER'; // top or left of the trigger
const CENTER_TRIGGER = 'CENTER_TRIGGER'; // center of the trigger
const EDGE_TRIGGER = 'EDGE_TRIGGER'; // bottom or right of the trigger

// oDim: options dimension, oSpc: options and window space
// wDim: safe area window dimension
// tPos: trigger position incl. inset begin, tDim: trigger dimension
// iBgn: inset begin
const axisPosition = (oDim, oSpc, wDim, tPos, tDim, iBgn) => {
  // if options are bigger than safe area window dimension, then render at 0
  if (oDim > wDim) {
    return [iBgn + oSpc, ZERO];
  }
  // render at trigger position if possible
  if (tPos + oDim + oSpc <= iBgn + wDim) {
    return [tPos, AT_TRIGGER];
  }
  // aligned to the trigger from the bottom (right)
  if (tPos + tDim - oDim - oSpc - iBgn >= 0) {
    return [tPos + tDim - oDim, EDGE_TRIGGER];
  }
  // compute center position
  const pos = Math.round(tPos + (tDim / 2) - (oDim / 2));
  // top boundary overflows, render at window center instead
  if (pos - oSpc - iBgn < 0) {
    return [Math.round(iBgn + ((wDim - oDim) / 2)), CENTER];
  }
  // bottom boundary overflows, render at window center instead
  if (pos + oDim + oSpc > iBgn + wDim) {
    return [Math.round(iBgn + ((wDim - oDim) / 2)), CENTER];
  }
  // if everything ok, render in center position
  return [pos, CENTER_TRIGGER];
};

const computePosition = (
  triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin = 0,
) => {
  let { x: tX, y: tY, width: tWidth, height: tHeight } = triggerLayout;
  if (triggerOffsets) {
    const { x: xOffset, y: yOffset, width: wOffset, height: hOffset } = triggerOffsets;
    tX = tX + xOffset;
    tY = tY + yOffset;
    tWidth = tWidth + wOffset;
    tHeight = tHeight + hOffset;
  }
  const { width: oWidth, height: oHeight } = optionsLayout;
  const { width: wWidth, height: wHeight } = windowLayout;

  const [top, topOrigin] = axisPosition(
    oHeight, popupMargin, wHeight, tY, tHeight, insets.top,
  );
  const [left, leftOrigin] = axisPosition(
    oWidth, popupMargin, wWidth, tX, tWidth, insets.left,
  );

  return { top, left, topOrigin, leftOrigin, oWidth, oHeight };
};

const getOriginStyle = (topOrigin, leftOrigin) => {
  if (topOrigin === AT_TRIGGER && leftOrigin === AT_TRIGGER) {
    return { transformOrigin: 'top left' };
  } else if (topOrigin === AT_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return { transformOrigin: 'top right' };
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === AT_TRIGGER) {
    return { transformOrigin: 'bottom left' };
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return { transformOrigin: 'bottom right' };
  } else {
    return { transformOrigin: 'center' };
  }
};

const getOriginTranslate = (topOrigin, leftOrigin, oWidth, oHeight) => {
  let startX, startY;
  if (topOrigin === AT_TRIGGER && leftOrigin === AT_TRIGGER) {
    startX = -1 * oWidth * 0.05 / 2;
    startY = -1 * oHeight * 0.05 / 2;
  } else if (topOrigin === AT_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    startX = oWidth * 0.05 / 2;
    startY = -1 * oHeight * 0.05 / 2;
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === AT_TRIGGER) {
    startX = -1 * oWidth * 0.05 / 2;
    startY = oHeight * 0.05 / 2;
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    startX = oWidth * 0.05 / 2;
    startY = oHeight * 0.05 / 2;
  } else {
    startX = 0;
    startY = 0;
  }
  return { startX, startY };
};

export const computePositionStyle = (
  triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin = 0,
) => {
  const { top, left, topOrigin, leftOrigin } = computePosition(
    triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin,
  );
  const { transformOrigin } = getOriginStyle(topOrigin, leftOrigin);

  return { top, left, transformOrigin };
};

export const computePositionTranslate = (
  triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin = 0,
) => {
  const { top, left, topOrigin, leftOrigin, oWidth, oHeight } = computePosition(
    triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin,
  );
  const { startX, startY } = getOriginTranslate(topOrigin, leftOrigin, oWidth, oHeight);

  return { top, left, startX, startY };
};
