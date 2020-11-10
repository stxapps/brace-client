import React from 'react';
import { withSafeAreaInsets } from 'react-native-safe-area-context';

const withSafeAreaSize = (Component) => {

  class SafeAreaSizeCompoment extends React.PureComponent {
    render() {
      const { forwardedRef, windowWidth, windowHeight, insets, ...rest } = this.props;
      if (!insets) throw new Error(`Illegal insets: ${insets}`);

      const props = { windowWidth, windowHeight, insets, ...rest };
      if (windowWidth) {
        const safeAreaWidth = windowWidth - insets.left - insets.right;
        props['safeAreaWidth'] = safeAreaWidth;
      }
      if (windowHeight) {
        const safeAreaHeight = windowHeight - insets.top - insets.bottom;
        props['safeAreaHeight'] = safeAreaHeight;
      }

      return <Component {...props} ref={forwardedRef} />;
    }
  }

  return React.forwardRef((props, ref) => {
    return <SafeAreaSizeCompoment {...props} forwardedRef={ref} />;
  });
};

export const withSafeAreaContext = (Component) => {
  return withSafeAreaInsets(withSafeAreaSize(Component));
};
