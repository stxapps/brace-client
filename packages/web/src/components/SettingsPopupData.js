import React, { useEffect } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';

import {
  importAllData, updateImportAllDataProgress, exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
} from '../actions/data';
import { getSafeAreaWidth, getThemeMode } from '../selectors';
import { HASH_SUPPORT, SD_HUB_URL, SM_WIDTH } from '../types/const';

import { useSafeAreaFrame, withTailwind, useTailwind } from '.';

class _SettingsPopupData extends React.PureComponent {

  render() {
    const { hubUrl, tailwind } = this.props;

    let [hubName, hubNameUrl] = ['hub.hiro.so', 'https://hub.hiro.so/hub_info'];
    let [hubProvider, hubProviderUrl] = ['Hiro Systems', 'https://www.hiro.so'];
    if (hubUrl === SD_HUB_URL) {
      hubName = 'hub.stacksdrive.com';
      hubNameUrl = 'https://hub.stacksdrive.com/hub_info';
      hubProvider = 'STX Apps';
      hubProviderUrl = 'https://www.stxapps.com';
    }

    return (
      <div className={tailwind('p-4 md:p-6')}>
        <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
          <button onClick={this.props.onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
            <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring blk:text-gray-400')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
          </button>
          <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100')}>Data</h3>
        </div>
        <div className={tailwind('mt-6 md:mt-0')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Data Server</h4>
          <p className={tailwind('mt-3.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Brace.to stores your data in a Stacks data server. You can specify which Stacks data server to store your data in. By default, your Stacks data server is at <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href={hubNameUrl} target="_blank" rel="noreferrer">{hubName}</a>, provided by <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href={hubProviderUrl} target="_blank" rel="noreferrer">{hubProvider}</a>. You can also deploy your own Stacks data server. To change your Stacks data server, you must record your server's information on the Stacks blockchain. Brace.to stores your data on the server specified in the blockchain. For more details, please visit <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href="https://docs.stacks.co/stacks-in-depth/gaia" target="_blank" rel="noreferrer">Stacks Gaia</a>.</p>
        </div>
        <div className={tailwind('mt-8')}>
          <button onClick={this.props.onToImportAllDataViewBtnClick} className={tailwind('w-full rounded text-left focus:outline-none focus:ring focus:ring-offset-1 blk:ring-offset-gray-900')}>
            <h4 className={tailwind('text-base font-medium leading-none text-gray-800 underline hover:text-gray-900 blk:text-gray-100 blk:hover:text-white')}>Import Data</h4>
          </button>
          <p className={tailwind('mt-3 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Import data from a text file. The file can be a plain text file containing a list of links or a file exported from some read-it-later apps, bookmark managers, or our website.</p>
        </div>
        <div className={tailwind('mt-8')}>
          <button onClick={this.props.onToExportAllDataViewBtnClick} className={tailwind('w-full rounded text-left focus:outline-none focus:ring focus:ring-offset-1 blk:ring-offset-gray-900')}>
            <h4 className={tailwind('text-base font-medium leading-none text-gray-800 underline hover:text-gray-900 blk:text-gray-100 blk:hover:text-white')}>Export All Data</h4>
          </button>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a text file.</p>
        </div>
        <div className={tailwind('mt-8 mb-4')}>
          <button onClick={this.props.onToDeleteAllDataViewBtnClick} className={tailwind('w-full rounded text-left focus:outline-none focus:ring focus:ring-offset-1 blk:ring-offset-gray-900')}>
            <h4 className={tailwind('text-base font-medium leading-none text-gray-800 underline hover:text-gray-900 blk:text-gray-100 blk:hover:text-white')}>Delete All Data</h4>
          </button>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Delete all your data, including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    hubUrl: state.user.hubUrl,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

export const SettingsPopupData = connect(mapStateToProps)(withTailwind(_SettingsPopupData));

const _SettingsPopupDataImport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const importAllDataProgress = useSelector(
    state => state.display.importAllDataProgress
  );
  const dispatch = useDispatch();
  const tailwind = useTailwind();

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
      <button onClick={onImportAllDataBtnClick} type="button" className={tailwind('mt-7 mb-4 block rounded-full border border-gray-400 bg-white px-3.5 py-1.5 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200')}>
        Choose a file
      </button>
    );
  } else if (importAllDataProgress.total === -1) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-red-600 blk:text-red-500')}>Oops..., something went wrong!</p>
        </div>
        <p className={tailwind('text-base leading-relaxed text-red-600 blk:text-red-500')}>{importAllDataProgress.error}</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
      </div>
    );
  } else if (importAllDataProgress.total === 0) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>No data to import.</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  } else if (importAllDataProgress.total === importAllDataProgress.done) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-green-500 blk:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>Done</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  } else {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
            <div />
          </div>
          <p className={tailwind('ml-1 text-base text-gray-500 blk:text-gray-400')}>Importing...</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  }

  return (
    <div className={tailwind('p-4 md:p-6 md:pt-4')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <button onClick={onBackToDataViewBtnClick} className={tailwind('group pb-1 focus:outline-none md:pb-0')}>
          <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring blk:text-gray-400')}>{'<'} <span className={tailwind('group-hover:underline')}>{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100 md:pb-0')}>Import Data</h3>
      </div>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Import data from a text file.</p>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>It may take several minutes to import data.</p>
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
    const { exportAllDataProgress, safeAreaWidth, tailwind } = this.props;

    let actionPanel;
    if (!exportAllDataProgress) {
      actionPanel = (
        <button onClick={this.onExportAllDataBtnClick} className={tailwind('mt-7 mb-4 block rounded-full border border-gray-400 bg-white px-3.5 py-1.5 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200')}>
          Export All My Data
        </button>
      );
    } else if (exportAllDataProgress.total === -1) {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-red-600 blk:text-red-500')}>Oops..., something went wrong!</p>
          </div>
          <p className={tailwind('text-base leading-relaxed text-red-600 blk:text-red-500')}>{exportAllDataProgress.error}</p>
          <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
        </div>
      );
    } else if (exportAllDataProgress.total === 0) {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>No data to export.</p>
          </div>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-green-500 blk:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>Done</p>
          </div>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    } else {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
              <div />
            </div>
            <p className={tailwind('ml-1 text-base text-gray-500 blk:text-gray-400')}>Exporting...</p>
          </div>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
        </div>
      );
    }

    return (
      <div className={tailwind('p-4 md:p-6 md:pt-4')}>
        <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
          <button onClick={this.props.onBackToDataViewBtnClick} className={tailwind('group pb-1 focus:outline-none md:pb-0')}>
            <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring blk:text-gray-400')}>{'<'} <span className={tailwind('group-hover:underline')}>{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
          </button>
          <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100 md:pb-0')}>Export All Data</h3>
        </div>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a text file.</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>It may take several minutes to export all your data.</p>
        {actionPanel}
      </div>
    );
  }
}

const mapStateToPropsExport = (state) => {
  return {
    exportAllDataProgress: state.display.exportAllDataProgress,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToPropsExport = {
  exportAllData, updateExportAllDataProgress,
};

export const SettingsPopupDataExport = connect(mapStateToPropsExport, mapDispatchToPropsExport)(withTailwind(_SettingsPopupDataExport));

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
    const { deleteAllDataProgress, safeAreaWidth, tailwind } = this.props;

    let actionPanel;
    if (!deleteAllDataProgress) {
      actionPanel = (
        <div className={tailwind('mt-7 mb-4')}>
          <button onClick={this.onDeleteAllDataBtnClick} className={tailwind('block rounded-full border border-gray-400 bg-white px-3.5 py-1.5 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200')}>
            Delete All My Data
          </button>
          {this.state.isRequireConfirmShown && <p className={tailwind('mt-2 text-base text-red-600 blk:text-red-500')}>Please confirm by checking the box above first.</p>}
        </div>
      );
    } else if (deleteAllDataProgress.total === -1) {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-red-600 blk:text-red-500')}>Oops..., something went wrong!</p>
          </div>
          <p className={tailwind('text-base leading-relaxed text-red-600 blk:text-red-500')}>{deleteAllDataProgress.error}</p>
          <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
        </div>
      );
    } else if (deleteAllDataProgress.total === 0) {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>No data to delete.</p>
          </div>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-green-500 blk:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>Done</p>
          </div>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    } else {
      actionPanel = (
        <div className={tailwind('mt-6 mb-4')}>
          <div className={tailwind('flex items-center')}>
            <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
              <div />
            </div>
            <p className={tailwind('ml-1 text-base text-gray-500 blk:text-gray-400')}>Deleting...</p>
          </div>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
        </div>
      );
    }

    return (
      <div className={tailwind('p-4 md:p-6 md:pt-4')}>
        <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
          <button onClick={this.props.onBackToDataViewBtnClick} className={tailwind('group pb-1 focus:outline-none md:pb-0')}>
            <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring blk:text-gray-400')}>{'<'} <span className={tailwind('group-hover:underline')}>{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
          </button>
          <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100 md:pb-0')}>Delete All Data</h3>
        </div>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>This will only remove all your data, not your account. You will still be able to sign in.</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>It may take several minutes to delete all your data.</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-red-600 blk:text-red-500')}>This action CANNOT be undone.</p>
        <div className={tailwind('mt-6 flex items-center')}>
          <input onChange={this.onConfirmInputChange} checked={this.state.didCheckConfirm} className={tailwind('h-4 w-4 cursor-pointer rounded border-gray-400 text-blue-500 transition duration-150 ease-in-out focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-400 blk:bg-gray-900 blk:focus:ring-offset-gray-900')} id="confirm-input" name="confirm-input" type="checkbox" />
          <label htmlFor="confirm-input" className={tailwind('ml-2 block cursor-pointer text-base text-gray-500 blk:text-gray-400')}>Yes, I'm absolutely sure I want to delete all my data.</label>
        </div>
        {actionPanel}
      </div>
    );
  }
}

const mapStateToPropsDelete = (state) => {
  return {
    deleteAllDataProgress: state.display.deleteAllDataProgress,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToPropsDelete = {
  deleteAllData, updateDeleteAllDataProgress,
};

export const SettingsPopupDataDelete = connect(mapStateToPropsDelete, mapDispatchToPropsDelete)(withTailwind(_SettingsPopupDataDelete));
