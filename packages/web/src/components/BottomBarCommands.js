import React from 'react';
import { connect } from 'react-redux';
import GracefulImage from 'react-graceful-image';
import { toSvg } from 'jdenticon';

import { updatePopup, updateBulkEdit } from '../actions';
import { ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP } from '../types/const';

class BottomBarCommands extends React.PureComponent {

  constructor(props) {
    super(props);

    this.userImage = props.userImage;
    this.profileBtnStyleClasses = 'rounded-full';
    if (this.userImage === null) {
      const svgString = toSvg(props.username, 32);
      this.userImage = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      this.profileBtnStyleClasses = 'rounded-lg';
    }
  }

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
  }

  onSearchBtnClick = () => {
    this.props.updatePopup(SEARCH_POPUP, true);
  }

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  }

  onProfileBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  render() {
    return (
      <React.Fragment>
        <div className="flex justify-evenly w-full h-full">
          <div className="p-1 w-full h-full">
            <button onClick={this.onAddBtnClick} className="flex flex-col justify-center items-center w-full h-full rounded group focus:outline-none focus:ring">
              <div className="flex justify-center items-center w-6 h-6">
                <svg style={{ width: '1.125rem' }} className="mb-0.5 text-gray-500 group-hover:text-gray-600" viewBox="0 0 13 12" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 1V10.4286M1 5.67609H12" strokeWidth="1.57143" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mt-0.5 text-xs text-gray-500 leading-4 group-hover:text-gray-600">Add</div>
            </button>
          </div>
          <div className="p-1 w-full h-full">
            <button onClick={this.onSearchBtnClick} className="flex flex-col justify-center items-center w-full h-full rounded group focus:outline-none focus:ring">
              <div className="flex justify-center items-center w-6 h-6">
                <svg style={{ width: '1.375rem' }} className="text-gray-500 group-hover:text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                </svg>
              </div>
              <div className="mt-0.5 text-xs text-gray-500 leading-4 group-hover:text-gray-600">Search</div>
            </button>
          </div>
          <div className="p-1 w-full h-full">
            <button onClick={this.onBulkEditBtnClick} className="flex flex-col justify-center items-center w-full h-full rounded group focus:outline-none focus:ring">
              <div className="flex justify-center items-center w-6 h-6">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
                </svg>
              </div>
              <div className="mt-0.5 text-xs text-gray-500 leading-4 group-hover:text-gray-600">Select</div>
            </button>
          </div>
          <button onClick={this.onProfileBtnClick} className="flex items-center w-full h-full group focus:outline-none">
            <div className={`mx-auto flex items-center h-10 w-10 overflow-hidden border-2 border-gray-300 group-hover:border-gray-400 group-focus:ring ${this.profileBtnStyleClasses}`}>
              <GracefulImage className="h-full w-full bg-white object-cover" src={this.userImage} alt="Profile" />
            </div>
          </button>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
  };
};

const mapDispatchToProps = { updatePopup, updateBulkEdit };

export default connect(mapStateToProps, mapDispatchToProps)(BottomBarCommands);
