import React from 'react';
import { StyleSheet, Text } from 'react-native';

const buildComponent = (Component, defaultStyle = null, styleFn = null) => ({ style, ...rest }) => {
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

  return <Component {...props} />;
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Inter',
    fontSize: 16,
  }
});

export const InterText = buildComponent(
  Text,
  styles.text,
  (style) => {

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
      style.fontWeight = 'normal';
    }

    return style;
  }
);
