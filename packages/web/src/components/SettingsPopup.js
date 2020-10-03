import React from 'react';
import { connect } from 'react-redux';

import {
  updatePopup,
} from '../actions';
import {
  SM_WIDTH, SETTINGS_POPUP,
} from '../types/const';

const VIEW_ACCOUNT = 1;
const VIEW_DATA = 2;
const VIEW_DATA_EXPORT = 3;
const VIEW_DATA_DELETE = 4;

class SettingsPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      viewId: VIEW_ACCOUNT,
      isShown: false,
      isSidebarShown: window.innerWidth < SM_WIDTH,
      didSidebarTransitionStart: true,
      didSidebarTransitionEnd: true,
      didCheckConfirm: false,
    };

    this.pendingViewId = null;
  }

  componentDidMount() {
    this.setState({ isShown: true });
  }

  componentDidUpdate() {

    const { didSidebarTransitionStart } = this.state;
    if (!didSidebarTransitionStart) {
      this.setState({ didSidebarTransitionStart: true });
    }
  }

  isViewSelected = (viewId) => {

    const dataViews = [VIEW_DATA, VIEW_DATA_EXPORT, VIEW_DATA_DELETE];
    if (viewId === VIEW_DATA) {
      return dataViews.includes(this.state.viewId);
    }

    return viewId === this.state.viewId;
  }

  onPopupCloseBtnClick = () => {
    this.setState({ isShown: false });
  };

  onPopupTransitionEnd = () => {
    if (!this.state.isShown) this.props.updatePopup(SETTINGS_POPUP, false);
  };

  onSidebarOpenBtnClick = () => {
    this.setState({
      isSidebarShown: true,
      didSidebarTransitionStart: false,
      didSidebarTransitionEnd: false,
    });
  }

  onSidebarCloseBtnClick = () => {
    this.setState({
      isSidebarShown: false,
      didSidebarTransitionStart: false,
      didSidebarTransitionEnd: false,
    });
  }

  onSidebarTransitionEnd = () => {
    this.setState({ didSidebarTransitionEnd: true });

    if (!this.state.isSidebarShown &&
      this.pendingViewId &&
      this.pendingViewId !== this.state.viewId
    ) {
      this.setState({ viewId: this.pendingViewId });
      this.pendingViewId = null;
    }
  }

  onAccountBtnClick = () => {

    if (window.innerWidth < SM_WIDTH) {
      this.setState({
        isSidebarShown: false,
        didSidebarTransitionStart: false,
        didSidebarTransitionEnd: false,
      });
      this.pendingViewId = VIEW_ACCOUNT;
    } else {
      this.setState({
        viewId: VIEW_ACCOUNT,
        isSidebarShown: false,
        didSidebarTransitionStart: true,
        didSidebarTransitionEnd: true,
      });
    }
  }

  onDataBtnClick = () => {

    if (window.innerWidth < SM_WIDTH) {
      this.setState({
        isSidebarShown: false,
        didSidebarTransitionStart: false,
        didSidebarTransitionEnd: false,
      });
      this.pendingViewId = VIEW_DATA;
    } else {
      this.setState({
        viewId: VIEW_DATA,
        isSidebarShown: false,
        didSidebarTransitionStart: true,
        didSidebarTransitionEnd: true,
      });
    }
  }

  onToExportDataViewBtnClick = () => {
    this.setState({ viewId: VIEW_DATA_EXPORT });
  }

  onToDeleteDataViewBtnClick = () => {
    this.setState({ viewId: VIEW_DATA_DELETE });
  }

  onBackToDataViewBtnClick = () => {
    this.setState({
      viewId: VIEW_DATA,
      isSidebarShown: false,
      didSidebarTransitionStart: true,
      didSidebarTransitionEnd: true,
    });
  }

  onExportDataBtnClick = () => {

  }

  onConfirmInputChange = (e) => {
    this.setState({ didCheckConfirm: e.target.checked });
  }

  onDeleteDataBtnClick = () => {

  }

  _render(content) {

    const { viewId, isSidebarShown } = this.state;
    const { didSidebarTransitionStart, didSidebarTransitionEnd } = this.state;

    let sidebarCanvasStyleClasses, sidebarOverlayStyleClasses, sidebarStyleClasses;
    if (!isSidebarShown) {
      if (!didSidebarTransitionStart) {
        sidebarCanvasStyleClasses = '';
        sidebarOverlayStyleClasses = 'opacity-100 transition-opacity ease-linear duration-300';
        sidebarStyleClasses = 'transition translate-x-0 ease-in-out duration-300 transform';
      } else {
        sidebarCanvasStyleClasses = didSidebarTransitionEnd ? 'invisible' : '';
        sidebarOverlayStyleClasses = 'opacity-0 transition-opacity ease-linear duration-300';
        sidebarStyleClasses = 'transition -translate-x-full ease-in-out duration-300 transform';
      }
    } else {
      if (!didSidebarTransitionStart) {
        sidebarCanvasStyleClasses = '';
        sidebarOverlayStyleClasses = 'opacity-0 transition-opacity ease-linear duration-300';
        sidebarStyleClasses = 'transition -translate-x-full ease-in-out duration-300 transform';
      } else {
        sidebarCanvasStyleClasses = '';
        sidebarOverlayStyleClasses = 'opacity-100 transition-opacity ease-linear duration-300';
        sidebarStyleClasses = 'transition translate-x-0 ease-in-out duration-300 transform';
      }
    }

    const selectedMenuTextStyleClasses = 'bg-gray-200 text-gray-800 focus:bg-gray-300 focus:text-gray-900';
    const menuTextStyleClasses = 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:bg-gray-100 focus:text-gray-800';

    const selectedMenuSvgStyleClasses = 'text-gray-600 group-focus:text-gray-700';
    const menuSvgStyleClasses = 'text-gray-500 group-hover:text-gray-600 group-focus:text-gray-600';

    const panelWithSidebar = (
      <div key="panel-with-sidebar" className="flex flex-col h-screen-8/10 overflow-x-hidden overflow-y-auto md:p-6 lg:p-8">
        <div className="hidden border-b border-gray-400 md:block">
          <h2 className="pb-3 text-3xl text-gray-800 font-semibold leading-none">Settings</h2>
        </div>
        <div className="flex-1 flex">
          {/* Off-canvas sidebar for mobile */}
          <div key="sidebar-for-mobile" className={`md:hidden ${sidebarCanvasStyleClasses}`}>
            <div className="fixed inset-0 flex z-10">
              <button onClick={this.onSidebarCloseBtnClick} className={`fixed inset-0 w-full h-full ${sidebarOverlayStyleClasses}`}>
                <div className="absolute inset-0 bg-gray-300"></div>
              </button>
              <div onTransitionEnd={this.onSidebarTransitionEnd} className={`relative flex-1 flex flex-col max-w-48 w-full bg-white ${sidebarStyleClasses}`}>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <h2 className="text-3xl text-gray-800 font-semibold leading-none">Settings</h2>
                  </div>
                  <nav className="mt-8 px-2 space-y-1">
                    <button onClick={this.onAccountBtnClick} className={`group flex items-center px-2 py-2 w-full text-base leading-6 rounded-md focus:outline-none transition ease-in-out duration-150 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-4 h-6 w-6 transition ease-in-out duration-150 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                      </svg>
                      Account
                    </button>
                    <button onClick={this.onDataBtnClick} className={`group flex items-center px-2 py-2 w-full text-base leading-6 rounded-md focus:outline-none transition ease-in-out duration-150 ${this.isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-4 h-6 w-6 transition ease-in-out duration-150 ${this.isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                      </svg>
                      Data
                    </button>
                  </nav>
                </div>
              </div>
              <div className="flex-shrink-0 w-14">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </div>
          {/* Static sidebar for desktop */}
          <div key="sidebar-for-desktop" className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-48">
              <div className="mt-2 flex flex-col h-0 flex-1 border-r border-gray-400 bg-white">
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <nav className="mt-2 pr-2 flex-1 bg-white space-y-1">
                    <button onClick={this.onAccountBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm leading-5 rounded-md focus:outline-none transition ease-in-out duration-150 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-3 h-6 w-6 transition ease-in-out duration-150 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                      </svg>
                      Account
                    </button>
                    <button onClick={this.onDataBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm leading-5 rounded-md focus:outline-none transition ease-in-out duration-150 ${this.isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-3 h-6 w-6 transition ease-in-out duration-150 ${this.isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                      </svg>
                      Data
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          <div key="panel-content" className="flex flex-col w-0 flex-1 overflow-hidden">
            <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              {content}
            </div>
          </div>
        </div>
      </div>
    );

    const { isShown } = this.state;

    const backgroundStyleClasses = isShown ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200';
    const popupStyleClasses = isShown ? 'opacity-100 translate-y-0 ease-out duration-300 sm:scale-100' : 'opacity-0 translate-y-4 ease-in duration-200 sm:translate-y-0 sm:scale-95';
    return (
      <div className="fixed inset-0 overflow-hidden z-30">
        <div className="p-4 flex items-center justify-center min-h-screen">
          <div className={`fixed inset-0 transition-opacity ${backgroundStyleClasses}`}>
            <button onClick={this.onPopupCloseBtnClick} tabIndex={-1} className="absolute inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none"></button>
          </div>
          <div onTransitionEnd={this.onPopupTransitionEnd} className={`w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-xl transform transition-all ${popupStyleClasses}`} role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            {panelWithSidebar}
          </div>
        </div>
      </div>
    );
  }

  renderAccountView() {

    const content = (
      <div className="p-4 md:p-6 md:pt-4 md:pr-0">
        <div className="border-b border-gray-400 md:hidden">
          <button onClick={this.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline" >
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none">Account</h3>
        </div>
        <p className="mt-4 text-base text-gray-700 md:mt-0">You sign in to Brace.to using your Blockstack Identity. This is similar to some websites that allow you to use your Google, Facebook, or Twitter account to sign in to their websites. Not similarly, your Blockstack Identity lives in blockchain and only you with your secret key can control it. If you want to change your Blockstack Identity’s information i.e. your profile picture, please visit <a className="underline hover:text-gray-800 focus:outline-none focus:shadow-outline" href="https://browser.blockstack.org/profiles">Blockstack Browser</a>.</p>
        <div className="mt-8 md:clearfix">
          <div className="md:float-right md:w-3/12">
            <svg className="mx-auto w-full max-w-24 md:ml-auto md:mr-0" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="48" cy="48" r="48" fill="#E2E8F0" />
              <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="11" y="20" width="76" height="76">
                <g clip-path="url(#clip0)">
                  <path d="M87 86.4778V96H11V86.5127C15.4205 80.6051 21.1584 75.8104 27.7573 72.5098C34.3563 69.2093 41.6343 67.4938 49.0127 67.5C64.542 67.5 78.336 74.9543 87 86.4778V86.4778ZM61.673 48.4968C61.673 51.8562 60.3385 55.0781 57.963 57.4535C55.5876 59.829 52.3657 61.1635 49.0063 61.1635C45.6469 61.1635 42.4251 59.829 40.0496 57.4535C37.6742 55.0781 36.3397 51.8562 36.3397 48.4968C36.3397 45.1374 37.6742 41.9156 40.0496 39.5401C42.4251 37.1647 45.6469 35.8302 49.0063 35.8302C52.3657 35.8302 55.5876 37.1647 57.963 39.5401C60.3385 41.9156 61.673 45.1374 61.673 48.4968V48.4968Z" fill="#A0AEC0" />
                </g>
              </mask>
              <g mask="url(#mask0)">
                <circle cx="48" cy="48" r="48" fill="#A0AEC0" />
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="76" height="76" fill="white" transform="translate(11 20)" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <table className="mt-2 table-auto lg:table-fixed">
            <tbody>
              <tr className="py-2">
                <td className="align-baseline lg:w-4/12">
                  <p className="text-sm text-gray-700 text-right">ID:</p>
                </td>
                <td className="pl-2 align-baseline lg:w-8/12">
                  <p className="text-base text-gray-700">{this.props.username || 'N/A'}</p>
                </td>
              </tr>
              <tr className="py-2">
                <td className="align-baseline">
                  <p className="text-sm text-gray-700 text-right">Password:</p>
                </td>
                <td className="pl-2 align-baseline">
                  <p className="text-base text-gray-700">Unlike traditional systems, your password cannnot be reset. Your password is a 12-word secret key. It's only known to you. If you lose it, there is no way to retrieve it back. Keep it safe before you sign out. You can view it only when you sign in.</p>
                  <p className="pt-2 text-base text-blue-600 underline hover:text-blue-700"><a className="focus:outline-none focus:shadow-outline" href="https://app.blockstack.org/#/settings/secret-key">View your 12-word secret key</a></p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 rounded-md bg-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-500 md:h-10 md:w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-base text-yellow-800">Signing out from Brace.to doesn’t sign out from Blockstack. If you want to sign out from Blockstack, especially when you use not-your-own devices, you need to go to <a className="underline hover:text-yellow-900 focus:outline-none focus:shadow-outline" href="https://app.blockstack.org/">Blockstack App</a> and/or <a className="underline hover:text-yellow-900 focus:outline-none focus:shadow-outline" href="https://browser.blockstack.org/account/delete">Blockstack Browser</a> and sign out there.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-4">
          <h4 className="text-xl text-red-700 font-medium leading-none">Delete Account</h4>
          <p className="mt-2 text-base text-gray-700">Brace.to uses Blockstack Identity to sign you in. If you want to delete your Blockstack Identity, please send an email to support@blockstack.com. For more information, please visit <a className="underline hover:text-gray-800 focus:outline-none focus:shadow-outline" href="https://forum.blockstack.org/t/is-blockstack-gdrp-compliant/10931/4">here</a>.</p>
        </div>
      </div>
    );

    return this._render(content);
  }

  renderDataView() {

    const content = (
      <div className="p-4 md:p-6 md:pt-4 md:pr-0">
        <div className="border-b border-gray-400 md:hidden">
          <button onClick={this.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none">Data</h3>
        </div>
        <div className="mt-6 md:mt-0">
          <h4 className="text-xl text-gray-800 font-medium leading-none">Data Server</h4>
          <p className="mt-2 text-base text-gray-700">With your Blockstack identity, you can have your own data server called Gaia to store all your data from apps you use with your Blockstack identity. You just need to specify your server’s information in Blockstack blockchain. Brace.to stores all your data in the server specified in the blockchain. For more details, please visit <a className="underline hover:text-gray-800 focus:outline-none focus:shadow-outline" href="https://docs.blockstack.org/data-storage/overview">Blockstack Gaia</a> and <a className="underline hover:text-gray-800 focus:outline-none focus:shadow-outline" href="https://docs.blockstack.org/storage-hubs/overview">Blockstack Gaia hubs</a>.</p>
        </div>
        <div className="mt-8">
          <button onClick={this.onToExportDataViewBtnClick} className="focus:outline-none focus:shadow-outline">
            <h4 className="text-xl text-gray-800 font-medium leading-none underline hover:text-black">Export All Data</h4>
          </button>
          <p className="mt-2 text-base text-gray-700">Export all your data from server to your device in a text file.</p>
        </div>
        <div className="mt-8 mb-4">
          <button onClick={this.onToDeleteDataViewBtnClick} className="focus:outline-none focus:shadow-outline">
            <h4 className="text-xl text-gray-800 font-medium leading-none underline hover:text-black">Delete All Data</h4>
          </button>
          <p className="mt-2 text-base text-gray-700">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        </div>
      </div>
    );

    return this._render(content);
  }

  renderExportDataView() {

    const content = (
      <div className="p-4 md:p-6 md:pt-4 md:pr-0">
        <div className="border-b border-gray-400 md:border-b-0">
          <button onClick={this.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline md:pb-0">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">{window.innerWidth < SM_WIDTH ? 'Settings /' : ''} Data</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none md:pb-0">Export All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-700">Export all your data from server to your device in a text file.</p>
        <p className="mt-6 text-base text-gray-700">It may take several minutes to export all your data.</p>
        <button onClick={this.onExportDataBtnClick} className="mt-6 mb-4 block focus:outline-none-outer">
          <span className="px-4 py-2 block bg-white text-base text-gray-700 border border-gray-700 rounded-full shadow-lg hover:bg-gray-800 hover:text-white active:bg-gray-800 focus:shadow-outline-inner">Export All My Data</span>
        </button>
      </div>
    );

    return this._render(content);
  }

  renderDeleteDataView() {

    const content = (
      <div className="p-4 md:p-6 md:pt-4 md:pr-0">
        <div className="border-b border-gray-400 md:border-b-0">
          <button onClick={this.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline md:pb-0">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">{window.innerWidth < SM_WIDTH ? 'Settings /' : ''} Data</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none md:pb-0">Delete All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-700">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        <p className="mt-6 text-base text-gray-700">This will only remove all your data, not your account. You will still be able to sign in.</p>
        <p className="mt-6 text-base text-gray-700">It may take several minutes to delete all your data.</p>
        <p className="mt-6 text-base text-red-700">This action CANNOT be undone.</p>
        <div className="mt-6 flex items-center">
          <input onChange={this.onConfirmInputChange} value={this.state.didCheckConfirm} className="form-checkbox text-indigo-600 transition duration-150 ease-in-out focus:outline-none focus:shadow-outline" id="confirm-input" type="checkbox" />
          <label htmlFor="confirm-input" className="ml-2 block text-base text-gray-700">Yes, I’m absolutely sure I want to delete all my data.</label>
        </div>
        <button onClick={this.onDeleteDataBtnClick} className="mt-6 mb-4 block focus:outline-none-outer">
          <span className="px-4 py-2 block bg-red-600 text-base text-white rounded-full shadow-lg hover:bg-red-700 hover:text-white active:bg-red-800 focus:shadow-outline-inner">Delete All My Data</span>
        </button>
      </div>
    );

    return this._render(content);
  }

  render() {

    const { viewId } = this.state;

    if (viewId === VIEW_ACCOUNT) return this.renderAccountView();
    else if (viewId === VIEW_DATA) return this.renderDataView();
    else if (viewId === VIEW_DATA_EXPORT) return this.renderExportDataView();
    else if (viewId === VIEW_DATA_DELETE) return this.renderDeleteDataView();
    else throw new Error(`Invalid viewId: ${viewId}`);
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.user.username,
    image: state.user.image,
  };
};

const mapDispatchToProps = {
  updatePopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPopup);
