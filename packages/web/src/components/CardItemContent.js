import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';

import { updatePopup, updateBulkEdit } from '../actions';
import {
  updateSelectingLinkId, addSelectedLinkIds, updateQueryString,
} from '../actions/chunk';
import { CARD_ITEM_MENU_POPUP, COLOR, PATTERN, IMAGE } from '../types/const';
import {
  makeGetCustomImage, getSafeAreaWidth, getThemeMode, makeGetTnAndDns,
} from '../selectors';
import {
  removeTailingSlash, ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  extractUrl, isEqual, isObject, isString, isDecorValid, prependDomainName, adjustRect,
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
      this.props.link.doIgnoreExtrdRst !== nextProps.link.doIgnoreExtrdRst ||
      this.props.customImage !== nextProps.customImage ||
      this.props.tnAndDns !== nextProps.tnAndDns ||
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
    this.props.updateSelectingLinkId(this.props.link.id);

    const rect = e.currentTarget.getBoundingClientRect();
    const nRect = adjustRect(rect, 8, 12, -20, -12);
    this.props.updatePopup(CARD_ITEM_MENU_POPUP, true, nRect);
    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
  }

  onExtractedFaviconError = () => {
    this.setState({ extractedFaviconError: true });
  }

  renderImage() {
    const { url, decor, extractedResult, doIgnoreExtrdRst } = this.props.link;
    const { customImage, tailwind } = this.props;

    let image;

    if (customImage) image = customImage;
    if (image) {
      return <img key="img-image-custom" className={tailwind('absolute h-full w-full object-cover object-center ring-1 ring-black ring-opacity-5 blk:ring-0')} src={image} alt={`illustration of ${url}`} />;
    }

    if (extractedResult && extractedResult.image && !doIgnoreExtrdRst) {
      image = extractedResult.image;
    }
    if (image) {
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="image-graceful-image-extracted-result" className={tailwind('absolute h-full w-full object-cover object-center ring-1 ring-black ring-opacity-5 blk:ring-0')} src={image} alt={`illustration of ${url}`} />;
    }

    let fg = null;
    if (isDecorValid(decor) && isObject(decor.image.fg)) {
      const { text } = decor.image.fg;
      if (isString(text) && text.length > 0) {
        fg = (
          <React.Fragment>
            <div className={tailwind('absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white')} />
            <div className={tailwind('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-5xl font-medium uppercase leading-none text-gray-700')}>{text}</div>
          </React.Fragment>
        );
      }
    }

    // Only plain color background or plain color background with a letter
    if (isDecorValid(decor) && decor.image.bg.type === COLOR) {
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
    if (isDecorValid(decor) && decor.image.bg.type === PATTERN) {
      // Require both 'pattern' and [pattern_name] class names
      return (
        <React.Fragment>
          <div className={tailwind(`absolute h-full w-full pattern ${decor.image.bg.value}`)} />
          {fg}
        </React.Fragment>
      );
    }

    // Random image
    if (isDecorValid(decor) && decor.image.bg.type === IMAGE) {
      return <GracefulImage key="image-graceful-image-decor" className={tailwind('absolute h-full w-full object-cover object-center')} src={prependDomainName(decor.image.bg.value)} alt={`illustration of ${url}`} />;
    }

    console.log(`In CardItemContent.renderImage, invalid decor: ${JSON.stringify(decor)}`);
    return null;
  }

  renderFavicon() {
    const { tailwind } = this.props;

    const placeholder = (ref) => {
      if (isDecorValid(decor) && decor.favicon.bg.type === COLOR) {
        return <div ref={ref} className={tailwind(`h-4 w-4 flex-shrink-0 flex-grow-0 rounded-full ${decor.favicon.bg.value}`)} />;
      }

      if (isDecorValid(decor) && decor.favicon.bg.type === PATTERN) {
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

      return null;
    };

    const { url, decor, extractedResult, doIgnoreExtrdRst } = this.props.link;
    const { extractedFaviconError } = this.state;

    let favicon;
    if (extractedResult && extractedResult.favicon && !doIgnoreExtrdRst) {
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

  renderTags() {
    const { tnAndDns, tailwind } = this.props;

    if (tnAndDns.length === 0) return null;

    return (
      <div className={tailwind('-mt-3 mb-3 ml-3.5 mr-2.5 lg:-mt-4 lg:mb-4')}>
        <div className={tailwind('flex flex-wrap items-center justify-start pt-1')}>
          {tnAndDns.map((tnAndDn, i) => {
            return (
              <button key={tnAndDn.tagName} onClick={() => this.props.updateQueryString(tnAndDn.tagName)} className={tailwind(`group mt-2 block max-w-full rounded-full bg-gray-100 px-2 py-1 hover:bg-gray-200 focus:outline-none focus:ring blk:bg-gray-700 blk:hover:bg-gray-600 ${i === 0 ? '' : 'ml-2'}`)}>
                <div className={tailwind('truncate text-xs text-gray-500 group-hover:text-gray-700 blk:text-gray-300 blk:group-hover:text-gray-100')}>{tnAndDn.displayName}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const { tailwind } = this.props;
    const { url, extractedResult, custom, doIgnoreExtrdRst } = this.props.link;

    let title, classNames = '';
    if (custom && custom.title) {
      title = custom.title;
      classNames = 'hyphens-auto';
    } else if (extractedResult && extractedResult.title && !doIgnoreExtrdRst) {
      title = extractedResult.title;
      classNames = 'hyphens-auto';
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
        {this.renderTags()}
      </React.Fragment>
    );
  }
}

CardItemContent.propTypes = {
  link: PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {

  const getCustomImage = makeGetCustomImage();
  const getTnAndDns = makeGetTnAndDns();

  const mapStateToProps = (state, props) => {
    const customImage = getCustomImage(state, props.link);
    const tnAndDns = getTnAndDns(state, props.link);

    return {
      customImage,
      tnAndDns,
      themeMode: getThemeMode(state),
      safeAreaWidth: getSafeAreaWidth(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = {
  updatePopup, updateSelectingLinkId, updateBulkEdit, addSelectedLinkIds,
  updateQueryString,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemContent));
