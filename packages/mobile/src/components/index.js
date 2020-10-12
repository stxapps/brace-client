import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { withSafeAreaInsets } from 'react-native-safe-area-context';

const buildComponent = (defaultStyle = null, styleFn = null) => Component => {

  class StyledComponent extends React.PureComponent {
    render() {
      const { forwardedRef, style, ...rest } = this.props;
      const props = { style: [], ...rest };

      if (defaultStyle) {
        const s = StyleSheet.flatten([defaultStyle].flat());
        props.style.push(s);
      }
      if (style) {
        const s = StyleSheet.flatten([style].flat());
        props.style.push(s);
      }
      props.style = StyleSheet.flatten(props.style);
      if (styleFn) {
        props.style = styleFn(props.style);
      }

      return <Component {...props} ref={forwardedRef} />;
    }
  }

  return React.forwardRef((props, ref) => {
    return <StyledComponent {...props} forwardedRef={ref} />;
  });
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Inter',
    fontSize: 16,
  }
});

const styleTextFn = (style) => {
  const m = {
    '100': 'Thin',
    '200': 'ExtraLight',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'SemiBold',
    '700': 'Bold',
    '800': 'ExtraBold',
    '900': 'Black',
  };

  if (style.fontFamily === 'Inter') {
    let suffix;
    if (style.fontWeight === 'bold') suffix = 'Bold';
    else if (style.fontWeight === 'normal') suffix = 'Regular';
    else if (Object.keys(m).includes(style.fontWeight)) suffix = m[style.fontWeight];
    else suffix = 'Regular';

    style.fontFamily = style.fontFamily + '-' + suffix;
    delete style.fontWeight;
  }

  return style;
};

/**
 * @type {Text}
 */
export const InterText = /** @type {any} */ (buildComponent(styles.text, styleTextFn)(Text));

/**
 * @type {TextInput}
 */
export const InterTextInput = /** @type {any} */ (buildComponent(styles.text, styleTextFn)(TextInput));

const withSafeAreaSize = (Component) => {

  class SafeAreaSizeCompoment extends React.PureComponent {
    render() {
      const { forwardedRef, windowWidth, windowHeight, insets, ...rest } = this.props;
      if (!insets) throw new Error(`Illegal insets: ${insets}`);

      const props = { insets, ...rest };
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
