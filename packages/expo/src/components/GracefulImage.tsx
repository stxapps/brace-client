import React from 'react';
import { View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';

class GracefulImage extends React.PureComponent<any, any> {

  static defaultProps: any;

  state = {
    loaded: false,
  };

  onLoad = () => {
    this.setState({ loaded: true });
  };

  render() {
    const { source, style, contentStyle, placeholderColor, customPlaceholder, onError, ...nativeImageProps } = this.props;
    const { loaded } = this.state;

    const viewStyle = [style];
    if (!loaded) {
      viewStyle.push({
        position: 'absolute',
        top: -1,
        left: -1,
        width: 1,
        height: 1,
        overflow: 'hidden',
      });
    }

    const imageStyle = [contentStyle];
    if (loaded) imageStyle.push({ width: '100%', height: '100%' });
    else imageStyle.push({ width: 100, height: 100 });

    let placeHolder;
    if (!loaded) {
      if (customPlaceholder) placeHolder = customPlaceholder();
      else {
        placeHolder = (
          <View style={[style, { backgroundColor: placeholderColor }]} />
        );
      }
    }

    return (
      <React.Fragment>
        <View style={viewStyle}>
          <FastImage source={source} style={imageStyle} onLoad={this.onLoad} onError={() => onError()} {...nativeImageProps} />
        </View>
        {placeHolder}
      </React.Fragment>
    );
  }
}

GracefulImage.defaultProps = {
  style: {},
  contentStyle: {},
  placeholderColor: '#eee',
  customPlaceholder: null,
  onError: () => {},
};

export default GracefulImage;
