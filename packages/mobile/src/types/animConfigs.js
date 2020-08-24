import { LayoutAnimation } from 'react-native';

import { SM_WIDTH } from "./const";

export const cardItemAnimConfig = (windowWidth) => {

  if (windowWidth < SM_WIDTH) {
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
