import React from 'react';
import { View, Animated } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';

import { getThemeMode } from '../selectors';
import cache from '../utils/cache';

import { withTailwind } from '.';

import logo from '../images/logo-short.svg';

class Loading extends React.PureComponent {

  constructor(props) {
    super(props);

    this.rotateX = new Animated.Value(0);
    this.rotateY = new Animated.Value(0);
  }

  componentDidMount() {
    const duration = 650;

    Animated.loop(
      Animated.sequence([
        Animated.timing(this.rotateY, {
          toValue: 100,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(this.rotateX, {
          toValue: 100,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(this.rotateY, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(this.rotateX, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  render() {
    // safeAreaWidth is undefined as init is not called yet,
    //   use tailwind with care!
    const { tailwind } = this.props;

    const rotateX = this.rotateX.interpolate({
      inputRange: [0, 100],
      outputRange: ['0deg', '180deg'],
      extrapolate: 'clamp',
    });
    const rotateY = this.rotateY.interpolate({
      inputRange: [0, 100],
      outputRange: ['0deg', '180deg'],
      extrapolate: 'clamp',
    });
    const style = {
      transform: [{ perspective: 800 }, { rotateX: rotateX }, { rotateY: rotateY }],
    };

    return (
      <View style={tailwind('h-full w-full items-center')}>
        <View style={cache('LO_view', [{ top: '33.3333%', transform: [{ translateY: -24 }] }, tailwind('h-12 w-12')])}>
          <Animated.View style={[tailwind('h-full w-full items-center justify-center'), style]}>
            <SvgXml width={42} height={48} xml={logo} />
          </Animated.View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
  };
};

export default connect(mapStateToProps)(withTailwind(Loading));
