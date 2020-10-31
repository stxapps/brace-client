import React from 'react';
import { connect } from 'react-redux';

import {
  exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
} from '../actions';
import {
  SM_WIDTH,
} from '../types/const';

class _SettingsPopupData extends React.PureComponent {

  render() {

    return (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-400 md:hidden">
          <button onClick={this.props.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none">Data</h3>
        </div>
        <div className="mt-6 md:mt-0">
          <h4 className="text-xl text-gray-800 font-medium leading-none">Data Server</h4>
          <p className="mt-2 text-base text-gray-700 leading-relaxed">With your Blockstack identity, you can have your own data server called Gaia to store all your data from apps you use with your Blockstack identity. You just need to specify your server’s information in Blockstack blockchain. Brace.to stores all your data in the server specified in the blockchain. For more details, please visit <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="https://docs.blockstack.org/data-storage/overview">Blockstack Gaia</a> and <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="https://docs.blockstack.org/storage-hubs/overview">Blockstack Gaia hubs</a>.</p>
        </div>
        <div className="mt-8">
          <button onClick={this.props.onToExportAllDataViewBtnClick} className="focus:outline-none focus:shadow-outline">
            <h4 className="text-xl text-gray-800 font-medium leading-none underline hover:text-black">Export All Data</h4>
          </button>
          <p className="mt-2 text-base text-gray-700 leading-relaxed">Export all your data from server to your device in a text file.</p>
        </div>
        <div className="mt-8 mb-4">
          <button onClick={this.props.onToDeleteAllDataViewBtnClick} className="focus:outline-none focus:shadow-outline">
            <h4 className="text-xl text-gray-800 font-medium leading-none underline hover:text-black">Delete All Data</h4>
          </button>
          <p className="mt-2 text-base text-gray-700 leading-relaxed">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        </div>
      </div>
    );
  }
}

export const SettingsPopupData = _SettingsPopupData;

class _SettingsPopupDataExport extends React.PureComponent {

  componentWillUnmount() {
    if (this.props.exportAllDataProgress) {
      const { total, done } = this.props.exportAllDataProgress;
      if (total === done) this.props.updateExportAllDataProgress(null);
    }
  }

  onExportAllDataBtnClick = () => {
    this.props.exportAllData();
  }

  render() {
    const { exportAllDataProgress } = this.props;

    let actionPanel;
    if (!exportAllDataProgress) {
      actionPanel = (
        <button onClick={this.onExportAllDataBtnClick} className="mt-6 mb-4 block focus:outline-none-outer">
          <span className="px-4 py-2 block bg-white text-base text-gray-700 border border-gray-700 rounded-full shadow hover:bg-gray-800 hover:text-white active:bg-gray-800 focus:shadow-outline-inner">Export All My Data</span>
        </button>
      );
    } else if (exportAllDataProgress.total === -1) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </svg>

            <p className="ml-1 font-base text-red-700">Oops..., something went wrong!</p>
          </div>
          <p className="font-base text-red-700 leading-relaxed">{exportAllDataProgress.error}</p>
          <p className="mt-6 font-base text-gray-700 leading-relaxed">
            Please wait a moment and try again. If the problem persists, please&nbsp;
            <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="/#support">
              contact us
              <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
              </svg>
            </a>.
          </p>
        </div>
      );
    } else if (exportAllDataProgress.total === 0) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </svg>
            <p className="ml-1 font-base text-gray-800">No data to export.</p>
          </div>
          <p className="font-base text-gray-800">{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </svg>
            <p className="ml-1 font-base text-gray-800">Done</p>
          </div>
          <p className="font-base text-gray-800">{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    } else {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <div className="ball-clip-rotate">
              <div></div>
            </div>
            <p className="ml-1 font-base text-gray-800">Exporting...</p>
          </div>
          <p className="font-base text-gray-800">{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-400 md:border-b-0">
          <button onClick={this.props.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline md:pb-0">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">{window.innerWidth < SM_WIDTH ? 'Settings /' : ''} Data</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none md:pb-0">Export All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">Export all your data from server to your device in a text file.</p>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">It may take several minutes to export all your data.</p>
        {actionPanel}
      </div>
    );
  }
}

const mapStateToPropsExport = (state) => {
  return {
    exportAllDataProgress: state.display.exportAllDataProgress,
  };
};

const mapDispatchToPropsExport = {
  exportAllData, updateExportAllDataProgress,
};

export const SettingsPopupDataExport = connect(mapStateToPropsExport, mapDispatchToPropsExport)(_SettingsPopupDataExport);

class _SettingsPopupDataDelete extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      didCheckConfirm: false,
      isRequireConfirmShown: false,
    };
  }

  componentWillUnmount() {
    if (this.props.deleteAllDataProgress) {
      const { total, done } = this.props.deleteAllDataProgress;
      if (total === done) this.props.updateDeleteAllDataProgress(null);
    }
  }

  onConfirmInputChange = (e) => {
    this.setState({ didCheckConfirm: e.target.checked, isRequireConfirmShown: false });
  }

  onDeleteAllDataBtnClick = () => {
    if (this.state.didCheckConfirm) {
      if (this.state.isRequireConfirmShown) {
        this.setState({ isRequireConfirmShown: false });
      }
      this.props.deleteAllData();
      return;
    }

    this.setState({ isRequireConfirmShown: true });
  }

  render() {

    const { deleteAllDataProgress } = this.props;

    let actionPanel;
    if (!deleteAllDataProgress) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <button onClick={this.onDeleteAllDataBtnClick} className="block focus:outline-none-outer">
            <span className="px-4 py-2 block bg-red-600 text-base text-white rounded-full shadow hover:bg-red-700 hover:text-white active:bg-red-800 focus:shadow-outline-inner">Delete All My Data</span>
          </button>
          {this.state.isRequireConfirmShown && <p className="mt-2 text-base text-red-700">Please confirm by checking the box above first.</p>}
        </div>
      );
    } else if (deleteAllDataProgress.total === -1) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </svg>

            <p className="ml-1 font-base text-red-700">Oops..., something went wrong!</p>
          </div>
          <p className="font-base text-red-700 leading-relaxed">{deleteAllDataProgress.error}</p>
          <p className="mt-6 font-base text-gray-700 leading-relaxed">
            Please wait a moment and try again. If the problem persists, please&nbsp;
            <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="/#support">
              contact us
              <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
              </svg>
            </a>.
          </p>
        </div>
      );
    } else if (deleteAllDataProgress.total === 0) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </svg>
            <p className="ml-1 font-base text-gray-800">No data to delete.</p>
          </div>
          <p className="font-base text-gray-800">{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </svg>
            <p className="ml-1 font-base text-gray-800">Done</p>
          </div>
          <p className="font-base text-gray-800">{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    } else {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <div className="ball-clip-rotate">
              <div></div>
            </div>
            <p className="ml-1 font-base text-gray-800">Deleting...</p>
          </div>
          <p className="font-base text-gray-800">{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-400 md:border-b-0">
          <button onClick={this.props.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline md:pb-0">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">{window.innerWidth < SM_WIDTH ? 'Settings /' : ''} Data</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none md:pb-0">Delete All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">This will only remove all your data, not your account. You will still be able to sign in.</p>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">It may take several minutes to delete all your data.</p>
        <p className="mt-6 text-base text-red-700 leading-relaxed">This action CANNOT be undone.</p>
        <div className="mt-6 flex items-center">
          <input onChange={this.onConfirmInputChange} checked={this.state.didCheckConfirm} className="form-checkbox text-blue-600 transition duration-150 ease-in-out focus:outline-none focus:shadow-outline" id="confirm-input" type="checkbox" />
          <label htmlFor="confirm-input" className="ml-2 block text-base text-gray-700">Yes, I’m absolutely sure I want to delete all my data.</label>
        </div>
        {actionPanel}
      </div>
    );
  }
}

const mapStateToPropsDelete = (state) => {
  return {
    deleteAllDataProgress: state.display.deleteAllDataProgress,
  };
};

const mapDispatchToPropsDelete = {
  deleteAllData, updateDeleteAllDataProgress,
};

export const SettingsPopupDataDelete = connect(mapStateToPropsDelete, mapDispatchToPropsDelete)(_SettingsPopupDataDelete);
