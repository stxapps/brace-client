import { Variants } from 'motion/react';

import { BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT } from './const';
import { subtractRem, negRem } from '../utils';

export const cardItemFMV: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { ease: 'easeIn', duration: 0.075 },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ease: 'easeOut', duration: 0.1 },
  },
};

export const popupBgFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.075 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.1 } },
};

export const popupFMV: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { ease: 'easeIn', duration: 0.075 },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ease: 'easeOut', duration: 0.1 },
  },
};

export const dialogBgFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.2 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.3 } },
};

export const dialogFMV: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { ease: 'easeIn', duration: 0.2 },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ease: 'easeOut', duration: 0.3 },
  },
};

export const bbFMV: Variants = {
  hidden: {
    translateY: '100%',
    transition: { ease: 'easeIn', duration: 0.075 },
  },
  visible: {
    translateY: '0%',
    transition: { ease: 'easeOut', duration: 0.1 },
  },
};

export const bbSearchPopupFMV: Variants = {
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
    transition: { ease: 'easeIn', duration: 0.075 },
  },
  bbVisible: {
    translateY: negRem(subtractRem(BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT)),
    transition: { ease: 'easeIn', duration: 0.075 },
  },
  bbVisibleVisible: {
    translateY: negRem(BOTTOM_BAR_HEIGHT),
    transition: { ease: 'easeOut', duration: 0.1 },
  },
};

export const bModalBgFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.2 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.2 } },
};

export const bModalFMV: Variants = {
  hidden: {
    translateY: '100%',
    transition: { ease: 'easeIn', duration: 0.2 },
  },
  visible: {
    translateY: '0%',
    transition: { ease: 'easeOut', duration: 0.2 },
  },
};

export const canvasFMV: Variants = {
  hidden: {
    transition: { when: 'afterChildren' },
    visibility: 'hidden',
  },
  visible: {
    visibility: 'visible',
  },
};

export const sideBarOverlayFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.2 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.2 } },
};

export const sideBarFMV: Variants = {
  hidden: {
    translateX: '-100%',
    transition: { ease: 'easeIn', duration: 0.2 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeOut', duration: 0.2 },
  },
};

export const listsFMV: Variants = {
  hidden: {
    scaleY: 0,
    translateY: '-100%',
    transition: { ease: 'easeIn', duration: 0.15 },
  },
  visible: {
    scaleY: 1,
    translateY: '0%',
    transition: { ease: 'easeOut', duration: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { ease: 'easeIn', duration: 0.15 }
  },
};

export const statusPopupFMV: Variants = {
  hidden: {
    translateX: '100%',
    transition: { ease: 'easeIn', duration: 0.15 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeOut', duration: 0.15 },
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

export const fetchedPopupFMV: Variants = {
  hidden: {
    translateY: '-8rem',
    translateX: '-50%',
    transition: { ease: 'easeIn', duration: 0.15 },
  },
  visible: {
    translateY: '0rem',
    translateX: '-50%',
    transition: { ease: 'easeOut', duration: 0.15 },
  },
};

export const slideInPopupFMV = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.225,
};

export const slideInModalFMV = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};
