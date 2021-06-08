import React from 'react';
import { View, Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';

import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

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
      <View style={tailwind('items-center w-full h-full')}>
        <View style={cache('LO_view', [{ top: '33.3333%', transform: [{ translateY: -24 }] }, tailwind('w-12 h-12')])}>
          <Animated.View style={[tailwind('justify-center items-center w-full h-full'), style]}>
            <SvgXml width={42} height={48} xml={logo} />
          </Animated.View>
        </View>
      </View>
    );
  }
}

export default Loading;
