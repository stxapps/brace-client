import React from 'react';
import { Text } from 'react-native';
import type { TextProps } from 'react-native';

/**
 * A custom Text component that disables font scaling by default for UI consistency,
 * but allows it to be enabled per-instance for accessibility.
 */
const CustomText = React.forwardRef<Text, TextProps>(
  ({ allowFontScaling = false, ...props }, ref) => {
    // By default, disable font scaling to maintain UI consistency.
    // It can be enabled on a per-instance basis if needed for accessibility.
    // When enabled, we must cap the max scale to prevent layout breaks,
    //   like maxFontSizeMultiplier={1.3}.
    return <Text ref={ref} allowFontScaling={allowFontScaling} {...props} />;
  },
);

CustomText.displayName = 'CustomText';

export default React.memo(CustomText);
