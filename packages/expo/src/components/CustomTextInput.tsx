import React from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';

/**
 * A custom TextInput component that disables font scaling by default for UI consistency,
 * but allows it to be enabled per-instance for accessibility.
 */
const CustomTextInput = React.forwardRef<TextInput, TextInputProps>(
  ({ allowFontScaling = false, ...props }, ref) => {
    // By default, disable font scaling to maintain UI consistency.
    // It can be enabled on a per-instance basis if needed for accessibility.
    // When enabled, we should consider capping the max scale to prevent layout breaks,
    //   e.g., maxFontSizeMultiplier={1.3}.
    return (
      <TextInput ref={ref} allowFontScaling={allowFontScaling} {...props} />
    );
  },
);

CustomTextInput.displayName = 'CustomTextInput';

export default React.memo(CustomTextInput);
