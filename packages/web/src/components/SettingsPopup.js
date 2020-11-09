import React from 'react';
import { connect } from 'react-redux';

import { updatePopup } from '../actions';
import { SM_WIDTH, MD_WIDTH, SETTINGS_POPUP } from '../types/const';

import SettingsPopupAccount from './SettingsPopupAccount';
import {
  SettingsPopupData, SettingsPopupDataExport, SettingsPopupDataDelete,
} from './SettingsPopupData';
import SettingsPopupLists from './SettingsPopupLists';

const VIEW_ACCOUNT = 1;
const VIEW_DATA = 2;
const VIEW_DATA_EXPORT = 3;
const VIEW_DATA_DELETE = 4;
const VIEW_LISTS = 5;

class SettingsPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      viewId: VIEW_ACCOUNT,
      isShown: false,
      isSidebarShown: window.innerWidth < MD_WIDTH,
      didSidebarTransitionStart: true,
      didSidebarTransitionEnd: true,
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

  UNSAFE_componentWillReceiveProps(nextProps) {

    if (!this.props.isSettingsPopupShown && nextProps.isSettingsPopupShown) {
      this.setState({ isSidebarShown: window.innerWidth < MD_WIDTH })
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

  onListsBtnClick = () => {

    if (window.innerWidth < SM_WIDTH) {
      this.setState({
        isSidebarShown: false,
        didSidebarTransitionStart: false,
        didSidebarTransitionEnd: false,
      });
      this.pendingViewId = VIEW_LISTS;
    } else {
      this.setState({
        viewId: VIEW_LISTS,
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
          {/* Static sidebar for desktop */}
          <div key="sidebar-for-desktop" className="hidden md:flex md:flex-shrink-0 md:flex-grow-0">
            <div className="flex flex-col w-48">
              <div className="mt-2 flex flex-col h-0 flex-1 bg-white border-r border-gray-400 md:ml-6 md:mb-6 lg:ml-8 lg:mb-8">
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
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                      </svg>
                      Data
                    </button>
                    <button onClick={this.onListsBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm leading-5 rounded-md focus:outline-none transition ease-in-out duration-150 ${this.isViewSelected(VIEW_LISTS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-3 h-6 w-6 transition ease-in-out duration-150 ${this.isViewSelected(VIEW_LISTS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                      </svg>
                      Lists
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
                <div className="pt-5 pb-4 flex-1 h-0 overflow-y-auto">
                  <div className="px-4 flex-shrink-0 flex items-center">
                    <h2 className="text-3xl text-gray-800 font-semibold leading-none">Settings</h2>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    <button onClick={this.onAccountBtnClick} className={'px-2 py-2 flex items-center w-full text-base text-gray-700 leading-6 rounded-md group focus:outline-none transition ease-in-out duration-150 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900'}>
                      <svg className={'mr-2 h-6 w-6 text-gray-600 transition ease-in-out duration-150 group-hover:text-gray-700 group-focus:text-gray-700'} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                      </svg>
                      Account
                    </button>
                    <button onClick={this.onDataBtnClick} className={'px-2 py-2 flex items-center w-full text-base text-gray-700 leading-6 rounded-md group focus:outline-none transition ease-in-out duration-150 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900'}>
                      <svg className={'mr-2 h-6 w-6 text-gray-600 transition ease-in-out duration-150 group-hover:text-gray-700 group-focus:text-gray-700'} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                      </svg>
                      Data
                    </button>
                    <button onClick={this.onListsBtnClick} className={'px-2 py-2 flex items-center w-full text-base text-gray-700 leading-6 rounded-md group focus:outline-none transition ease-in-out duration-150 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900'}>
                      <svg className={'mr-2 h-6 w-6 text-gray-600 transition ease-in-out duration-150 group-hover:text-gray-700 group-focus:text-gray-700'} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                      </svg>
                      Lists
                    </button>
                  </nav>
                </div>
              </div>
              <div className="flex-shrink-0 w-14">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
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
        <div className="p-4 flex items-center justify-center" style={{ height: window.innerHeight }}>
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
    const content = (
      <SettingsPopupAccount onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
    );
    return this._render(content);
  }

  renderDataView() {
    const content = (
      <SettingsPopupData onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} onToExportAllDataViewBtnClick={this.onToExportAllDataViewBtnClick} onToDeleteAllDataViewBtnClick={this.onToDeleteAllDataViewBtnClick} />
    );
    return this._render(content);
  }

  renderExportAllDataView() {
    const content = (
      <SettingsPopupDataExport onBackToDataViewBtnClick={this.onBackToDataViewBtnClick} />
    );
    return this._render(content);
  }

  renderDeleteAllDataView() {
    const content = (
      <SettingsPopupDataDelete onBackToDataViewBtnClick={this.onBackToDataViewBtnClick} />
    );
    return this._render(content);
  }

  renderListsView() {
    const content = (
      <SettingsPopupLists onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
    );
    return this._render(content);
  }

  render() {

    if (!this.props.isSettingsPopupShown) return null;

    const { viewId } = this.state;

    if (viewId === VIEW_ACCOUNT) return this.renderAccountView();
    else if (viewId === VIEW_DATA) return this.renderDataView();
    else if (viewId === VIEW_DATA_EXPORT) return this.renderExportAllDataView();
    else if (viewId === VIEW_DATA_DELETE) return this.renderDeleteAllDataView();
    else if (viewId === VIEW_LISTS) return this.renderListsView();
    else throw new Error(`Invalid viewId: ${viewId}`);
  }
}

const mapStateToProps = (state, props) => {
  return {
    isSettingsPopupShown: state.display.isSettingsPopupShown,
  };
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPopup);
