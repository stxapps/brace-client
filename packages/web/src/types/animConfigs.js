import { AT_TRIGGER, EDGE_TRIGGER } from './const';

export const cardItemFMV = {
  hidden: { scale: 0 },
  visible: { scale: 1 },
};

export const popupBgFMV = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.25 }
};

export const tlPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '-50%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' }
};

export const trPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '50%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' }
};

export const blPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '-50%',
    translateY: '50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' }
};

export const brPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '50%',
    translateY: '50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' }
};

export const tcPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '0%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' }
};

export const ccPopupFMV = {
  hidden: {
    scale: 0,
    //translateX: '0%',
    //translateY: '0%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, /*translateX: '0%', translateY: '0%'*/ }
};

export const getPopupFMV = (topOrigin, leftOrigin) => {

  if (topOrigin === AT_TRIGGER && leftOrigin === AT_TRIGGER) {
    return tlPopupFMV;
  } else if (topOrigin === AT_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return trPopupFMV;
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === AT_TRIGGER) {
    return blPopupFMV;
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return brPopupFMV;
  } else {
    return ccPopupFMV;
  }
};
