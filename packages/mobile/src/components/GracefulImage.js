import React from 'react';
import { View, Image } from 'react-native';

class GracefulImage extends React.PureComponent {

  state = {
    loaded: false,
  };

  onLoad = () => {
    this.setState({ loaded: true });
  }

  render() {
    const { source, style, placeholderColor, customPlaceholder, ...nativeImageProps } = this.props;
    const { loaded } = this.state;

    const imageStyle = [style];
    if (!loaded) imageStyle.push({ display: 'none' });

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
        <View style={imageStyle}>
          <Image source={source} style={{ width: '100%', height: '100%' }} onLoad={this.onLoad} {...nativeImageProps} />
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
}

export default GracefulImage;
