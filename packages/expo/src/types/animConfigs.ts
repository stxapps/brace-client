import { LayoutAnimation, Easing } from 'react-native';

import { toPx } from '../utils';

import { SM_WIDTH } from './const';

export const cardItemFMV = (safeAreaWidth) => {
  if (safeAreaWidth < toPx(SM_WIDTH)) {
    return LayoutAnimation.create(
      225,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.scaleY
    );
  }

  return LayoutAnimation.create(
    225,
    LayoutAnimation.Types.easeInEaseOut,
    LayoutAnimation.Properties.scaleXY
  );
};

export const popupFMV = {
  hidden: {
    duration: 75,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  },
  visible: {
    duration: 100,
    easing: Easing.bezier(0, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

export const dialogFMV = {
  hidden: {
    duration: 200,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  },
  visible: {
    duration: 300,
    easing: Easing.bezier(0, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

export const bbFMV = {
  hidden: {
    duration: 75,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  },
  visible: {
    duration: 100,
    easing: Easing.bezier(0, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

export const bModalFMV = {
  hidden: {
    duration: 200,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  },
  visible: {
    duration: 200,
    easing: Easing.bezier(0, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

export const sidebarFMV = {
  hidden: {
    duration: 200,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  },
  visible: {
    duration: 200,
    easing: Easing.bezier(0, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

export const listsFMV = () => {
  return LayoutAnimation.create(
    150,
    LayoutAnimation.Types.easeInEaseOut,
    LayoutAnimation.Properties.scaleY
  );
};

export const statusPopupFMV = {
  hidden: {
    duration: 150,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  },
  visible: {
    duration: 150,
    easing: Easing.bezier(0, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

export const fetchedPopupFMV = {
  hidden: {
    duration: 150,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  },
  visible: {
    duration: 150,
    easing: Easing.bezier(0, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

export const slideInPopupFMV = {
  duration: 225,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
  useNativeDriver: true,
};

export const slideInModalFMV = {
  duration: 300,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
  useNativeDriver: true,
};
