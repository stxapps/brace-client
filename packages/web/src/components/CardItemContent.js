import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';

import { updatePopup, updateBulkEdit, addSelectedLinkIds } from '../actions';
import { COLOR, PATTERN, IMAGE } from '../types/const';
import { makeGetCustomImage, getSafeAreaWidth, getThemeMode } from '../selectors';
import {
  removeTailingSlash, ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  extractUrl, isEqual,
} from '../utils';

import { withTailwind } from '.';

class CardItemContent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      extractedFaviconError: false,
    };

    this.clickPressTimer = null;
    this.touchPressTimer = null;
  }

  componentWillUnmount() {
    clearTimeout(this.clickPressTimer);
    clearTimeout(this.touchPressTimer);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.link.url !== nextProps.link.url ||
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

  onClickPress = (event) => {
    this.clickPressTimer = setTimeout(() => {
      this.props.updateBulkEdit(true);
      this.props.addSelectedLinkIds([this.props.link.id]);
    }, 500);
  }

  onClickPressRelease = (event) => {
    clearTimeout(this.clickPressTimer);
  }

  onTouchPress = (event) => {
    this.touchPressTimer = setTimeout(() => {
      this.props.updateBulkEdit(true);
      this.props.addSelectedLinkIds([this.props.link.id]);
    }, 500);
  }

  onTouchPressRelease = (event) => {
    clearTimeout(this.touchPressTimer);
  }

  onMenuBtnClick = (e) => {
    const menuBtnPosition = e.currentTarget.getBoundingClientRect();
    this.props.updatePopup(this.props.link.id, true, menuBtnPosition);
    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
  }

  onExtractedFaviconError = () => {
    this.setState({ extractedFaviconError: true });
  }

  renderImage() {
    const { url, decor, extractedResult } = this.props.link;
    const { customImage, tailwind } = this.props;

    let image;

    if (customImage) image = customImage;
    if (image) {
      return <img key="img-image-custom" className={tailwind('absolute h-full w-full object-cover object-center ring-1 ring-black ring-opacity-5 blk:ring-0')} src={image} alt={`illustration of ${url}`} />;
    }

    if (extractedResult && extractedResult.image) image = extractedResult.image;
    if (image) {
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="image-graceful-image-extracted-result" className={tailwind('absolute h-full w-full object-cover object-center ring-1 ring-black ring-opacity-5 blk:ring-0')} src={image} alt={`illustration of ${url}`} />;
    }

    let fg = null;
    if (decor.image.fg) {
      const { text } = decor.image.fg;
      fg = (
        <React.Fragment>
          <div className={tailwind('absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white')} />
          <div className={tailwind('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-5xl font-medium uppercase leading-none text-gray-700')}>{text}</div>
        </React.Fragment>
      );
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      let blkClassNames = 'blk:ring-1 blk:ring-white blk:ring-opacity-10';
      if (decor.image.bg.value !== 'bg-gray-800') blkClassNames = '';
      return (
        <React.Fragment>
          <div className={tailwind(`absolute h-full w-full ${decor.image.bg.value} ${blkClassNames}`)} />
          {fg}
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      // Require both 'pattern' and [pattern_name] class names
      return (
        <React.Fragment>
          <div className={tailwind(`absolute h-full w-full pattern ${decor.image.bg.value}`)} />
          {fg}
        </React.Fragment>
      );
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return <GracefulImage key="image-graceful-image-decor" className={tailwind('absolute h-full w-full object-cover object-center')} src={decor.image.bg.value} alt={`illustration of ${url}`} />;
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  }

  renderFavicon() {
    const { tailwind } = this.props;

    const placeholder = (ref) => {
      if (decor.favicon.bg.type === COLOR) {
        return <div ref={ref} className={tailwind(`h-4 w-4 flex-shrink-0 flex-grow-0 rounded-full ${decor.favicon.bg.value}`)} />;
      }

      if (decor.favicon.bg.type === PATTERN) {
        // Require both 'pattern' and [pattern_name] class names
        // Require under relative class
        return (
          <div ref={ref} className={tailwind('flex-shrink-0 flex-grow-0')}>
            <div className={tailwind('relative')}>
              <div className={tailwind(`h-4 w-4 rounded-full pattern ${decor.favicon.bg.value}`)} />
            </div>
          </div>
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
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="favicon-graceful-image-extracted-result" className={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0 overflow-hidden')} src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} onError={this.onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = removeTailingSlash(origin) + '/favicon.ico';
    favicon = ensureContainUrlSecureProtocol(favicon);

    return <GracefulImage key="favicon-graceful-image-ico" className={tailwind('h-4 w-4 flex-shrink-0 flex-grow-0 overflow-hidden')} src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} />;
  }

  render() {
    const { tailwind } = this.props;
    const { url, extractedResult, custom } = this.props.link;

    let title, classNames = '';
    if (custom && custom.title) {
      title = custom.title;
      classNames = 'text-justify hyphens-auto';
    } else if (extractedResult && extractedResult.title) {
      title = extractedResult.title;
      classNames = 'text-justify hyphens-auto';
    }
    if (!title) {
      title = url;
      classNames = 'break-all';
    }

    const { host, origin } = extractUrl(url);

    return (
      <React.Fragment>
        <div onTouchStart={this.onTouchPress} onTouchMove={this.onTouchPressRelease} onTouchEnd={this.onTouchPressRelease} onTouchCancel={this.onTouchPressRelease} onMouseDown={this.onClickPress} onMouseMove={this.onClickPressRelease} onMouseUp={this.onClickPressRelease} onMouseLeave={this.onClickPressRelease} className={tailwind('relative pb-7/12')}>
          {this.renderImage()}
        </div>
        <div className={tailwind('flex items-center justify-between')}>
          <div className={tailwind('min-w-0 flex-shrink flex-grow')}>
            <div className={tailwind('flex items-center justify-start pl-4')}>
              {this.renderFavicon()}
              <div className={tailwind('min-w-0 flex-shrink flex-grow')}>
                <p className={tailwind('truncate pl-2 text-base text-gray-500 blk:text-gray-300')}>
                  <a className={tailwind('rounded-sm hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-200')} href={origin} target="_blank" rel="noreferrer">
                    {host}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className={tailwind('flex-shrink-0 flex-grow-0')}>
            <button onClick={this.onMenuBtnClick} style={{ paddingBottom: '0.375rem' }} className={tailwind('group block pt-2 pl-4 pr-2 focus:outline-none')}>
              <svg className={tailwind('w-6 rounded-full py-2 text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <a className={tailwind('group focus:outline-none')} href={ensureContainUrlProtocol(url)} target="_blank" rel="noreferrer">
          <h4 className={tailwind(`mt-0 mb-3 ml-4 mr-3 rounded-sm text-base font-medium leading-6 text-gray-800 group-hover:text-gray-900 group-focus:ring blk:text-gray-100 blk:group-hover:text-white lg:mb-4 ${classNames}`)}>
            {title}
          </h4>
        </a>
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
      safeAreaWidth: getSafeAreaWidth(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = { updatePopup, updateBulkEdit, addSelectedLinkIds };

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemContent));
