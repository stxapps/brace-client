import React from 'react';
import { connect } from 'react-redux';

import {
  updatePopup, retryDiedLinks, cancelDiedLinks,
} from '../actions';
import { ensureContainUrlProtocol, isDiedStatus, extractUrl } from '../utils';
import {
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

  renderRetry() {
    let { url } = this.props.link;
    url = ensureContainUrlProtocol(url);

    return (
      <div className="absolute inset-0 text-white bg-black opacity-50">
        <h3 className="font-xl font-semibold">Opps... Something went wrong!</h3>
        <button onClick={this.onRetryRetryBtnClick} className="my-4 w-full">Retry</button>
        <button onClick={this.onRetryCancelBtnClick} className="my-4 w-full">Cancel</button>
        <a className="block mt-10 w-full text-center" href={url}>link</a>
      </div>
    );
  }

  renderImage() {

    const { url, image, decor } = this.props.link;
    if (image) {
      return <img className="absolute h-full w-full object-cover object-center" src={image} alt={`illustration of ${url}`} />;
    }

    let fg = null;
    if (decor.image.fg) {
      const { text } = decor.image.fg;
      fg = (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-20 h-20 bg-white rounded-full`}>
          <span className="text-5xl font-semibold text-gray-700">{text}</span>
        </div>
      );
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      return (
        <React.Fragment>
          <div className={`absolute h-full w-full bg-${decor.image.bg.value}`}></div>
          {fg}
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      return (
        <React.Fragment>
          <div className={`absolute w-full h-full pattern ${decor.image.bg.value}`}></div>
          {fg}
        </React.Fragment>
      );
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return <img className="absolute h-full w-full object-cover object-center" src={decor.image.bg.value} alt={`illustration of ${url}`} />;
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  }

  renderFavicon() {

    const { url, favicon, decor } = this.props.link;
    if (favicon) {
      return <img className="flex-shrink-0 flex-grow-0" src={favicon} alt={`Favicon of ${url}`} />;
    }

    if (decor.favicon.bg.type === COLOR) {
      return <div className={`flex-shrink-0 flex-grow-0 w-4 h-4 bg-${decor.favicon.bg.value} rounded-full`}></div>;
    }

    if (decor.favicon.bg.type === PATTERN) {
      return <div className={`flex-shrink-0 flex-grow-0 w-4 h-4 ${decor.favicon.bg.value} rounded-full`}></div>;
    }
  }

  render() {
    let { url, title, status } = this.props.link;
    if (!title) title = url;
    const { host, origin } = extractUrl(url);

    return (
      <div className="relative mx-auto max-w-sm bg-white border-1 border-gray-200 rounded-lg shadow">
        <div className="relative pb-7/12">
          {this.renderImage()}
        </div>
        <div className="flex justify-between">
          <div className="flex-shrink flex-grow">
            <div className="flex justify-start items-center pl-3 lg:pl-6 pt-3 lg:pt-6">
              {this.renderFavicon()}
              <p className="flex-shrink flex-grow ml-1 text-sm text-gray-600 truncate">
                <a href={origin}>{host}</a>
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex-grow-0">
            <button onClick={this.onMenuBtnClick} className="pl-4 pr-2 pt-4 pb-2">
              <svg className="w-6 text-gray-600" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <h4 className="mt-1 p-3 lg:p-6 text-base text-gray-800 font-semibold leading-relaxed break-all">
          <a className="" href={ensureContainUrlProtocol(url)}>{title}</a>
        </h4>
        {isDiedStatus(status) && this.renderRetry()}
      </div>
    );
  }
}

export default connect(null, { updatePopup, retryDiedLinks, cancelDiedLinks })(CardItem);
