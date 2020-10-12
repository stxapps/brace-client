import React from 'react';
import { connect } from 'react-redux';
import {
  View, TouchableOpacity, Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg'

import {
  retryDiedLinks, cancelDiedLinks,
} from '../actions';
import {
  DOMAIN_NAME,
  ADDING, MOVING,
  COLOR, PATTERN, IMAGE,
  SM_WIDTH,
} from '../types/const';
import {
  ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  isDiedStatus, extractUrl,
  isEqual,
} from '../utils';
import { PATTERN_MAP } from '../types/patternPaths';
import { tailwind } from '../stylesheets/tailwind';

import { InterText as Text, withSafeAreaContext } from '.';
import GracefulImage from './GracefulImage';

import CardItemMenuPopup from './CardItemMenuPopup';

const prependDomainName = (/** @type string */ value) => {
  if (value.startsWith('data:')) return value;
  return DOMAIN_NAME + value;
};

class CardItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      extractedFaviconError: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !isEqual(this.props.link.extractedResult, nextProps.link.extractedResult) ||
      this.props.link.status !== nextProps.link.status ||
      !isEqual(this.props.style, nextProps.style) ||
      this.props.safeAreaWidth !== nextProps.safeAreaWidth ||
      this.state.extractedFaviconError !== nextState.extractedFaviconError
    ) {
      return true;
    }

    return false;
  }

  onRetryRetryBtnClick = () => {
    this.props.retryDiedLinks([this.props.link.id]);
  }

  onRetryCancelBtnClick = () => {
    this.props.cancelDiedLinks([this.props.link.id]);
  }

  onExtractedFaviconError = () => {
    this.setState({ extractedFaviconError: true });
  }

  renderBusy() {

    const triangleStyle = {
      transform: [{ 'translateX': 32 }, { 'translateY': -32 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 66,
      left: 34,
      transform: [{ 'translateX': -12 }, { 'translateY': -24 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 right-0 w-16 h-16 bg-transparent rounded-tr-lg overflow-hidden elevation-xs')}>
        <View style={[tailwind('w-16 h-16 bg-white overflow-hidden'), triangleStyle]}>
          <Svg style={[tailwind('w-6 h-6 text-gray-900'), svgStyle]} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  }

  renderRetry() {
    let { url } = this.props.link;

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 bg-black opacity-75 rounded-lg elevation-xs')}></View>
        <View style={tailwind('px-4 absolute inset-0 justify-center items-center bg-transparent rounded-lg elevation-xs')}>
          <Text style={tailwind('text-2xl text-white font-medium text-center')}>Oops..., something went wrong!</Text>
          <View style={tailwind('pt-4 flex-row justify-center items-center')}>
            <TouchableOpacity onPress={this.onRetryRetryBtnClick}>
              <View style={tailwind('px-4 py-1 bg-white border border-white rounded-full')}>
                <Text style={tailwind('text-base text-gray-900 font-semibold text-center')}>Retry</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onRetryCancelBtnClick}>
              <View style={tailwind('ml-4 px-3 py-1 border border-white rounded-full')}>
                <Text style={tailwind('text-base text-white font-semibold text-center')}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
            <Text style={tailwind('mt-10 text-base text-white font-medium text-center')}>Go to the link</Text>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }

  renderImage() {

    const { decor, extractedResult } = this.props.link;

    let image;
    if (extractedResult && extractedResult.image) image = extractedResult.image;

    if (image) {
      return (
        <GracefulImage key="image-graceful-image-extracted-result" style={tailwind('w-full aspect-7/12 bg-white rounded-t-lg shadow-xs')} contentStyle={tailwind('rounded-t-lg')} source={{ uri: image }} />
      );
    }

    let fg = null;
    if (decor.image.fg) {
      const { text } = decor.image.fg;
      fg = (
        <React.Fragment>
          <View style={tailwind('items-center justify-center w-20 h-20 bg-white rounded-full')}>
            <Text style={tailwind('text-5xl text-gray-700 font-semibold uppercase')}>{text}</Text>
          </View>
        </React.Fragment>
      );
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      return (
        <React.Fragment>
          <View style={tailwind(`items-center justify-center w-full aspect-7/12 ${decor.image.bg.value} rounded-t-lg shadow-xs`)}>
            {fg}
          </View>
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      return (
        <View style={tailwind('items-center justify-center w-full aspect-7/12 bg-white rounded-t-lg shadow-xs')}>
          <GracefulImage key="image-graceful-image-pattern" style={tailwind('absolute inset-0 bg-white rounded-t-lg')} contentStyle={tailwind('rounded-t-lg')} source={PATTERN_MAP[decor.image.bg.value]} />
          {fg}
        </View>
      );
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return (
        <GracefulImage key="image-graceful-image-decor" style={tailwind('w-full aspect-7/12 bg-white rounded-t-lg shadow-xs')} contentStyle={tailwind('rounded-t-lg')} source={{ uri: prependDomainName(decor.image.bg.value) }} />
      );
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  }

  renderFavicon() {

    const placeholder = () => {
      if (decor.favicon.bg.type === COLOR) {
        return <View style={tailwind(`flex-shrink-0 flex-grow-0 w-4 h-4 ${decor.favicon.bg.value} rounded-full`)}></View>;
      }

      if (decor.favicon.bg.type === PATTERN) {
        return (
          <GracefulImage key="favicon-graceful-image-pattern" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4 rounded-full')} source={PATTERN_MAP[decor.favicon.bg.value]} />
        );
      }
    };

    const { url, decor, extractedResult } = this.props.link;
    const { extractedFaviconError } = this.state;

    let favicon;
    if (extractedResult && extractedResult.favicon) {
      favicon = ensureContainUrlSecureProtocol(extractedResult.favicon);
    }

    if (favicon && !extractedFaviconError) {
      return <GracefulImage key="favicon-graceful-image-extracted-result" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4')} source={{ uri: favicon }} customPlaceholder={placeholder} onError={this.onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = ensureContainUrlSecureProtocol(origin) + '/favicon.ico';

    return <GracefulImage key="favicon-graceful-image-ico" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4')} source={{ uri: favicon }} customPlaceholder={placeholder} />;
  }

  render() {

    const { style, safeAreaWidth } = this.props;
    const { url, status, extractedResult } = this.props.link;

    // Need to do this as React Native doesn't support maxWidth: "none"
    //   even though it's in tailwind-rn.
    const viewStyle = safeAreaWidth < SM_WIDTH ? 'max-w-sm' : '';

    let title, classNames = '';
    if (extractedResult && extractedResult.title) {
      title = extractedResult.title;
      classNames = 'text-justify';
    }
    if (!title) {
      title = url;
    }

    const { host, origin } = extractUrl(url);

    return (
      <View style={style}>
        <View style={tailwind(`self-center bg-white rounded-lg shadow ${viewStyle}`)}>
          {this.renderImage()}
          <View style={tailwind('flex-row justify-between items-center w-full')}>
            <View style={tailwind('pl-4 flex-shrink flex-grow flex-row items-center lg:pl-5', safeAreaWidth)}>
              {this.renderFavicon()}
              <View style={tailwind('flex-shrink flex-grow')}>
                <TouchableOpacity onPress={() => Linking.openURL(origin)}>
                  <Text style={tailwind('pl-2 text-base text-gray-700')} numberOfLines={1} ellipsizeMode="tail">{host}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <CardItemMenuPopup link={this.props.link} />
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
            <Text style={tailwind(`mt-0 mb-3 ml-4 mr-3 text-base text-gray-800 font-semibold leading-6.5 ${classNames} lg:mb-4 lg:ml-5 lg:mr-4`, safeAreaWidth)}>{title}</Text>
          </TouchableOpacity>
          {isDiedStatus(status) && this.renderRetry()}
          {[ADDING, MOVING].includes(status) && this.renderBusy()}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  retryDiedLinks, cancelDiedLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(CardItem));
