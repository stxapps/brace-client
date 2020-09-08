import React from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image'

class GracefulImage extends React.PureComponent {

  state = {
    loaded: false,
  };

  onLoad = () => {
    this.setState({ loaded: true });
  }

  render() {
    const { source, style, placeholderColor, customPlaceholder, onError, ...nativeImageProps } = this.props;
    const { loaded } = this.state;

    const viewStyle = [style];
    if (!loaded) viewStyle.push({
      position: 'absolute',
      top: -1,
      left: -1,
      width: 1,
      height: 1,
      overflow: 'hidden',
    });

    let imageStyle;
    if (loaded) imageStyle = { width: '100%', height: '100%' };
    else imageStyle = { width: 100, height: 100 };

    let placeHolder;
    if (!loaded) {
      if (customPlaceholder) placeHolder = customPlaceholder();
      else {
        placeHolder = (
          <View style={[style, { backgroundColor: placeholderColor }]}></View>
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
  placeholderColor: '#eee',
  customPlaceholder: null,
  onError: () => { },
}

export default GracefulImage;
