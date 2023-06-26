import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { connect } from 'react-redux';

import { updateBulkEdit, addSelectedLinkIds } from '../actions';
import { DOMAIN_NAME, COLOR, PATTERN, IMAGE } from '../types/const';
import { makeGetCustomImage, getThemeMode } from '../selectors';
import {
  removeTailingSlash, ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  extractUrl, isEqual, isDecorValid,
} from '../utils';
import cache from '../utils/cache';
import { PATTERN_MAP } from '../types/patternPaths';

import { withTailwind } from '.';
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
      this.props.link.url !== nextProps.link.url ||
      this.props.link.status !== nextProps.link.status ||
      !isEqual(this.props.link.decor, nextProps.link.decor) ||
      !isEqual(this.props.link.extractedResult, nextProps.link.extractedResult) ||
      !isEqual(this.props.link.custom, nextProps.link.custom) ||
      this.props.customImage !== nextProps.customImage ||
      this.props.tailwind !== nextProps.tailwind ||
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
    const { customImage, tailwind } = this.props;

    let image;

    if (customImage) image = customImage;
    if (image) {
      return <Image key="img-image-custom" style={tailwind('w-full rounded-t-lg bg-white blk:bg-gray-900 aspect-7/12 shadow-xs')} source={cache(`CI_image_${image}`, { uri: image }, [image])} />;
    }

    if (extractedResult && extractedResult.image) image = extractedResult.image;
    if (image) {
      return <GracefulImage key="image-graceful-image-extracted-result" style={tailwind('w-full rounded-t-lg bg-white blk:bg-gray-900 aspect-7/12 shadow-xs')} contentStyle={tailwind('rounded-t-lg')} source={cache(`CI_image_${image}`, { uri: image }, [image])} />;
    }

    let fg = null;
    if (isDecorValid(decor) && decor.image.fg) {
      const { text } = decor.image.fg;
      fg = (
        <React.Fragment>
          <View style={tailwind('h-20 w-20 items-center justify-center rounded-full bg-white')}>
            <Text style={[tailwind('text-5xl font-medium uppercase text-gray-700'), { lineHeight: 58 }]}>{text}</Text>
          </View>
        </React.Fragment>
      );
    }

    // Only plain color background or plain color background with a letter
    if (isDecorValid(decor) && decor.image.bg.type === COLOR) {
      let blkClassNames = 'blk:border-b blk:border-gray-700';
      if (decor.image.bg.value !== 'bg-gray-800') blkClassNames = '';
      return (
        <React.Fragment>
          <View style={tailwind(`w-full items-center justify-center rounded-t-lg aspect-7/12 shadow-xs ${decor.image.bg.value} ${blkClassNames}`)}>
            {fg}
          </View>
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (isDecorValid(decor) && decor.image.bg.type === PATTERN) {
      return (
        <View style={tailwind('w-full items-center justify-center rounded-t-lg bg-white blk:bg-gray-900 aspect-7/12 shadow-xs')}>
          <GracefulImage key="image-graceful-image-pattern" style={tailwind('absolute inset-0 rounded-t-lg bg-white blk:bg-gray-900')} contentStyle={tailwind('rounded-t-lg')} source={PATTERN_MAP[decor.image.bg.value]} />
          {fg}
        </View>
      );
    }

    // Random image
    if (isDecorValid(decor) && decor.image.bg.type === IMAGE) {
      return <GracefulImage key="image-graceful-image-decor" style={tailwind('w-full rounded-t-lg bg-white blk:bg-gray-900 aspect-7/12 shadow-xs')} contentStyle={tailwind('rounded-t-lg')} source={cache(`CI_decorImage_${decor.image.bg.value}`, { uri: prependDomainName(decor.image.bg.value) }, [decor.image.bg.value])} />;
    }

    console.log(`In CardItemContent.renderImage, invalid decor: ${JSON.stringify(decor)}`);
    return null;
  }

  renderFavicon() {
    const { tailwind } = this.props;

    const placeholder = () => {
      if (isDecorValid(decor) && decor.favicon.bg.type === COLOR) {
        return <View style={tailwind(`h-4 w-4 flex-shrink-0 flex-grow-0 rounded-full ${decor.favicon.bg.value}`)} />;
      }

      if (isDecorValid(decor) && decor.favicon.bg.type === PATTERN) {
        return (
          <GracefulImage key="favicon-graceful-image-pattern" style={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0 rounded-full')} source={PATTERN_MAP[decor.favicon.bg.value]} />
        );
      }

      return null;
    };

    const { url, decor, extractedResult } = this.props.link;
    const { extractedFaviconError } = this.state;

    let favicon;
    if (extractedResult && extractedResult.favicon) {
      favicon = ensureContainUrlSecureProtocol(extractedResult.favicon);
    }

    if (favicon && !extractedFaviconError) {
      return <GracefulImage key="favicon-graceful-image-extracted-result" style={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0')} source={cache(`CI_favicon_${favicon}`, { uri: favicon }, [favicon])} customPlaceholder={placeholder} onError={this.onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = removeTailingSlash(origin) + '/favicon.ico';
    favicon = ensureContainUrlSecureProtocol(favicon);

    return <GracefulImage key="favicon-graceful-image-ico" style={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0')} source={cache(`CI_favicon_${favicon}`, { uri: favicon }, [favicon])} customPlaceholder={placeholder} />;
  }

  render() {
    const { link, tailwind } = this.props;
    const { url, extractedResult, custom } = link;

    let title;
    if (custom && custom.title) {
      title = custom.title;
    } else if (extractedResult && extractedResult.title) {
      title = extractedResult.title;
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
        <View style={tailwind('w-full flex-row items-center justify-between')}>
          <View style={tailwind('flex-shrink flex-grow flex-row items-center pl-4')}>
            {this.renderFavicon()}
            <View style={tailwind('flex-shrink flex-grow')}>
              <TouchableOpacity onPress={() => Linking.openURL(origin)}>
                <Text style={tailwind('pl-2 text-base font-normal text-gray-500 blk:text-gray-300')} numberOfLines={1} ellipsizeMode="tail">{host}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <CardItemMenuPopup link={link} />
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
          <Text style={tailwind('mt-0 mb-3 ml-4 mr-3 text-base font-medium leading-6 text-gray-800 blk:text-gray-100 lg:mb-4')}>{title}</Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  }
}

CardItemContent.propTypes = {
  link: PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {

  const getCustomImage = makeGetCustomImage();

  const mapStateToProps = (state, props) => {
    const customImage = getCustomImage(state, props.link);

    return {
      customImage,
      themeMode: getThemeMode(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = { updateBulkEdit, addSelectedLinkIds };

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemContent));
