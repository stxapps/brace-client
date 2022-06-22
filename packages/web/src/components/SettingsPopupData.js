import React, { useEffect } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';

import {
  importAllData, updateImportAllDataProgress, exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
} from '../actions';
import { HASH_SUPPORT, SM_WIDTH } from '../types/const';

import { useSafeAreaFrame } from '.';

class _SettingsPopupData extends React.PureComponent {

  render() {

    return (
      <div className="p-4 md:p-6">
        <div className="border-b border-gray-200 md:hidden">
          <button onClick={this.props.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none">
            <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none">Data</h3>
        </div>
        <div className="mt-6 md:mt-0">
          <h4 className="text-base text-gray-800 font-medium leading-none">Data Server</h4>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Brace.to stores your data in a Stacks data server. You can specify which Stacks data server to store your data. By default, your Stacks data server is at <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href="https://hub.blockstack.org/hub_info" target="_blank" rel="noreferrer">hub.blockstack.org</a> provided by <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href="https://www.hiro.so" target="_blank" rel="noreferrer">Hiro Systems</a>. You can also deploy your own Stacks data server. To change your Stacks data server, you need to record your server’s information to Stacks blockchain. Brace.to stores your data to the server specified in the blockchain. For more details, please visit <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href="https://docs.stacks.co/docs/gaia" target="_blank" rel="noreferrer">Stacks Gaia</a>.</p>
        </div>
        <div className="mt-8">
          <button onClick={this.props.onToImportAllDataViewBtnClick} className="w-full text-left rounded focus:outline-none focus:ring focus:ring-offset-1">
            <h4 className="text-base text-gray-800 font-medium leading-none underline hover:text-gray-900">Import Data</h4>
          </button>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Import data from a text file. The file can be a plain text file containing a list of links. Or it can be a file exported from some read-it-later apps, some bookmark managers, or our website.</p>
        </div>
        <div className="mt-8">
          <button onClick={this.props.onToExportAllDataViewBtnClick} className="w-full text-left rounded focus:outline-none focus:ring focus:ring-offset-1">
            <h4 className="text-base text-gray-800 font-medium leading-none underline hover:text-gray-900">Export All Data</h4>
          </button>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Export all your data from server to your device in a text file.</p>
        </div>
        <div className="mt-8 mb-4">
          <button onClick={this.props.onToDeleteAllDataViewBtnClick} className="w-full text-left rounded focus:outline-none focus:ring focus:ring-offset-1">
            <h4 className="text-base text-gray-800 font-medium leading-none underline hover:text-gray-900">Delete All Data</h4>
          </button>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        </div>
      </div>
    );
  }
}

export const SettingsPopupData = _SettingsPopupData;

const _SettingsPopupDataImport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const importAllDataProgress = useSelector(
    state => state.display.importAllDataProgress
  );
  const dispatch = useDispatch();

  const onImportAllDataBtnClick = () => {
    dispatch(importAllData());
  };

  useEffect(() => {
    return () => {
      if (importAllDataProgress) {
        const { total, done } = importAllDataProgress;
        if (total === done) dispatch(updateImportAllDataProgress(null));
      }
    };
  }, [importAllDataProgress, dispatch]);

  let actionPanel;
  if (!importAllDataProgress) {
    actionPanel = (
      <button onClick={onImportAllDataBtnClick} type="button" className="mt-7 mb-4 px-3.5 py-1.5 block bg-white text-sm text-gray-500 border border-gray-400 rounded-full hover:text-gray-600 hover:border-gray-500 focus:outline-none focus:ring">
        Choose a file
      </button>
    );
  } else if (importAllDataProgress.total === -1) {
    actionPanel = (
      <div className="mt-6 mb-4">
        <div className="flex items-center">
          <svg className="flex-grow-0 flex-shrink-0 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </svg>
          <p className="flex-grow flex-shrink ml-1 text-base text-red-600">Oops..., something went wrong!</p>
        </div>
        <p className="text-base text-red-600 leading-relaxed">{importAllDataProgress.error}</p>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">Please wait a moment and try again. If the problem persists, please <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
          <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </svg></a>.
        </p>
      </div>
    );
  } else if (importAllDataProgress.total === 0) {
    actionPanel = (
      <div className="mt-6 mb-4">
        <div className="flex items-center">
          <svg className="flex-grow-0 flex-shrink-0 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </svg>
          <p className="flex-grow flex-shrink ml-1 text-base text-gray-500">No data to import.</p>
        </div>
        <p className="text-base text-gray-500">{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  } else if (importAllDataProgress.total === importAllDataProgress.done) {
    actionPanel = (
      <div className="mt-6 mb-4">
        <div className="flex items-center">
          <svg className="flex-grow-0 flex-shrink-0 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </svg>
          <p className="flex-grow flex-shrink ml-1 text-base text-gray-500">Done</p>
        </div>
        <p className="text-base text-gray-500">{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  } else {
    actionPanel = (
      <div className="mt-6 mb-4">
        <div className="flex items-center">
          <div className="ball-clip-rotate">
            <div />
          </div>
          <p className="ml-1 text-base text-gray-500">Importing...</p>
        </div>
        <p className="text-base text-gray-500">{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 md:pt-4">
      <div className="border-b border-gray-200 md:border-b-0">
        <button onClick={onBackToDataViewBtnClick} className="pb-1 group focus:outline-none md:pb-0">
          <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
        </button>
        <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none md:pb-0">Import Data</h3>
      </div>
      <p className="mt-6 text-base text-gray-500 leading-relaxed">Import data from a text file.</p>
      <p className="mt-6 text-base text-gray-500 leading-relaxed">It may take several minutes to import data.</p>
      {actionPanel}
    </div>
  );
};

export const SettingsPopupDataImport = React.memo(_SettingsPopupDataImport);

class _SettingsPopupDataExport extends React.PureComponent {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  componentWillUnmount() {
    if (this.props.exportAllDataProgress) {
      const { total, done } = this.props.exportAllDataProgress;
      if (total === done) this.props.updateExportAllDataProgress(null);
    }
  }

  onExportAllDataBtnClick = () => {
    if (this.didClick) return;
    this.props.exportAllData();
    this.didClick = true;
  }

  render() {
    const { exportAllDataProgress, safeAreaWidth } = this.props;

    let actionPanel;
    if (!exportAllDataProgress) {
      actionPanel = (
        <button onClick={this.onExportAllDataBtnClick} className="mt-7 mb-4 px-3.5 py-1.5 block bg-white text-sm text-gray-500 border border-gray-400 rounded-full hover:text-gray-600 hover:border-gray-500 focus:outline-none focus:ring">
          Export All My Data
        </button>
      );
    } else if (exportAllDataProgress.total === -1) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="flex-grow-0 flex-shrink-0 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </svg>
            <p className="flex-grow flex-shrink ml-1 text-base text-red-600">Oops..., something went wrong!</p>
          </div>
          <p className="text-base text-red-600 leading-relaxed">{exportAllDataProgress.error}</p>
          <p className="mt-6 text-base text-gray-500 leading-relaxed">Please wait a moment and try again. If the problem persists, please <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
            <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
              <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
            </svg></a>.
          </p>
        </div>
      );
    } else if (exportAllDataProgress.total === 0) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="flex-grow-0 flex-shrink-0 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </svg>
            <p className="flex-grow flex-shrink ml-1 text-base text-gray-500">No data to export.</p>
          </div>
          <p className="text-base text-gray-500">{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="flex-grow-0 flex-shrink-0 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </svg>
            <p className="flex-grow flex-shrink ml-1 text-base text-gray-500">Done</p>
          </div>
          <p className="text-base text-gray-500">{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    } else {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <div className="ball-clip-rotate">
              <div />
            </div>
            <p className="ml-1 text-base text-gray-500">Exporting...</p>
          </div>
          <p className="text-base text-gray-500">{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-200 md:border-b-0">
          <button onClick={this.props.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none md:pb-0">
            <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
          </button>
          <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none md:pb-0">Export All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">Export all your data from server to your device in a text file.</p>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">It may take several minutes to export all your data.</p>
        {actionPanel}
      </div>
    );
  }
}

const mapStateToPropsExport = (state) => {
  return {
    exportAllDataProgress: state.display.exportAllDataProgress,
    safeAreaWidth: state.window.width,
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

    this.didClick = false;
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
    if (this.didClick) return;

    if (this.state.didCheckConfirm) {
      if (this.state.isRequireConfirmShown) {
        this.setState({ isRequireConfirmShown: false });
      }
      this.props.deleteAllData();
      this.didClick = true;
      return;
    }

    this.setState({ isRequireConfirmShown: true });
  }

  render() {

    const { deleteAllDataProgress, safeAreaWidth } = this.props;

    let actionPanel;
    if (!deleteAllDataProgress) {
      actionPanel = (
        <div className="mt-7 mb-4">
          <button onClick={this.onDeleteAllDataBtnClick} className="px-3.5 py-1.5 block bg-white text-sm text-gray-500 border border-gray-400 rounded-full hover:text-gray-600 hover:border-gray-500 focus:outline-none focus:ring">
            Delete All My Data
          </button>
          {this.state.isRequireConfirmShown && <p className="mt-2 text-base text-red-600">Please confirm by checking the box above first.</p>}
        </div>
      );
    } else if (deleteAllDataProgress.total === -1) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="flex-grow-0 flex-shrink-0 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </svg>
            <p className="flex-grow flex-shrink ml-1 text-base text-red-600">Oops..., something went wrong!</p>
          </div>
          <p className="text-base text-red-600 leading-relaxed">{deleteAllDataProgress.error}</p>
          <p className="mt-6 text-base text-gray-500 leading-relaxed">Please wait a moment and try again. If the problem persists, please <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
            <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
              <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
            </svg></a>.
          </p>
        </div>
      );
    } else if (deleteAllDataProgress.total === 0) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="flex-grow-0 flex-shrink-0 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </svg>
            <p className="flex-grow flex-shrink ml-1 text-base text-gray-500">No data to delete.</p>
          </div>
          <p className="text-base text-gray-500">{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <svg className="flex-grow-0 flex-shrink-0 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </svg>
            <p className="flex-grow flex-shrink ml-1 text-base text-gray-500">Done</p>
          </div>
          <p className="text-base text-gray-500">{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    } else {
      actionPanel = (
        <div className="mt-6 mb-4">
          <div className="flex items-center">
            <div className="ball-clip-rotate">
              <div />
            </div>
            <p className="ml-1 text-base text-gray-500">Deleting...</p>
          </div>
          <p className="text-base text-gray-500">{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-200 md:border-b-0">
          <button onClick={this.props.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none md:pb-0">
            <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
          </button>
          <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none md:pb-0">Delete All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">This will only remove all your data, not your account. You will still be able to sign in.</p>
        <p className="mt-6 text-base text-gray-500 leading-relaxed">It may take several minutes to delete all your data.</p>
        <p className="mt-6 text-base text-red-600 leading-relaxed">This action CANNOT be undone.</p>
        <div className="mt-6 flex items-center">
          <input onChange={this.onConfirmInputChange} checked={this.state.didCheckConfirm} className="w-4 h-4 text-blue-500 border-gray-400 rounded transition duration-150 ease-in-out focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 focus:border-gray-400" id="confirm-input" name="confirm-input" type="checkbox" />
          <label htmlFor="confirm-input" className="ml-2 block text-base text-gray-500">Yes, I’m absolutely sure I want to delete all my data.</label>
        </div>
        {actionPanel}
      </div>
    );
  }
}

const mapStateToPropsDelete = (state) => {
  return {
    deleteAllDataProgress: state.display.deleteAllDataProgress,
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToPropsDelete = {
  deleteAllData, updateDeleteAllDataProgress,
};

export const SettingsPopupDataDelete = connect(mapStateToPropsDelete, mapDispatchToPropsDelete)(_SettingsPopupDataDelete);
