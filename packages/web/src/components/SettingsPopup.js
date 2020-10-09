import React from 'react';
import { connect } from 'react-redux';

import {
  updatePopup,
  exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
} from '../actions';
import {
  SM_WIDTH, MD_WIDTH, SETTINGS_POPUP,
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
      isSidebarShown: window.innerWidth < MD_WIDTH,
      didSidebarTransitionStart: true,
      didSidebarTransitionEnd: true,
      didCheckConfirm: false,
      isRequireConfirmShown: false,
    };

    this.panelContent = React.createRef();

    this.pendingViewId = null;
  }

  componentDidMount() {
    this.setState({ isShown: true });
  }

  componentDidUpdate(_, prevState) {

    const { didSidebarTransitionStart } = this.state;
    if (!didSidebarTransitionStart) {
      this.setState({ didSidebarTransitionStart: true });
    }

    if (prevState.viewId !== this.state.viewId) {
      this.panelContent.current.scroll(0, 0);
    }
  }

  componentWillUnmount() {
    if (this.props.exportAllDataProgress) {
      const { total, done } = this.props.exportAllDataProgress;
      if (total === done) this.props.updateExportAllDataProgress(null);
    }

    if (this.props.deleteAllDataProgress) {
      const { total, done } = this.props.deleteAllDataProgress;
      if (total === done) this.props.updateDeleteAllDataProgress(null);
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

  onToExportAllDataViewBtnClick = () => {
    this.setState({ viewId: VIEW_DATA_EXPORT });
  }

  onToDeleteAllDataViewBtnClick = () => {
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

  onExportAllDataBtnClick = () => {
    this.props.exportAllData();
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

  _render(content) {

    const { isSidebarShown } = this.state;
    const { didSidebarTransitionStart, didSidebarTransitionEnd } = this.state;

    const panelHeight = window.innerWidth < MD_WIDTH ? window.innerHeight * 0.9 : window.innerHeight * 0.8;

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
      <div key="panel-with-sidebar" className="relative flex flex-col overflow-hidden" style={{ height: panelHeight }}>
        <div className="hidden absolute top-0 right-0 p-1 md:block">
          <button onClick={this.onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 rounded-full group focus:outline-none focus:shadow-outline" aria-label="Close settings popup">
            <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-700" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="hidden border-b border-gray-400 md:block md:mt-6 md:ml-6 md:mr-6 lg:mt-8 lg:ml-8 lg:mr-8">
          <h2 className="pb-3 text-3xl text-gray-800 font-semibold leading-none">Settings</h2>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Off-canvas sidebar for mobile */}
          <div key="sidebar-for-mobile" className={`md:hidden ${sidebarCanvasStyleClasses}`}>
            <div className="fixed inset-0 flex z-10">
              <button onClick={this.onSidebarCloseBtnClick} className={`fixed inset-0 w-full h-full ${sidebarOverlayStyleClasses}`}>
                <div className="absolute inset-0 bg-gray-300"></div>
              </button>
              <div className="absolute top-0 right-0 p-1">
                <button onClick={this.onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 rounded-full group focus:outline-none focus:shadow-outline" aria-label="Close settings popup">
                  <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-700" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div onTransitionEnd={this.onSidebarTransitionEnd} className={`relative flex-1 flex flex-col max-w-48 w-full bg-white ${sidebarStyleClasses}`}>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <h2 className="text-3xl text-gray-800 font-semibold leading-none">Settings</h2>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    <button onClick={this.onAccountBtnClick} className={`group flex items-center px-2 py-2 w-full text-base leading-6 rounded-md focus:outline-none transition ease-in-out duration-150 ${menuTextStyleClasses}`}>
                      <svg className={`mr-2 h-6 w-6 transition ease-in-out duration-150 ${menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                      </svg>
                      Account
                    </button>
                    <button onClick={this.onDataBtnClick} className={`group flex items-center px-2 py-2 w-full text-base leading-6 rounded-md focus:outline-none transition ease-in-out duration-150 ${menuTextStyleClasses}`}>
                      <svg className={`mr-2 h-6 w-6 transition ease-in-out duration-150 ${menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
          <div key="sidebar-for-desktop" className="hidden md:flex md:flex-shrink-0 md:flex-grow-0">
            <div className="flex flex-col w-48">
              <div className="mt-2 flex flex-col h-0 flex-1 border-r border-gray-400 bg-white md:ml-6 md:mb-6 lg:ml-8 lg:mb-8">
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
          <div key="panel-content" className="flex flex-col flex-shrink flex-grow overflow-hidden">
            <div ref={this.panelContent} className="flex-1 relative overflow-y-auto focus:outline-none">
              <div className="absolute top-0 right-0 p-1 md:hidden">
                <button onClick={this.onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 rounded-full group focus:outline-none focus:shadow-outline" aria-label="Close settings popup">
                  <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-700" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
        <div className="p-4 flex items-center justify-center" style={{ minHeight: window.innerHeight }}>
          <div className={`fixed inset-0 transition-opacity ${backgroundStyleClasses}`}>
            <button onClick={this.onPopupCloseBtnClick} tabIndex={-1} className="absolute inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none"></button>
          </div>
          <div onTransitionEnd={this.onPopupTransitionEnd} className={`w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-xl transform transition-all ${popupStyleClasses}`} role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            {panelWithSidebar}
          </div>
        </div>
      </div >
    );
  }

  renderAccountView() {

    let userImage;
    if (this.props.userImage) {
      userImage = (
        <img className="mx-auto w-24 h-24 border-2 border-gray-200 rounded-full overflow-hidden md:ml-auto md:mr-0" src={this.props.userImage} alt="User" />
      );
    } else {
      userImage = (
        <svg className="mx-auto w-24 h-24 md:ml-auto md:mr-0" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="48" cy="48" r="48" fill="#E2E8F0" />
          <path d="M82.5302 81.3416C73.8015 90.3795 61.5571 96 47.9999 96C34.9627 96 23.1394 90.8024 14.4893 82.3663C18.2913 78.3397 22.7793 74.9996 27.7572 72.5098C34.3562 69.2093 41.6342 67.4938 49.0126 67.5C62.0922 67.5 73.9409 72.7881 82.5302 81.3416Z" fill="#A0AEC0" />
          <path d="M57.9629 57.4535C60.3384 55.0781 61.6729 51.8562 61.6729 48.4968C61.6729 45.1374 60.3384 41.9156 57.9629 39.5401C55.5875 37.1647 52.3656 35.8302 49.0062 35.8302C45.6468 35.8302 42.425 37.1647 40.0495 39.5401C37.6741 41.9156 36.3396 45.1374 36.3396 48.4968C36.3396 51.8562 37.6741 55.0781 40.0495 57.4535C42.425 59.829 45.6468 61.1635 49.0062 61.1635C52.3656 61.1635 55.5875 59.829 57.9629 57.4535Z" fill="#A0AEC0" />
        </svg>
      );
    }

    const content = (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-400 md:hidden">
          <button onClick={this.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline" >
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none">Account</h3>
        </div>
        <p className="mt-4 text-base text-gray-700 leading-relaxed md:mt-0">You sign in to Brace.to using your Blockstack Identity. This is similar to some websites that allow you to use your Google, Facebook, or Twitter account to sign in to their websites. Not similarly, your Blockstack Identity lives in blockchain and only you with your secret key can control it. If you want to change your Blockstack Identity’s information i.e. your profile picture, please visit <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="https://browser.blockstack.org/profiles">Blockstack Browser</a>.</p>
        <div className="mt-8 md:clearfix">
          <div className="md:float-right md:w-3/12">
            {userImage}
          </div>
          <table className="mt-4 table-auto lg:table-fixed">
            <tbody>
              <tr className="py-4">
                <td className="align-middle lg:w-4/12">
                  <p className="text-sm text-gray-700 text-right">ID:</p>
                </td>
                <td className="pl-2 align-baseline lg:w-8/12">
                  <p className="text-base text-gray-700 leading-relaxed break-all">{this.props.username || 'N/A'}</p>
                </td>
              </tr>
              <tr className="py-4">
                <td className="align-baseline">
                  <p className="text-sm text-gray-700 text-right">Password:</p>
                </td>
                <td className="pl-2 align-baseline">
                  <p className="text-base text-gray-700 leading-relaxed">Unlike traditional systems, your password cannnot be reset. Your password is a 12-word secret key. It's only known to you. If you lose it, there is no way to retrieve it back. Keep it safe before you sign out. You can view it only when you sign in.</p>
                  <p className="pt-2 text-base text-blue-600 leading-relaxed underline hover:text-blue-800"><a className="focus:outline-none focus:shadow-outline" href="https://app.blockstack.org/#/settings/secret-key">View your 12-word secret key</a></p>
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
              <p className="text-base text-yellow-800 leading-relaxed">Signing out from Brace.to doesn’t sign out from Blockstack. If you want to sign out from Blockstack, especially when you use not-your-own devices, you need to go to <a className="underline hover:text-yellow-900 focus:outline-none focus:shadow-outline" href="https://app.blockstack.org/">Blockstack App</a> and/or <a className="underline hover:text-yellow-900 focus:outline-none focus:shadow-outline" href="https://browser.blockstack.org/account/delete">Blockstack Browser</a> and sign out there.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-4">
          <h4 className="text-xl text-red-700 font-medium leading-none">Delete Account</h4>
          <p className="mt-2 text-base text-gray-700 leading-relaxed">Brace.to uses Blockstack Identity to sign you in. If you want to delete your Blockstack Identity, please send an email to support@blockstack.com. For more information, please visit <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="https://forum.blockstack.org/t/is-blockstack-gdrp-compliant/10931/4">here</a>.</p>
        </div>
      </div>
    );

    return this._render(content);
  }

  renderDataView() {

    const content = (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-400 md:hidden">
          <button onClick={this.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none">Data</h3>
        </div>
        <div className="mt-6 md:mt-0">
          <h4 className="text-xl text-gray-800 font-medium leading-none">Data Server</h4>
          <p className="mt-2 text-base text-gray-700 leading-relaxed">With your Blockstack identity, you can have your own data server called Gaia to store all your data from apps you use with your Blockstack identity. You just need to specify your server’s information in Blockstack blockchain. Brace.to stores all your data in the server specified in the blockchain. For more details, please visit <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="https://docs.blockstack.org/data-storage/overview">Blockstack Gaia</a> and <a className="underline hover:text-gray-900 focus:outline-none focus:shadow-outline" href="https://docs.blockstack.org/storage-hubs/overview">Blockstack Gaia hubs</a>.</p>
        </div>
        <div className="mt-8">
          <button onClick={this.onToExportAllDataViewBtnClick} className="focus:outline-none focus:shadow-outline">
            <h4 className="text-xl text-gray-800 font-medium leading-none underline hover:text-black">Export All Data</h4>
          </button>
          <p className="mt-2 text-base text-gray-700 leading-relaxed">Export all your data from server to your device in a text file.</p>
        </div>
        <div className="mt-8 mb-4">
          <button onClick={this.onToDeleteAllDataViewBtnClick} className="focus:outline-none focus:shadow-outline">
            <h4 className="text-xl text-gray-800 font-medium leading-none underline hover:text-black">Delete All Data</h4>
          </button>
          <p className="mt-2 text-base text-gray-700 leading-relaxed">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        </div>
      </div>
    );

    return this._render(content);
  }

  renderExportAllDataView() {

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

    const content = (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-400 md:border-b-0">
          <button onClick={this.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline md:pb-0">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">{window.innerWidth < SM_WIDTH ? 'Settings /' : ''} Data</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none md:pb-0">Export All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">Export all your data from server to your device in a text file.</p>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">It may take several minutes to export all your data.</p>
        {actionPanel}
      </div>
    );

    return this._render(content);
  }

  renderDeleteAllDataView() {

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

    const content = (
      <div className="p-4 md:p-6 md:pt-4">
        <div className="border-b border-gray-400 md:border-b-0">
          <button onClick={this.onBackToDataViewBtnClick} className="pb-1 group focus:outline-none focus:shadow-outline md:pb-0">
            <span className="text-sm text-gray-700">{'<'} <span className="group-hover:underline">{window.innerWidth < SM_WIDTH ? 'Settings /' : ''} Data</span></span>
          </button>
          <h3 className="pb-2 text-2xl text-gray-800 font-medium leading-none md:pb-0">Delete All Data</h3>
        </div>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">Delete all your data including but not limited to all your saved links in all lists, all your created lists, and all your settings.</p>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">This will only remove all your data, not your account. You will still be able to sign in.</p>
        <p className="mt-6 text-base text-gray-700 leading-relaxed">It may take several minutes to delete all your data.</p>
        <p className="mt-6 text-base text-red-700 leading-relaxed">This action CANNOT be undone.</p>
        <div className="mt-6 flex items-center">
          <input onChange={this.onConfirmInputChange} value={this.state.didCheckConfirm} className="form-checkbox text-blue-600 transition duration-150 ease-in-out focus:outline-none focus:shadow-outline" id="confirm-input" type="checkbox" />
          <label htmlFor="confirm-input" className="ml-2 block text-base text-gray-700">Yes, I’m absolutely sure I want to delete all my data.</label>
        </div>
        {actionPanel}
      </div>
    );

    return this._render(content);
  }

  render() {

    const { viewId } = this.state;

    if (viewId === VIEW_ACCOUNT) return this.renderAccountView();
    else if (viewId === VIEW_DATA) return this.renderDataView();
    else if (viewId === VIEW_DATA_EXPORT) return this.renderExportAllDataView();
    else if (viewId === VIEW_DATA_DELETE) return this.renderDeleteAllDataView();
    else throw new Error(`Invalid viewId: ${viewId}`);
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
    exportAllDataProgress: state.display.exportAllDataProgress,
    deleteAllDataProgress: state.display.deleteAllDataProgress,
  };
};

const mapDispatchToProps = {
  updatePopup,
  exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPopup);
