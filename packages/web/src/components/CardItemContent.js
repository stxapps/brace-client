import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';

import { updatePopup, updateBulkEdit, addSelectedLinkIds } from '../actions';
import { COLOR, PATTERN, IMAGE } from '../types/const';
import {
  removeTailingSlash, ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  extractUrl, isEqual,
} from '../utils';

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
      !isEqual(this.props.link.extractedResult, nextProps.link.extractedResult) ||
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

    let image;
    if (extractedResult && extractedResult.image) image = extractedResult.image;

    if (image) {
      // This GracefulImage needs to be different from the one below so that it's not just rerender but recreate a new component with a new src and new retry. React knows by using different keys.
      return <GracefulImage key="image-graceful-image-extracted-result" className="absolute h-full w-full object-cover object-center ring-1 ring-black ring-opacity-5" src={image} alt={`illustration of ${url}`} />;
    }

    let fg = null;
    if (decor.image.fg) {
      const { text } = decor.image.fg;
      fg = (
        <React.Fragment>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 text-5xl text-gray-700 font-medium leading-none uppercase transform -translate-x-1/2 -translate-y-1/2">{text}</div>
        </React.Fragment>
      );
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      return (
        <React.Fragment>
          <div className={`absolute h-full w-full ${decor.image.bg.value}`} />
          {fg}
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      // Require both 'pattern' and [pattern_name] class names
      return (
        <React.Fragment>
          <div className={`absolute w-full h-full pattern ${decor.image.bg.value}`} />
          {fg}
        </React.Fragment>
      );
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return <GracefulImage key="image-graceful-image-decor" className="absolute h-full w-full object-cover object-center" src={decor.image.bg.value} alt={`illustration of ${url}`} />;
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  }

  renderFavicon() {

    const placeholder = (ref) => {
      if (decor.favicon.bg.type === COLOR) {
        return <div ref={ref} className={`flex-shrink-0 flex-grow-0 w-4 h-4 ${decor.favicon.bg.value} rounded-full`} />;
      }

      if (decor.favicon.bg.type === PATTERN) {
        // Require both 'pattern' and [pattern_name] class names
        // Require under relative class
        return (
          <div ref={ref} className="flex-shrink-0 flex-grow-0">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full pattern ${decor.favicon.bg.value}`} />
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
      return <GracefulImage key="favicon-graceful-image-extracted-result" className="flex-shrink-0 flex-grow-0 w-4 h-4 overflow-hidden" src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} onError={this.onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = removeTailingSlash(origin) + '/favicon.ico';
    favicon = ensureContainUrlSecureProtocol(favicon);

    return <GracefulImage key="favicon-graceful-image-ico" className="flex-shrink-0 flex-grow-0 w-4 h-4 overflow-hidden" src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} />;
  }

  render() {

    const { url, extractedResult } = this.props.link;

    let title, classNames = '';
    if (extractedResult && extractedResult.title) {
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
        <div onTouchStart={this.onTouchPress} onTouchMove={this.onTouchPressRelease} onTouchEnd={this.onTouchPressRelease} onTouchCancel={this.onTouchPressRelease} onMouseDown={this.onClickPress} onMouseMove={this.onClickPressRelease} onMouseUp={this.onClickPressRelease} onMouseLeave={this.onClickPressRelease} className="relative pb-7/12">
          {this.renderImage()}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex-shrink flex-grow min-w-0">
            <div className="pl-4 flex justify-start items-center">
              {this.renderFavicon()}
              <div className="flex-shrink flex-grow min-w-0">
                <p className="pl-2 text-base text-gray-500 truncate hover:text-gray-600">
                  <a className="rounded-sm focus:outline-none focus:ring" href={origin} target="_blank" rel="noreferrer">
                    {host}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex-grow-0">
            <button onClick={this.onMenuBtnClick} className="pt-2 pb-0 pl-4 pr-2 group focus:outline-none">
              <svg className="py-2 w-6 text-gray-400 rounded-full group-hover:text-gray-500 group-focus:ring" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <a className="group focus:outline-none" href={ensureContainUrlProtocol(url)} target="_blank" rel="noreferrer">
          <h4 className={`mt-0 mb-3 ml-4 mr-3 text-base text-gray-800 font-medium leading-6 rounded-sm ${classNames} group-hover:text-gray-900 group-focus:ring lg:mb-4`}>
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

const mapDispatchToProps = { updatePopup, updateBulkEdit, addSelectedLinkIds };

export default connect(null, mapDispatchToProps)(CardItemContent);
