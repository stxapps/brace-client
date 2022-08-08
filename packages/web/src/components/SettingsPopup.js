import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updateSettingsPopup, updateSettingsViewId } from '../actions';
import {
  SETTINGS_VIEW_ACCOUNT, SETTINGS_VIEW_IAP, SETTINGS_VIEW_IAP_RESTORE,
  SETTINGS_VIEW_DATA, SETTINGS_VIEW_DATA_IMPORT, SETTINGS_VIEW_DATA_EXPORT,
  SETTINGS_VIEW_DATA_DELETE, SETTINGS_VIEW_LISTS, SETTINGS_VIEW_MISC,
  SETTINGS_VIEW_ABOUT, LG_WIDTH,
} from '../types/const';
import { canvasFMV, sideBarOverlayFMV, sideBarFMV } from '../types/animConfigs';

import SettingsPopupAccount from './SettingsPopupAccount';
import { SettingsPopupIap, SettingsPopupIapRestore } from './SettingsPopupIap';
import {
  SettingsPopupData, SettingsPopupDataImport, SettingsPopupDataExport,
  SettingsPopupDataDelete,
} from './SettingsPopupData';
import SettingsPopupLists from './SettingsPopupLists';
import SettingsPopupMisc from './SettingsPopupMisc';
import SettingsPopupAbout from './SettingsPopupAbout';

import { useSafeAreaFrame } from '.';

const VIEW_ACCOUNT = SETTINGS_VIEW_ACCOUNT;
const VIEW_IAP = SETTINGS_VIEW_IAP;
const VIEW_IAP_RESTORE = SETTINGS_VIEW_IAP_RESTORE;
const VIEW_DATA = SETTINGS_VIEW_DATA;
const VIEW_DATA_IMPORT = SETTINGS_VIEW_DATA_IMPORT;
const VIEW_DATA_EXPORT = SETTINGS_VIEW_DATA_EXPORT;
const VIEW_DATA_DELETE = SETTINGS_VIEW_DATA_DELETE;
const VIEW_LISTS = SETTINGS_VIEW_LISTS;
const VIEW_MISC = SETTINGS_VIEW_MISC;
const VIEW_ABOUT = SETTINGS_VIEW_ABOUT;

const SettingsPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isSettingsPopupShown);
  const viewId = useSelector(state => state.display.settingsViewId);
  const isSidebarShown = useSelector(state => state.display.isSettingsSidebarShown);
  const overflowPanel = useRef(null);
  const dispatch = useDispatch();

  const isViewSelected = (refViewId) => {
    const dataViews = [VIEW_DATA, VIEW_DATA_IMPORT, VIEW_DATA_EXPORT, VIEW_DATA_DELETE];
    if (refViewId === VIEW_DATA) {
      return dataViews.includes(viewId);
    }

    const iapViews = [VIEW_IAP, VIEW_IAP_RESTORE];
    if (refViewId === VIEW_IAP) return iapViews.includes(viewId);

    return refViewId === viewId;
  };

  const onPopupCloseBtnClick = () => {
    dispatch(updateSettingsPopup(false));
  };

  const onSidebarOpenBtnClick = () => {
    dispatch(updateSettingsViewId(null, true));
  };

  const onSidebarCloseBtnClick = () => {
    dispatch(updateSettingsViewId(null, false));
  };

  const onAccountBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_ACCOUNT, false));
  };

  const onIapBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_IAP, false));
  };

  const onDataBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA, false));
  };

  const onListsBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_LISTS, false));
  };

  const onMiscBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_MISC, false));
  };

  const onAboutBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_ABOUT, false));
  };

  const onToRestoreIapViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_IAP_RESTORE, null));
  };

  const onBackToIapViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_IAP, false));
  };

  const onToImportAllDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA_IMPORT, null));
  };

  const onToExportAllDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA_EXPORT, null));
  };

  const onToDeleteAllDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA_DELETE, null));
  };

  const onBackToDataViewBtnClick = () => {
    dispatch(updateSettingsViewId(VIEW_DATA, false));
  };

  useEffect(() => {
    if (isShown) window.document.body.style.overflowY = 'hidden';
    else window.document.body.style.overflowY = '';
  }, [isShown]);

  useEffect(() => {
    if (overflowPanel.current) overflowPanel.current.scrollTo(0, 0);
  }, [viewId]);

  useEffect(() => {
    return () => {
      window.document.body.style.overflowY = '';
    };
  }, []);

  if (!isShown) return (
    <AnimatePresence key="AnimatePresence_SP" />
  );

  const _render = (content) => {

    const animate = isSidebarShown ? 'visible' : 'hidden';

    const selectedMenuTextStyleClasses = 'bg-gray-100 text-gray-800';
    const menuTextStyleClasses = 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700';

    const selectedMenuSvgStyleClasses = 'text-gray-500';
    const menuSvgStyleClasses = 'text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500';

    const MAX_W_6XL = 1152; // If change max-w-6xl below, need to update this too.
    const closeBtnStyle = { right: 0 };
    if (safeAreaWidth >= LG_WIDTH) closeBtnStyle.right = 6;
    if (safeAreaWidth >= MAX_W_6XL) {
      closeBtnStyle.right = 6 + ((safeAreaWidth - MAX_W_6XL) / 2);
    }

    return (
      <React.Fragment>
        <div className="fixed inset-0 bg-white z-30">
          <div ref={overflowPanel} className="h-full overflow-y-scroll">
            <div className="relative max-w-6xl mx-auto">
              <div key="panel-with-sidebar" className="max-w-4xl mx-auto px-0 md:px-6 lg:px-8">
                <div className="hidden border-b border-gray-200 md:block md:pt-12">
                  <h2 className="pb-4 text-xl text-gray-800 font-medium leading-6">Settings</h2>
                </div>
                <div className="flex">
                  {/* Sidebar for desktop */}
                  <div key="sidebar-for-desktop" className="hidden md:flex md:flex-shrink-0 md:flex-grow-0">
                    <div className="flex flex-col w-48">
                      <div className="mt-2 mb-6 flex flex-col h-0 flex-1 border-r border-gray-200 min-h-xl">
                        <div className="flex-1 flex flex-col">
                          <nav className="mt-2 pr-2 flex-1 space-y-2">
                            <button onClick={onAccountBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                              <svg className={`mr-3 h-5 w-5 ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                              </svg>
                              Account
                            </button>
                            <button onClick={onIapBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${isViewSelected(VIEW_IAP) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                              <svg className={`mr-3 h-5 w-5 ${isViewSelected(VIEW_IAP) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5 2C5.26522 2 5.51957 2.10536 5.70711 2.29289C5.89464 2.48043 6 2.73478 6 3V4H7C7.26522 4 7.51957 4.10536 7.70711 4.29289C7.89464 4.48043 8 4.73478 8 5C8 5.26522 7.89464 5.51957 7.70711 5.70711C7.51957 5.89464 7.26522 6 7 6H6V7C6 7.26522 5.89464 7.51957 5.70711 7.70711C5.51957 7.89464 5.26522 8 5 8C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7V6H3C2.73478 6 2.48043 5.89464 2.29289 5.70711C2.10536 5.51957 2 5.26522 2 5C2 4.73478 2.10536 4.48043 2.29289 4.29289C2.48043 4.10536 2.73478 4 3 4H4V3C4 2.73478 4.10536 2.48043 4.29289 2.29289C4.48043 2.10536 4.73478 2 5 2ZM5 12C5.26522 12 5.51957 12.1054 5.70711 12.2929C5.89464 12.4804 6 12.7348 6 13V14H7C7.26522 14 7.51957 14.1054 7.70711 14.2929C7.89464 14.4804 8 14.7348 8 15C8 15.2652 7.89464 15.5196 7.70711 15.7071C7.51957 15.8946 7.26522 16 7 16H6V17C6 17.2652 5.89464 17.5196 5.70711 17.7071C5.51957 17.8946 5.26522 18 5 18C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15C2 14.7348 2.10536 14.4804 2.29289 14.2929C2.48043 14.1054 2.73478 14 3 14H4V13C4 12.7348 4.10536 12.4804 4.29289 12.2929C4.48043 12.1054 4.73478 12 5 12ZM12 2C12.2207 1.99993 12.4352 2.07286 12.6101 2.20744C12.785 2.34201 12.9105 2.53066 12.967 2.744L14.146 7.2L17.5 9.134C17.652 9.22177 17.7782 9.34801 17.866 9.50002C17.9538 9.65204 18 9.82447 18 10C18 10.1755 17.9538 10.348 17.866 10.5C17.7782 10.652 17.652 10.7782 17.5 10.866L14.146 12.801L12.966 17.256C12.9094 17.4691 12.7839 17.6576 12.6091 17.792C12.4343 17.9264 12.22 17.9993 11.9995 17.9993C11.779 17.9993 11.5647 17.9264 11.3899 17.792C11.2151 17.6576 11.0896 17.4691 11.033 17.256L9.854 12.8L6.5 10.866C6.34799 10.7782 6.22177 10.652 6.13401 10.5C6.04625 10.348 6.00004 10.1755 6.00004 10C6.00004 9.82447 6.04625 9.65204 6.13401 9.50002C6.22177 9.34801 6.34799 9.22177 6.5 9.134L9.854 7.199L11.034 2.744C11.0905 2.53083 11.2158 2.3423 11.3905 2.20774C11.5652 2.07318 11.7795 2.00015 12 2Z" />
                              </svg>
                              Subscription
                            </button>
                            <button onClick={onDataBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                              <svg className={`mr-3 h-5 w-5 ${isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                              </svg>
                              Data
                            </button>
                            <button onClick={onListsBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${isViewSelected(VIEW_LISTS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                              <svg className={`mr-3 h-5 w-5 ${isViewSelected(VIEW_LISTS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                              </svg>
                              Lists
                            </button>
                            <button onClick={onMiscBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${isViewSelected(VIEW_MISC) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                              <svg className={`mr-3 h-5 w-5 ${isViewSelected(VIEW_MISC) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                                <path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                                <path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                              </svg>
                              Misc.
                            </button>
                            <button onClick={onAboutBtnClick} className={`group flex items-center px-2 py-2 w-full text-sm font-medium leading-5 rounded-md focus:outline-none ${isViewSelected(VIEW_ABOUT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`}>
                              <svg className={`mr-3 h-5 w-5 ${isViewSelected(VIEW_ABOUT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM11 6C11 6.26522 10.8946 6.51957 10.7071 6.70711C10.5196 6.89464 10.2652 7 10 7C9.73478 7 9.48043 6.89464 9.29289 6.70711C9.10536 6.51957 9 6.26522 9 6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6ZM9 9C8.73478 9 8.48043 9.10536 8.29289 9.29289C8.10536 9.48043 8 9.73478 8 10C8 10.2652 8.10536 10.5196 8.29289 10.7071C8.48043 10.8946 8.73478 11 9 11V14C9 14.2652 9.10536 14.5196 9.29289 14.7071C9.48043 14.8946 9.73478 15 10 15H11C11.2652 15 11.5196 14.8946 11.7071 14.7071C11.8946 14.5196 12 14.2652 12 14C12 13.7348 11.8946 13.4804 11.7071 13.2929C11.5196 13.1054 11.2652 13 11 13V10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9H9Z" />
                              </svg>
                              About
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Main panel */}
                  <div key="panel-content" className="flex flex-col flex-shrink flex-grow">
                    <div className="flex-1 relative focus:outline-none">
                      {content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={closeBtnStyle} className="absolute top-0">
            <button onClick={onPopupCloseBtnClick} className="flex items-center justify-center h-12 w-12 group focus:outline-none" aria-label="Close settings popup">
              <div className="bg-white rounded-full">
                <svg className="h-5 w-5 text-gray-300 rounded group-hover:text-gray-500 group-focus:ring md:h-7 md:w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          </div>
        </div>
        {/* Sidebar for mobile */}
        <motion.div key="sidebar-for-mobile" className="fixed inset-0 z-30 md:hidden" variants={canvasFMV} initial={false} animate={animate}>
          <div className="relative h-full flex">
            <motion.button onClick={onSidebarCloseBtnClick} className="absolute inset-0 w-full h-full" variants={sideBarOverlayFMV}>
              <div className="absolute inset-0 bg-gray-100" />
            </motion.button>
            <motion.div className="flex-1 flex flex-col max-w-56 w-full bg-white" variants={sideBarFMV}>
              <div className="pt-8 pb-4 overflow-auto">
                <div className="px-4 flex-shrink-0 flex items-center">
                  <h2 className="text-xl text-gray-800 font-medium leading-6">Settings</h2>
                </div>
                <nav className="mt-6 px-2 space-y-2">
                  <button onClick={onAccountBtnClick} className="px-2 py-2.5 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700">
                    <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                    </svg>
                    Account
                  </button>
                  <button onClick={onIapBtnClick} className="px-2 py-2.5 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700">
                    <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M5 2C5.26522 2 5.51957 2.10536 5.70711 2.29289C5.89464 2.48043 6 2.73478 6 3V4H7C7.26522 4 7.51957 4.10536 7.70711 4.29289C7.89464 4.48043 8 4.73478 8 5C8 5.26522 7.89464 5.51957 7.70711 5.70711C7.51957 5.89464 7.26522 6 7 6H6V7C6 7.26522 5.89464 7.51957 5.70711 7.70711C5.51957 7.89464 5.26522 8 5 8C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7V6H3C2.73478 6 2.48043 5.89464 2.29289 5.70711C2.10536 5.51957 2 5.26522 2 5C2 4.73478 2.10536 4.48043 2.29289 4.29289C2.48043 4.10536 2.73478 4 3 4H4V3C4 2.73478 4.10536 2.48043 4.29289 2.29289C4.48043 2.10536 4.73478 2 5 2ZM5 12C5.26522 12 5.51957 12.1054 5.70711 12.2929C5.89464 12.4804 6 12.7348 6 13V14H7C7.26522 14 7.51957 14.1054 7.70711 14.2929C7.89464 14.4804 8 14.7348 8 15C8 15.2652 7.89464 15.5196 7.70711 15.7071C7.51957 15.8946 7.26522 16 7 16H6V17C6 17.2652 5.89464 17.5196 5.70711 17.7071C5.51957 17.8946 5.26522 18 5 18C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15C2 14.7348 2.10536 14.4804 2.29289 14.2929C2.48043 14.1054 2.73478 14 3 14H4V13C4 12.7348 4.10536 12.4804 4.29289 12.2929C4.48043 12.1054 4.73478 12 5 12ZM12 2C12.2207 1.99993 12.4352 2.07286 12.6101 2.20744C12.785 2.34201 12.9105 2.53066 12.967 2.744L14.146 7.2L17.5 9.134C17.652 9.22177 17.7782 9.34801 17.866 9.50002C17.9538 9.65204 18 9.82447 18 10C18 10.1755 17.9538 10.348 17.866 10.5C17.7782 10.652 17.652 10.7782 17.5 10.866L14.146 12.801L12.966 17.256C12.9094 17.4691 12.7839 17.6576 12.6091 17.792C12.4343 17.9264 12.22 17.9993 11.9995 17.9993C11.779 17.9993 11.5647 17.9264 11.3899 17.792C11.2151 17.6576 11.0896 17.4691 11.033 17.256L9.854 12.8L6.5 10.866C6.34799 10.7782 6.22177 10.652 6.13401 10.5C6.04625 10.348 6.00004 10.1755 6.00004 10C6.00004 9.82447 6.04625 9.65204 6.13401 9.50002C6.22177 9.34801 6.34799 9.22177 6.5 9.134L9.854 7.199L11.034 2.744C11.0905 2.53083 11.2158 2.3423 11.3905 2.20774C11.5652 2.07318 11.7795 2.00015 12 2Z" />
                    </svg>
                    Subscription
                  </button>
                  <button onClick={onDataBtnClick} className="px-2 py-2.5 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700">
                    <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                    </svg>
                    Data
                  </button>
                  <button onClick={onListsBtnClick} className="px-2 py-2.5 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700">
                    <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                    </svg>
                    Lists
                  </button>
                  <button onClick={onMiscBtnClick} className="px-2 py-2.5 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700">
                    <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                      <path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                      <path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                    </svg>
                    Misc.
                  </button>
                  <button onClick={onAboutBtnClick} className="px-2 py-2.5 flex items-center w-full text-base text-gray-500 font-medium leading-5 rounded-md group focus:outline-none hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700">
                    <svg className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM11 6C11 6.26522 10.8946 6.51957 10.7071 6.70711C10.5196 6.89464 10.2652 7 10 7C9.73478 7 9.48043 6.89464 9.29289 6.70711C9.10536 6.51957 9 6.26522 9 6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6ZM9 9C8.73478 9 8.48043 9.10536 8.29289 9.29289C8.10536 9.48043 8 9.73478 8 10C8 10.2652 8.10536 10.5196 8.29289 10.7071C8.48043 10.8946 8.73478 11 9 11V14C9 14.2652 9.10536 14.5196 9.29289 14.7071C9.48043 14.8946 9.73478 15 10 15H11C11.2652 15 11.5196 14.8946 11.7071 14.7071C11.8946 14.5196 12 14.2652 12 14C12 13.7348 11.8946 13.4804 11.7071 13.2929C11.5196 13.1054 11.2652 13 11 13V10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9H9Z" />
                    </svg>
                    About
                  </button>
                </nav>
              </div>
            </motion.div>
            <div className="flex-shrink-0 w-14">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
            <div className="absolute top-0 right-0">
              <button onClick={onPopupCloseBtnClick} className="flex items-center justify-center h-12 w-12 group focus:outline-none" aria-label="Close settings popup">
                <svg className="h-5 w-5 text-gray-300 rounded group-hover:text-gray-500 group-focus:ring" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </React.Fragment>
    );
  };

  const renderAccountView = () => {
    const content = (
      <SettingsPopupAccount onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderIapView = () => {
    const content = (
      <SettingsPopupIap onSidebarOpenBtnClick={onSidebarOpenBtnClick} onToRestoreIapViewBtnClick={onToRestoreIapViewBtnClick} />
    );
    return _render(content);
  };

  const renderRestoreIapView = () => {
    const content = (
      <SettingsPopupIapRestore onBackToIapViewBtnClick={onBackToIapViewBtnClick} />
    );
    return _render(content);
  };

  const renderDataView = () => {
    const content = (
      <SettingsPopupData onSidebarOpenBtnClick={onSidebarOpenBtnClick} onToImportAllDataViewBtnClick={onToImportAllDataViewBtnClick} onToExportAllDataViewBtnClick={onToExportAllDataViewBtnClick} onToDeleteAllDataViewBtnClick={onToDeleteAllDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderImportAllDataView = () => {
    const content = (
      <SettingsPopupDataImport onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderExportAllDataView = () => {
    const content = (
      <SettingsPopupDataExport onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderDeleteAllDataView = () => {
    const content = (
      <SettingsPopupDataDelete onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderListsView = () => {
    const content = (
      <SettingsPopupLists onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderMiscView = () => {
    const content = (
      <SettingsPopupMisc onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderAboutView = () => {
    const content = (
      <SettingsPopupAbout onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  if (viewId === VIEW_ACCOUNT) return renderAccountView();
  else if (viewId === VIEW_IAP) return renderIapView();
  else if (viewId === VIEW_IAP_RESTORE) return renderRestoreIapView();
  else if (viewId === VIEW_DATA) return renderDataView();
  else if (viewId === VIEW_DATA_IMPORT) return renderImportAllDataView();
  else if (viewId === VIEW_DATA_EXPORT) return renderExportAllDataView();
  else if (viewId === VIEW_DATA_DELETE) return renderDeleteAllDataView();
  else if (viewId === VIEW_LISTS) return renderListsView();
  else if (viewId === VIEW_MISC) return renderMiscView();
  else if (viewId === VIEW_ABOUT) return renderAboutView();
  else throw new Error(`Invalid viewId: ${viewId}`);
};

export default React.memo(SettingsPopup);
