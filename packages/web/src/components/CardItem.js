import React from 'react';
import { connect } from 'react-redux';

import {
  updatePopup,
} from '../actions';

class CardItem extends React.Component {

  onMenuBtnClick = (e) => {
    const menuBtnPosition = e.currentTarget.getBoundingClientRect();
    this.props.updatePopup(this.props.link.id, true, menuBtnPosition);
  };

  render() {
    let { url, title } = this.props.link;
    if (!title) title = url;

    return (
      <div className="mx-auto max-w-sm bg-white border-1 border-gray-200 rounded-lg shadow">
        <div className="relative pb-7/12">
          <img className="absolute h-full w-full object-cover object-center" src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="imageAlt: Rear view of modern home with pool" />
        </div>
        <div className="flex justify-between">
          <div className="flex-shrink flex-grow">
            <div className="flex justify-start items-center pl-3 lg:pl-6 pt-3 lg:pt-6">
              <img className="flex-shrink-0 flex-grow-0" src="/favicon.ico" alt="Website favicon" />
              <p className="flex-shrink flex-grow ml-1 text-sm text-gray-600 truncate">
                <a href="#">facebook.com</a>
              </p>
            </div>
          </div>
          <div className="relative flex-shrink-0 flex-grow-0">
            <button onClick={this.onMenuBtnClick} className="pl-4 pr-2 pt-4 pb-2">
              <svg className="w-6 text-gray-600" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <h4 className="mt-1 p-3 lg:p-6 text-base text-gray-800 font-semibold leading-relaxed break-all">
          <a className="" href={url}>{title}</a>
        </h4>
      </div>
    );
  }
}

export default connect(null, { updatePopup })(CardItem);
