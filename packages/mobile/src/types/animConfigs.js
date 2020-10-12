import { LayoutAnimation } from 'react-native';

import { SM_WIDTH } from "./const";

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
