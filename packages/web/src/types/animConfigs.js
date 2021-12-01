import {
  AT_TRIGGER, EDGE_TRIGGER,
  BOTTOM_BAR_DURATION, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
} from './const';
import { subtractRem, negRem } from '../utils';

export const cardItemFMV = {
  hidden: { scale: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.3 } },
  visible: { scale: 1, transition: { type: 'spring', bounce: 0.3, duration: 0.3 } },
};

export const popupBgFMV = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.25 },
};

export const tlPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '-50%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const trPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '50%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const blPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '-50%',
    translateY: '50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const brPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '50%',
    translateY: '50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const tcPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '0%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const ccPopupFMV = {
  hidden: {
    scale: 0,
    //translateX: '0%',
    //translateY: '0%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, /*translateX: '0%', translateY: '0%'*/ },
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

export const bbFMV = {
  hidden: {
    translateY: '100%',
    transition: { duration: BOTTOM_BAR_DURATION / 1000 },
  },
  visible: {
    translateY: '0%',
    transition: { duration: BOTTOM_BAR_DURATION / 1000 },
  },
};

export const bbSearchPopupFMV = {
  hidden: {
    translateY: negRem(subtractRem(BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT)),
    transition: { duration: 0 },
  },
  visible: {
    translateY: negRem(BOTTOM_BAR_HEIGHT),
    transition: { duration: 0 },
  },
  bbHidden: {
    translateY: SEARCH_POPUP_HEIGHT,
    transition: { duration: BOTTOM_BAR_DURATION / 1000 },
  },
  bbVisible: {
    translateY: negRem(subtractRem(BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT)),
    transition: { duration: BOTTOM_BAR_DURATION / 1000 },
  },
  bbVisibleVisible: {
    translateY: negRem(BOTTOM_BAR_HEIGHT),
    transition: { duration: BOTTOM_BAR_DURATION / 1000 },
  },
};

export const bModalFMV = {
  hidden: {
    translateY: '100%',
  },
  visible: {
    translateY: '0%',
  },
};

export const spSideBarCanvasFMV = /** @type {any} */ ({
  hidden: {
    transition: { when: 'afterChildren' },
    transitionEnd: { visibility: 'hidden' },
  },
  visible: {
    visibility: 'visible',
  },
});

export const spSideBarOverlayFMV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const spSideBarFMV = {
  hidden: {
    translateX: '-100%',
  },
  visible: {
    translateX: '0%',
  },
};

export const spListsFMV = {
  hidden: {
    scaleY: 0,
    translateY: '-100%',
  },
  visible: {
    scaleY: 1,
    translateY: '0%',
  },
  exit: {
    opacity: 0,
  },
};

export const statusPopupFMV = {
  hidden: {
    translateX: '100%',
  },
  visible: {
    translateX: '0%',
  },
  hiddenNoAnim: {
    translateX: '100%',
    transition: { duration: 0 },
  },
  visibleNoAnim: {
    translateX: '0%',
    transition: { duration: 0 },
  },
};

export const fetchedPopupFMV = {
  hidden: {
    translateY: '-8rem',
    translateX: '-50%',
  },
  visible: {
    translateY: '0rem',
    translateX: '-50%',
  },
};

export const slideFMV = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};
