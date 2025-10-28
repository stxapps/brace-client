import React from 'react';
import { connect } from 'react-redux';

import { updatePopup, updateBulkEdit } from '../actions';
import { updateAddPopup } from '../actions/chunk';
import { SEARCH_POPUP, PROFILE_POPUP } from '../types/const';
import { getSafeAreaWidth, getThemeMode } from '../selectors';

import { withTailwind } from '.';

class BottomBarCommands extends React.PureComponent<any, any> {

  onAddBtnClick = () => {
    this.props.updateAddPopup(true);
  };

  onSearchBtnClick = () => {
    this.props.updatePopup(SEARCH_POPUP, true);
  };

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  };

  onProfileBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, true);
  };

  render() {
    const { tailwind } = this.props;

    return (
      <React.Fragment>
        <div className={tailwind('flex h-full w-full justify-evenly')}>
          <div className={tailwind('h-full w-full p-1')}>
            <button onClick={this.onAddBtnClick} className={tailwind('group flex h-full w-full flex-col items-center justify-center rounded focus:outline-none focus:ring')}>
              <div className={tailwind('flex h-6 w-6 items-center justify-center')}>
                <svg style={{ width: '1.125rem' }} className={tailwind('mb-0.5 text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 13 12" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 1V10.4286M1 5.67609H12" strokeWidth="1.57143" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={tailwind('mt-0.5 text-xs leading-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>Add</div>
            </button>
          </div>
          <div className={tailwind('h-full w-full p-1')}>
            <button onClick={this.onSearchBtnClick} className={tailwind('group flex h-full w-full flex-col items-center justify-center rounded focus:outline-none focus:ring')}>
              <div className={tailwind('flex h-6 w-6 items-center justify-center')}>
                <svg style={{ width: '1.375rem' }} className={tailwind('text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                </svg>
              </div>
              <div className={tailwind('mt-0.5 text-xs leading-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>Search</div>
            </button>
          </div>
          <div className={tailwind('h-full w-full p-1')}>
            <button onClick={this.onBulkEditBtnClick} className={tailwind('group flex h-full w-full flex-col items-center justify-center rounded focus:outline-none focus:ring')}>
              <div className={tailwind('flex h-6 w-6 items-center justify-center')}>
                <svg className={tailwind('h-5 w-5 text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
                </svg>
              </div>
              <div className={tailwind('mt-0.5 text-xs leading-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>Select</div>
            </button>
          </div>
          <div className={tailwind('h-full w-full p-1')}>
            <button onClick={this.onProfileBtnClick} className={tailwind('group flex h-full w-full flex-col items-center justify-center rounded focus:outline-none focus:ring')}>
              <div className={tailwind('flex h-6 w-6 items-center justify-center')}>
                <svg className={tailwind('mt-1 h-6 w-6 text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 10C6 10.5304 5.78929 11.0391 5.41421 11.4142C5.03914 11.7893 4.53043 12 4 12C3.46957 12 2.96086 11.7893 2.58579 11.4142C2.21071 11.0391 2 10.5304 2 10C2 9.46957 2.21071 8.96086 2.58579 8.58579C2.96086 8.21071 3.46957 8 4 8C4.53043 8 5.03914 8.21071 5.41421 8.58579C5.78929 8.96086 6 9.46957 6 10ZM12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10ZM16 12C16.5304 12 17.0391 11.7893 17.4142 11.4142C17.7893 11.0391 18 10.5304 18 10C18 9.46957 17.7893 8.96086 17.4142 8.58579C17.0391 8.21071 16.5304 8 16 8C15.4696 8 14.9609 8.21071 14.5858 8.58579C14.2107 8.96086 14 9.46957 14 10C14 10.5304 14.2107 11.0391 14.5858 11.4142C14.9609 11.7893 15.4696 12 16 12Z" />
                </svg>
              </div>
              <div className={tailwind('mt-0.5 text-xs leading-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-400 blk:group-hover:text-gray-300')}>More</div>
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToProps = { updatePopup, updateAddPopup, updateBulkEdit };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarCommands));
