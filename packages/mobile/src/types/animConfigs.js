import { LayoutAnimation } from 'react-native';

import { SM_WIDTH } from "./const";

export const cardItemAnimConfig = (windowWidth) => {
  if (windowWidth < SM_WIDTH) {
    return LayoutAnimation.create(
      200,
      LayoutAnimation.Types.linear,
      LayoutAnimation.Properties.opacity
    );
  }
  return LayoutAnimation.create(
    200,
    LayoutAnimation.Types.easeInEaseOut,
    LayoutAnimation.Properties.scaleXY
  );
};
