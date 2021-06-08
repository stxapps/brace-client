import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

import { updateBulkEdit, addSelectedLinkIds } from '../actions';
import { DOMAIN_NAME, COLOR, PATTERN, IMAGE } from '../types/const';
import {
  ensureContainUrlProtocol, ensureContainUrlSecureProtocol, extractUrl, isEqual,
} from '../utils';
import cache from '../utils/cache';
import { PATTERN_MAP } from '../types/patternPaths';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';
import GracefulImage from './GracefulImage';

import CardItemMenuPopup from './CardItemMenuPopup';

const prependDomainName = (/** @type string */ value) => {
  if (value.startsWith('data:')) return value;
  return DOMAIN_NAME + value;
};

class CardItemContent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      extractedFaviconError: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      // Status changed needs to re-render CardItemMenuPopup
      this.props.link.status !== nextProps.link.status ||
      !isEqual(this.props.link.extractedResult, nextProps.link.extractedResult) ||
      this.props.safeAreaWidth !== nextProps.safeAreaWidth ||
      this.state.extractedFaviconError !== nextState.extractedFaviconError
    ) {
      return true;
    }

    return false;
  }

  onLongPress = () => {
    this.props.updateBulkEdit(true);
    this.props.addSelectedLinkIds([this.props.link.id]);
  }

  onExtractedFaviconError = () => {
    this.setState({ extractedFaviconError: true });
  }

  renderImage() {

    const { decor, extractedResult } = this.props.link;

    let image;
    if (extractedResult && extractedResult.image) image = extractedResult.image;

    if (image) {
      return <GracefulImage key="image-graceful-image-extracted-result" style={tailwind('w-full aspect-7/12 bg-white rounded-t-lg shadow-xs')} contentStyle={tailwind('rounded-t-lg')} source={cache(`CI_image_${image}`, { uri: image }, image)} />;
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
      return <GracefulImage key="image-graceful-image-decor" style={tailwind('w-full aspect-7/12 bg-white rounded-t-lg shadow-xs')} contentStyle={tailwind('rounded-t-lg')} source={cache(`CI_decorImage_${decor.image.bg.value}`, { uri: prependDomainName(decor.image.bg.value) }, decor.image.bg.value)} />;
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  }

  renderFavicon() {

    const placeholder = () => {
      if (decor.favicon.bg.type === COLOR) {
        return <View style={tailwind(`flex-shrink-0 flex-grow-0 w-4 h-4 ${decor.favicon.bg.value} rounded-full`)} />;
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
      return <GracefulImage key="favicon-graceful-image-extracted-result" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4')} source={cache(`CI_favicon_${favicon}`, { uri: favicon }, favicon)} customPlaceholder={placeholder} onError={this.onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = ensureContainUrlSecureProtocol(origin) + '/favicon.ico';

    return <GracefulImage key="favicon-graceful-image-ico" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4')} source={cache(`CI_favicon_${favicon}`, { uri: favicon }, favicon)} customPlaceholder={placeholder} />;
  }

  render() {

    const { link, safeAreaWidth } = this.props;
    const { url, extractedResult } = link;

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
      <React.Fragment>
        <TouchableOpacity activeOpacity={1.0} onLongPress={this.onLongPress}>
          {this.renderImage()}
        </TouchableOpacity>
        <View style={tailwind('flex-row justify-between items-center w-full')}>
          <View style={tailwind('pl-4 flex-shrink flex-grow flex-row items-center lg:pl-5', safeAreaWidth)}>
            {this.renderFavicon()}
            <View style={tailwind('flex-shrink flex-grow')}>
              <TouchableOpacity onPress={() => Linking.openURL(origin)}>
                <Text style={tailwind('pl-2 text-base text-gray-700 font-normal')} numberOfLines={1} ellipsizeMode="tail">{host}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <CardItemMenuPopup link={link} />
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
          <Text style={tailwind(`mt-0 mb-3 ml-4 mr-3 text-base text-gray-800 font-semibold leading-6.5 ${classNames} lg:mb-4 lg:ml-5 lg:mr-4`, safeAreaWidth)}>{title}</Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  }
}

CardItemContent.propTypes = {
  link: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { updateBulkEdit, addSelectedLinkIds };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(CardItemContent));
