import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";

import { updatePopup } from '../actions';
import { MD_WIDTH, SETTINGS_POPUP } from '../types/const';
import { isEqual } from '../utils';
import {
  popupBgFMV, ccPopupFMV, spSideBarCanvasFMV, spSideBarOverlayFMV, spSideBarFMV,
} from '../types/animConfigs';

import SettingsPopupAccount from './SettingsPopupAccount';
import {
  SettingsPopupData, SettingsPopupDataExport, SettingsPopupDataDelete,
} from './SettingsPopupData';
import SettingsPopupLists from './SettingsPopupLists';
import SettingsPopupMisc from './SettingsPopupMisc';

const VIEW_ACCOUNT = 1;
const VIEW_DATA = 2;
const VIEW_DATA_EXPORT = 3;
const VIEW_DATA_DELETE = 4;
const VIEW_LISTS = 5;
const VIEW_MISC = 6;

class SettingsPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      viewId: VIEW_ACCOUNT,
      isSidebarShown: window.innerWidth < MD_WIDTH,
    };
    this.state = { ...this.initialState };

    this.panelContent = React.createRef();
  }

  componentDidUpdate(_, prevState) {
    if (prevState.viewId !== this.state.viewId) {
      if (this.panelContent.current) {
        this.panelContent.current.scroll(0, 0);
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isSettingsPopupShown && nextProps.isSettingsPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState })
      }
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
    this.props.updatePopup(SETTINGS_POPUP, false);
  }

  onSidebarOpenBtnClick = () => {
    this.setState({
      isSidebarShown: true,
    });
  }

  onSidebarCloseBtnClick = () => {
    this.setState({
      isSidebarShown: false,
    });
  }

  onAccountBtnClick = () => {
    this.setState({
      viewId: VIEW_ACCOUNT,
      isSidebarShown: false,
    });
  }

  onDataBtnClick = () => {
    this.setState({
      viewId: VIEW_DATA,
      isSidebarShown: false,
    });
  }

  onListsBtnClick = () => {
    this.setState({
      viewId: VIEW_LISTS,
      isSidebarShown: false,
    });
  }

  onMiscBtnClick = () => {
    this.setState({
      viewId: VIEW_MISC,
      isSidebarShown: false,
    });
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
    });
  }

  _render(content) {

    const { isSidebarShown } = this.state;

    const panelHeight = window.innerHeight * 0.9;
    const animate = isSidebarShown ? 'visible' : 'hidden';

    const selectedMenuTextStyleClasses = 'bg-gray-100 text-gray-800';
    const menuTextStyleClasses = 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700';

    const selectedMenuSvgStyleClasses = 'text-gray-500';
    const menuSvgStyleClasses = 'text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500';

    const panelWithSidebar = (
      <div key="panel-with-sidebar" className="relative flex flex-col overflow-hidden bg-white rounded-lg" style={{ height: panelHeight }}>
        <div className="hidden border-b border-gray-200 md:block md:mt-6 md:ml-6 md:mr-6">
          <h2 className="pb-4 text-xl text-gray-800 font-medium leading-6">Settings</h2>
        </div>
        <div className="hidden absolute top-0 right-0 p-1 md:block">
          <button onClick={this.onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 group focus:outline-none" aria-label="Close settings popup">
            <svg className="h-5 w-5 text-gray-400 rounded group-hover:text-gray-500 group-focus:ring" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar for desktop */}
          <div key="sidebar-for-desktop" className="hidden md:flex md:flex-shrink-0 md:flex-grow-0">
            <div className="flex flex-col w-48">
              <div className="mt-2 flex flex-col h-0 flex-1 bg-white border-r border-gray-200 md:ml-6 md:mb-6">
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <nav className="mt-2 pr-2 flex-1 bg-white space-y-1">
                    <button onClick={this.onAccountBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-3 h-5 w-5 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                      </svg>
                      Account
                    </button>
                    <button onClick={this.onDataBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${this.isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-3 h-5 w-5 ${this.isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                      </svg>
                      Data
                    </button>
                    <button onClick={this.onListsBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${this.isViewSelected(VIEW_LISTS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-3 h-5 w-5 ${this.isViewSelected(VIEW_LISTS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                      </svg>
                      Lists
                    </button>
                    <button onClick={this.onMiscBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${this.isViewSelected(VIEW_MISC) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                      <svg className={`mr-3 h-5 w-5 ${this.isViewSelected(VIEW_MISC) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                        <path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                        <path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                      </svg>
                      Misc.
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          {/* Main panel */}
          <div key="panel-content" className="flex flex-col flex-shrink flex-grow overflow-hidden">
            <div ref={this.panelContent} className="flex-1 relative overflow-y-auto focus:outline-none">
              {content}
              <div className="absolute top-0 right-0 p-1 md:hidden">
                <button onClick={this.onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 group focus:outline-none" aria-label="Close settings popup">
                  <svg className="h-5 w-5 text-gray-400 rounded group-hover:text-gray-500 group-focus:ring" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Sidebar for mobile */}
          <motion.div key="sidebar-for-mobile" className="absolute inset-0 rounded-lg overflow-hidden flex z-10 md:hidden" variants={spSideBarCanvasFMV} initial={false} animate={animate}>
            <motion.button onClick={this.onSidebarCloseBtnClick} className="absolute inset-0 w-full h-full" variants={spSideBarOverlayFMV}>
              <div className="absolute inset-0 bg-gray-100" />
            </motion.button>
            <div className="absolute top-0 right-0 p-1">
              <button onClick={this.onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 group focus:outline-none" aria-label="Close settings popup">
                <svg className="h-5 w-5 text-gray-400 rounded group-hover:text-gray-500 group-focus:ring" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <motion.div className="-ml-8 relative flex-1 flex flex-col max-w-56 w-full bg-white rounded-l-lg" variants={spSideBarFMV}>
              <div className="pt-5 pb-4 pl-8 flex-1 h-0 overflow-y-auto">
                <div className="px-4 flex-shrink-0 flex items-center">
                  <h2 className="text-xl text-gray-800 font-medium leading-6">Settings</h2>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  <button onClick={this.onAccountBtnClick} className={'px-2 py-2 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700'}>
                    <svg className={'mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500'} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                    </svg>
                    Account
                  </button>
                  <button onClick={this.onDataBtnClick} className={'px-2 py-2 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700'}>
                    <svg className={'mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500'} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                    </svg>
                    Data
                  </button>
                  <button onClick={this.onListsBtnClick} className={'px-2 py-2 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700'}>
                    <svg className={'mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500'} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                    </svg>
                    Lists
                  </button>
                  <button onClick={this.onMiscBtnClick} className={'px-2 py-2 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700'}>
                    <svg className={'mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500'} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                      <path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                      <path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                    </svg>
                    Misc.
                  </button>
                </nav>
              </div>
            </motion.div>
            <div className="flex-shrink-0 w-14">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </motion.div>
        </div>
      </div>
    );

    return (
      <AnimatePresence key="AnimatePresence_SP">
        <div className="fixed inset-0 overflow-hidden z-30">
          <div className="p-4 flex items-center justify-center" style={{ minHeight: window.innerHeight }}>
            <div className={'fixed inset-0'}>
              <motion.button onClick={this.onPopupCloseBtnClick} tabIndex={-1} className="absolute inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
            </div>
            <motion.div className={'w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-xl'} role="dialog" aria-modal="true" aria-labelledby="modal-headline" variants={ccPopupFMV} initial="hidden" animate="visible" exit="hidden">
              {panelWithSidebar}
            </motion.div>
          </div>
        </div >
      </AnimatePresence>
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

  renderMiscView() {
    const content = (
      <SettingsPopupMisc onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
    );
    return this._render(content);
  }

  render() {

    const { isSettingsPopupShown } = this.props;
    if (!isSettingsPopupShown) return (
      <AnimatePresence key="AnimatePresence_SP" />
    );

    const { viewId } = this.state;

    if (viewId === VIEW_ACCOUNT) return this.renderAccountView();
    else if (viewId === VIEW_DATA) return this.renderDataView();
    else if (viewId === VIEW_DATA_EXPORT) return this.renderExportAllDataView();
    else if (viewId === VIEW_DATA_DELETE) return this.renderDeleteAllDataView();
    else if (viewId === VIEW_LISTS) return this.renderListsView();
    else if (viewId === VIEW_MISC) return this.renderMiscView();
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
