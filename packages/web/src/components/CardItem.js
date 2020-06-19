import React from 'react';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';

import {
  updatePopup, retryDiedLinks, cancelDiedLinks,
} from '../actions';
import {
  ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  isDiedStatus, extractUrl,
} from '../utils';
import {
  ADDING, MOVING,
  COLOR, PATTERN, IMAGE,
} from '../types/const';

class CardItem extends React.Component {

  onMenuBtnClick = (e) => {
    const menuBtnPosition = e.currentTarget.getBoundingClientRect();
    this.props.updatePopup(this.props.link.id, true, menuBtnPosition);
  }

  onRetryRetryBtnClick = () => {
    this.props.retryDiedLinks([this.props.link.id]);
  }

  onRetryCancelBtnClick = () => {
    this.props.cancelDiedLinks([this.props.link.id]);
  }

  renderBusy() {

    const svgStyle = { top: '66px', left: '34px' };

    return (
      <div className="absolute top-0 right-0 w-16 h-16 bg-tranpalent overflow-hidden">
        <div className="relative w-16 h-16 bg-white overflow-hidden transform rotate-45 translate-x-1/2 -translate-y-1/2">
          <svg style={svgStyle} className="relative w-6 h-6 text-gray-900 transform -rotate-45 -translate-x-1/2 -translate-y-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  }

  renderRetry() {
    let { url } = this.props.link;

    return (
      <React.Fragment>
        <div className="absolute inset-0 bg-black opacity-75"></div>
        <div className="px-4 absolute inset-0 flex flex-col justify-center items-center bg-transparent">
          <h3 className="text-2xl text-white font-medium text-center">Oops..., something went wrong!</h3>
          <div className="pt-4 flex justify-center items-center">
            <button onClick={this.onRetryRetryBtnClick} className="px-4 py-1 bg-white text-base text-gray-900 font-semibold rounded-full border border-white hover:bg-gray-900 hover:text-white active:bg-black focus:outline-none focus:shadow-outline">Retry</button>
            <button onClick={this.onRetryCancelBtnClick} className="ml-4 px-3 py-1 text-base text-white font-semibold rounded-full border border-white hover:bg-gray-100 hover:text-gray-900 active:bg-white focus:outline-none focus:shadow-outline">Cancel</button>
          </div>
          <a className="block mt-10 w-full text-base text-white font-medium text-center hover:underline focus:outline-none focus:shadow-outline" href={ensureContainUrlProtocol(url)}>Go to the link</a>
        </div>
      </React.Fragment>
    );
  }

  renderImage() {

    const { url, decor, extractedResult } = this.props.link;

    let image;
    if (extractedResult && extractedResult.image) image = extractedResult.image;

    if (image) {
      return <GracefulImage className="absolute h-full w-full object-cover object-center" src={image} alt={`illustration of ${url}`} />;
    }

    let fg = null;
    if (decor.image.fg) {
      const { text } = decor.image.fg;
      fg = (
        <React.Fragment>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 text-5xl text-gray-700 font-semibold leading-none uppercase transform -translate-x-1/2 -translate-y-1/2">{text}</div>
        </React.Fragment>
      );
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      return (
        <React.Fragment>
          <div className={`absolute h-full w-full ${decor.image.bg.value}`}></div>
          {fg}
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      // Require both 'pattern' and [pattern_name] class names
      return (
        <React.Fragment>
          <div className={`absolute w-full h-full pattern ${decor.image.bg.value}`}></div>
          {fg}
        </React.Fragment>
      );
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return <GracefulImage className="absolute h-full w-full object-cover object-center" src={decor.image.bg.value} alt={`illustration of ${url}`} />;
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  }

  renderFavicon() {

    const { url, decor } = this.props.link;
    const { origin } = extractUrl(url);

    const favicon = ensureContainUrlSecureProtocol(origin) + '/favicon.ico';
    const placeholder = (ref) => {
      if (decor.favicon.bg.type === COLOR) {
        return <div ref={ref} className={`flex-shrink-0 flex-grow-0 w-4 h-4 ${decor.favicon.bg.value} rounded-full`}></div>;
      }

      if (decor.favicon.bg.type === PATTERN) {
        // Require both 'pattern' and [pattern_name] class names
        // Require under relative class
        return (
          <div ref={ref} className="flex-shrink-0 flex-grow-0">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full pattern ${decor.favicon.bg.value}`}></div>
            </div>
          </div>
        );
      }
    };

    return <GracefulImage className="flex-shrink-0 flex-grow-0 w-4 h-4" src={favicon} alt={`Favicon of ${url}`} customPlaceholder={placeholder} retry={{ count: 2, delay: 3, accumulate: 'multiply' }} />;
  }

  render() {
    const { url, status, extractedResult } = this.props.link;

    let title;
    if (extractedResult && extractedResult.title) title = extractedResult.title;
    if (!title) title = url;

    const { host, origin } = extractUrl(url);

    return (
      <div className="mx-auto relative max-w-sm bg-white border-1 border-gray-200 rounded-lg overflow-hidden shadow md:max-w-none">
        <div className="relative pb-7/12">
          {this.renderImage()}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex-shrink flex-grow">
            <div className="pl-4 flex justify-start items-center lg:pl-5">
              {this.renderFavicon()}
              <p className="pl-2 flex-shrink flex-grow text-base text-gray-700 truncate">
                <a className="focus:outline-none focus:shadow-outline" href={origin}>{host}</a>
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex-grow-0">
            <button onClick={this.onMenuBtnClick} className="pt-2 pb-0 pl-4 pr-2 focus:outline-none-outer">
              <svg className="py-2 w-6 text-gray-700 rounded-full focus:shadow-outline-inner" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <h4 className="px-4 pt-0 pb-3 text-base text-gray-800 font-semibold leading-relaxed break-all lg:px-5 lg:pt-3 lg:pb-5">
          <a className="focus:outline-none focus:shadow-outline" href={ensureContainUrlProtocol(url)}>{title}</a>
        </h4>
        {isDiedStatus(status) && this.renderRetry()}
        {[ADDING, MOVING].includes(status) && this.renderBusy()}
      </div>
    );
  }
}

export default connect(null, { updatePopup, retryDiedLinks, cancelDiedLinks })(CardItem);
