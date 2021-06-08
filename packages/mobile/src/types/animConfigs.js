import { LayoutAnimation } from 'react-native';

import { SM_WIDTH } from './const';

export const cardItemAnimConfig = (safeAreaWidth) => {

  if (safeAreaWidth < SM_WIDTH) {
    return LayoutAnimation.create(
      225,
      LayoutAnimation.Types.easeInEaseOut,
      /** @ts-ignore */
      LayoutAnimation.Properties.scaleY
    );
  }

  return LayoutAnimation.create(
    225,
    LayoutAnimation.Types.easeInEaseOut,
    LayoutAnimation.Properties.scaleXY
  );
};

export const popupOpenAnimConfig = {
  stiffness: 220,
  damping: 17,
  mass: 1,
  useNativeDriver: true,
};

export const popupCloseAnimConfig = {
  stiffness: 110,
  damping: 10,
  mass: 1,
  overshootClamping: true,
  useNativeDriver: true,
};

export const popoverOpenAnimConfig = {
  stiffness: 220,
  damping: 17,
  mass: 1,
  useNativeDriver: true,
};

export const popoverCloseAnimConfig = {
  stiffness: 110,
  damping: 10,
  mass: 1,
  overshootClamping: true,
  useNativeDriver: true,
};

export const bbAnimConfig = {
  stiffness: 220,
  damping: 17,
  mass: 1,
  overshootClamping: true,
  useNativeDriver: true,
};

export const bModalOpenAnimConfig = {
  stiffness: 300,
  damping: 20,
  mass: 1,
  useNativeDriver: true,
};

export const bModalCloseAnimConfig = {
  stiffness: 200,
  damping: 10,
  mass: 1,
  overshootClamping: true,
  useNativeDriver: true,
};

export const spListsAnimConfig = () => {
  return LayoutAnimation.create(
    225,
    LayoutAnimation.Types.easeInEaseOut,
    /** @ts-ignore */
    LayoutAnimation.Properties.scaleY
  );
};

export const statusPopupAnimConfig = {
  visible: {
    stiffness: 300,
    damping: 20,
    mass: 1,
    useNativeDriver: true,
  },
  hidden: {
    stiffness: 200,
    damping: 10,
    mass: 1,
    overshootClamping: true,
    useNativeDriver: true,
  },
};
