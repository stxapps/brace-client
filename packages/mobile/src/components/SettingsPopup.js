import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, BackHandler,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { updateSettingsPopup } from '../actions';
import { MD_WIDTH } from '../types/const';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';
import { dialogFMV, sidebarFMV } from '../types/animConfigs';

import { withSafeAreaContext } from '.';

import SettingsPopupAccount from './SettingsPopupAccount';
import { SettingsPopupIap, SettingsPopupIapRestore } from './SettingsPopupIap';
import {
  SettingsPopupData, SettingsPopupDataExport, SettingsPopupDataDelete,
} from './SettingsPopupData';
import SettingsPopupLists from './SettingsPopupLists';
import SettingsPopupMisc from './SettingsPopupMisc';
import SettingsPopupAbout from './SettingsPopupAbout';

const VIEW_ACCOUNT = 1;
const VIEW_IAP = 9;
const VIEW_IAP_RESTORE = 10;
const VIEW_DATA = 2;
const VIEW_DATA_EXPORT = 3;
const VIEW_DATA_DELETE = 4;
const VIEW_LISTS = 5;
const VIEW_MISC = 6;
const VIEW_ABOUT = 8;

// This value comes from max-w-56.
// If screen width is too narrow, the value might be less than this.
const SIDE_BAR_WIDTH = 224;

class SettingsPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      didCloseAnimEnd: !props.isSettingsPopupShown,
      viewId: VIEW_ACCOUNT,
      isSidebarShown: props.safeAreaWidth < MD_WIDTH,
      didSidebarAnimEnd: true,
    };

    this.panelContent = React.createRef();

    this.popupScale = new Animated.Value(0);
    this.sidebarTranslateX = new Animated.Value(
      this.state.isSidebarShown ? 0 : SIDE_BAR_WIDTH * -1
    );

    this.settingsPopupBackHandler = null;
  }

  componentDidMount() {
    this.registerSettingsPopupBackHandler(this.props.isSettingsPopupShown);

    if (this.props.isSettingsPopupShown) {
      Animated.timing(
        this.popupScale, { toValue: 1, ...dialogFMV.visible }
      ).start();
    }
  }

  componentDidUpdate(prevProps, prevState) {

    const { isSettingsPopupShown } = this.props;
    if (prevProps.isSettingsPopupShown !== isSettingsPopupShown) {
      this.registerSettingsPopupBackHandler(isSettingsPopupShown);
    }

    if (!prevProps.isSettingsPopupShown && isSettingsPopupShown) {
      Animated.timing(
        this.popupScale, { toValue: 1, ...dialogFMV.visible }
      ).start();
    }

    if (prevProps.isSettingsPopupShown && !isSettingsPopupShown) {
      Animated.timing(
        this.popupScale, { toValue: 0, ...dialogFMV.hidden }
      ).start(() => {
        this.setState({ didCloseAnimEnd: true });
      });
    }

    const { isSidebarShown } = this.state;

    if (!prevState.isSidebarShown && isSidebarShown) {
      Animated.timing(
        this.sidebarTranslateX, { toValue: 0, ...sidebarFMV.visible }
      ).start(() => {
        this.setState({ didSidebarAnimEnd: true });
      });
    }

    if (prevState.isSidebarShown && !isSidebarShown) {
      Animated.timing(
        this.sidebarTranslateX,
        { toValue: SIDE_BAR_WIDTH * -1, ...sidebarFMV.hidden }
      ).start(() => {
        this.setState({ didSidebarAnimEnd: true });
      });
    }

    if (prevState.viewId !== this.state.viewId) {
      if (this.panelContent.current) {
        setTimeout(() => {
          if (this.panelContent.current) {
            this.panelContent.current.scrollTo({ x: 0, y: 0, animated: true });
          }
        }, 1);
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isSettingsPopupShown && nextProps.isSettingsPopupShown) {
      if (this.state.didCloseAnimEnd) {
        this.setState({
          didCloseAnimEnd: false,
          viewId: VIEW_ACCOUNT,
          isSidebarShown: nextProps.safeAreaWidth < MD_WIDTH,
          didSidebarAnimEnd: true,
        });
      }
    }
  }

  componentWillUnmount() {
    this.registerSettingsPopupBackHandler(false);
  }

  registerSettingsPopupBackHandler = (isSettingsPopupShown) => {
    if (isSettingsPopupShown) {
      if (!this.settingsPopupBackHandler) {
        this.settingsPopupBackHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            if (!this.props.isSettingsPopupShown) return false;

            this.onPopupCloseBtnClick();
            return true;
          }
        );
      }
    } else {
      if (this.settingsPopupBackHandler) {
        this.settingsPopupBackHandler.remove();
        this.settingsPopupBackHandler = null;
      }
    }
  }

  isViewSelected = (viewId) => {
    const dataViews = [VIEW_DATA, VIEW_DATA_EXPORT, VIEW_DATA_DELETE];
    if (viewId === VIEW_DATA) {
      return dataViews.includes(this.state.viewId);
    }

    const iapViews = [VIEW_IAP, VIEW_IAP_RESTORE];
    if (viewId === VIEW_IAP) return iapViews.includes(this.state.viewId);

    return viewId === this.state.viewId;
  }

  onPopupCloseBtnClick = () => {
    this.props.updateSettingsPopup(false);
  }

  onSidebarOpenBtnClick = () => {
    this.setState({
      isSidebarShown: true,
      didSidebarAnimEnd: false,
    });
  }

  onSidebarCloseBtnClick = () => {
    this.setState({
      isSidebarShown: false,
      didSidebarAnimEnd: false,
    });
  }

  onAccountBtnClick = () => {
    this.setState({
      viewId: VIEW_ACCOUNT,
      isSidebarShown: false,
      didSidebarAnimEnd: false,
    });
  }

  onIapBtnClick = () => {
    this.setState({
      viewId: VIEW_IAP,
      isSidebarShown: false,
    });
  }

  onDataBtnClick = () => {
    this.setState({
      viewId: VIEW_DATA,
      isSidebarShown: false,
      didSidebarAnimEnd: false,
    });
  }

  onListsBtnClick = () => {
    this.setState({
      viewId: VIEW_LISTS,
      isSidebarShown: false,
      didSidebarAnimEnd: false,
    });
  }

  onMiscBtnClick = () => {
    this.setState({
      viewId: VIEW_MISC,
      isSidebarShown: false,
      didSidebarAnimEnd: false,
    });
  }

  onAboutBtnClick = () => {
    this.setState({
      viewId: VIEW_ABOUT,
      isSidebarShown: false,
    });
  }

  onToRestoreIapViewBtnClick = () => {
    this.setState({ viewId: VIEW_IAP_RESTORE });
  }

  onBackToIapViewBtnClick = () => {
    this.setState({
      viewId: VIEW_IAP,
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
      didSidebarAnimEnd: true,
    });
  }

  _render(content) {

    const { safeAreaWidth, insets } = this.props;
    const { isSidebarShown, didSidebarAnimEnd } = this.state;

    const sidebarCanvasStyleClasses = !isSidebarShown && didSidebarAnimEnd ? 'hidden relative' : 'absolute inset-0';
    const sidebarStyle = {
      transform: [{ translateX: this.sidebarTranslateX }],
    };
    const changingSidebarCloseBtnOpacity = this.sidebarTranslateX.interpolate({
      inputRange: [SIDE_BAR_WIDTH * -1, 0],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const sidebarCloseBtnStyle = { opacity: changingSidebarCloseBtnOpacity };

    const selectedMenuBtnStyleClasses = 'bg-gray-100';
    const menuBtnStyleClasses = '';

    const selectedMenuTextStyleClasses = 'text-gray-800';
    const menuTextStyleClasses = 'text-gray-500';

    const selectedMenuSvgStyleClasses = 'text-gray-500';
    const menuSvgStyleClasses = 'text-gray-400';

    const modalStyle = {
      paddingTop: insets.top, paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right,
    };

    return (
      <React.Fragment>
        <View style={cache('SP_modal', [tailwind('absolute inset-0 bg-white z-30'), modalStyle], [insets.top, insets.bottom, insets.left, insets.right])}>
          <ScrollView ref={this.panelContent} style={tailwind('flex-1')} keyboardShouldPersistTaps="handled">
            <View style={tailwind('items-center justify-start')}>
              <View style={tailwind('w-full max-w-6xl items-center justify-start')}>
                <View key="panel-with-sidebar" style={tailwind('w-full max-w-4xl px-0 md:px-6 lg:px-8', safeAreaWidth)}>
                  <View style={tailwind('hidden border-b border-gray-200 md:flex md:pt-12', safeAreaWidth)}>
                    <Text style={tailwind('pb-4 text-xl text-gray-800 font-medium leading-6')}>Settings</Text>
                  </View>
                  <View style={tailwind('flex-1 flex-row')}>
                    {/* Sidebar for desktop */}
                    <View key="sidebar-for-desktop" style={tailwind('hidden md:flex md:flex-shrink-0 md:flex-grow-0', safeAreaWidth)}>
                      <View style={tailwind('mt-2 mb-6 w-48 border-r border-gray-200 min-h-xl')}>
                        <View style={tailwind('mt-2 pr-2')}>
                          <TouchableOpacity onPress={this.onAccountBtnClick} style={tailwind(`px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                            <Svg style={tailwind(`mr-3 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                            </Svg>
                            <Text style={tailwind(`text-sm font-medium leading-5 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Account</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.onIapBtnClick} style={tailwind(`mt-2 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_IAP) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                            <Svg style={tailwind(`mr-3 ${this.isViewSelected(VIEW_IAP) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                              <Path fillRule="evenodd" clipRule="evenodd" d="M5 2C5.26522 2 5.51957 2.10536 5.70711 2.29289C5.89464 2.48043 6 2.73478 6 3V4H7C7.26522 4 7.51957 4.10536 7.70711 4.29289C7.89464 4.48043 8 4.73478 8 5C8 5.26522 7.89464 5.51957 7.70711 5.70711C7.51957 5.89464 7.26522 6 7 6H6V7C6 7.26522 5.89464 7.51957 5.70711 7.70711C5.51957 7.89464 5.26522 8 5 8C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7V6H3C2.73478 6 2.48043 5.89464 2.29289 5.70711C2.10536 5.51957 2 5.26522 2 5C2 4.73478 2.10536 4.48043 2.29289 4.29289C2.48043 4.10536 2.73478 4 3 4H4V3C4 2.73478 4.10536 2.48043 4.29289 2.29289C4.48043 2.10536 4.73478 2 5 2ZM5 12C5.26522 12 5.51957 12.1054 5.70711 12.2929C5.89464 12.4804 6 12.7348 6 13V14H7C7.26522 14 7.51957 14.1054 7.70711 14.2929C7.89464 14.4804 8 14.7348 8 15C8 15.2652 7.89464 15.5196 7.70711 15.7071C7.51957 15.8946 7.26522 16 7 16H6V17C6 17.2652 5.89464 17.5196 5.70711 17.7071C5.51957 17.8946 5.26522 18 5 18C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15C2 14.7348 2.10536 14.4804 2.29289 14.2929C2.48043 14.1054 2.73478 14 3 14H4V13C4 12.7348 4.10536 12.4804 4.29289 12.2929C4.48043 12.1054 4.73478 12 5 12ZM12 2C12.2207 1.99993 12.4352 2.07286 12.6101 2.20744C12.785 2.34201 12.9105 2.53066 12.967 2.744L14.146 7.2L17.5 9.134C17.652 9.22177 17.7782 9.34801 17.866 9.50002C17.9538 9.65204 18 9.82447 18 10C18 10.1755 17.9538 10.348 17.866 10.5C17.7782 10.652 17.652 10.7782 17.5 10.866L14.146 12.801L12.966 17.256C12.9094 17.4691 12.7839 17.6576 12.6091 17.792C12.4343 17.9264 12.22 17.9993 11.9995 17.9993C11.779 17.9993 11.5647 17.9264 11.3899 17.792C11.2151 17.6576 11.0896 17.4691 11.033 17.256L9.854 12.8L6.5 10.866C6.34799 10.7782 6.22177 10.652 6.13401 10.5C6.04625 10.348 6.00004 10.1755 6.00004 10C6.00004 9.82447 6.04625 9.65204 6.13401 9.50002C6.22177 9.34801 6.34799 9.22177 6.5 9.134L9.854 7.199L11.034 2.744C11.0905 2.53083 11.2158 2.3423 11.3905 2.20774C11.5652 2.07318 11.7795 2.00015 12 2Z" />
                            </Svg>
                            <Text style={tailwind(`text-sm font-medium leading-5 ${this.isViewSelected(VIEW_IAP) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Subscription</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.onDataBtnClick} style={tailwind(`mt-2 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_DATA) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                            <Svg style={tailwind(`mr-3 ${this.isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                              <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                              <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                              <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                            </Svg>
                            <Text style={tailwind(`text-sm font-medium leading-5 ${this.isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Data</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.onListsBtnClick} style={tailwind(`mt-2 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_LISTS) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                            <Svg style={tailwind(`mr-3 ${this.isViewSelected(VIEW_LISTS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                              <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                            </Svg>
                            <Text style={tailwind(`text-sm font-medium leading-5 ${this.isViewSelected(VIEW_LISTS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Lists</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.onMiscBtnClick} style={tailwind(`mt-2 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_MISC) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                            <Svg style={tailwind(`mr-3 ${this.isViewSelected(VIEW_MISC) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                              <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                              <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                              <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                            </Svg>
                            <Text style={tailwind(`text-sm font-medium leading-5 ${this.isViewSelected(VIEW_MISC) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Misc.</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.onAboutBtnClick} style={tailwind(`mt-2 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_ABOUT) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                            <Svg style={tailwind(`mr-3 ${this.isViewSelected(VIEW_ABOUT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM11 6C11 6.26522 10.8946 6.51957 10.7071 6.70711C10.5196 6.89464 10.2652 7 10 7C9.73478 7 9.48043 6.89464 9.29289 6.70711C9.10536 6.51957 9 6.26522 9 6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6ZM9 9C8.73478 9 8.48043 9.10536 8.29289 9.29289C8.10536 9.48043 8 9.73478 8 10C8 10.2652 8.10536 10.5196 8.29289 10.7071C8.48043 10.8946 8.73478 11 9 11V14C9 14.2652 9.10536 14.5196 9.29289 14.7071C9.48043 14.8946 9.73478 15 10 15H11C11.2652 15 11.5196 14.8946 11.7071 14.7071C11.8946 14.5196 12 14.2652 12 14C12 13.7348 11.8946 13.4804 11.7071 13.2929C11.5196 13.1054 11.2652 13 11 13V10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9H9Z" />
                            </Svg>
                            <Text style={tailwind(`text-sm font-medium leading-5 ${this.isViewSelected(VIEW_ABOUT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>About</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {/* Main panel */}
                    <View key="panel-content" style={tailwind('flex-shrink flex-grow')}>
                      {content}
                      <View style={tailwind('absolute top-0 right-0 md:hidden md:relative', safeAreaWidth)}>
                        <TouchableOpacity onPress={this.onPopupCloseBtnClick} style={tailwind('items-center justify-center h-12 w-12')}>
                          <Svg style={tailwind('text-gray-300 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </Svg>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={tailwind('hidden relative md:flex md:absolute md:top-0 md:right-0', safeAreaWidth)}>
                  <TouchableOpacity onPress={this.onPopupCloseBtnClick} style={tailwind('items-center justify-center h-12 w-12')}>
                    <Svg style={tailwind('text-gray-300 font-normal')} width={28} height={28} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
        {/* Sidebar for mobile */}
        <View key="sidebar-for-mobile" style={[tailwind(`${sidebarCanvasStyleClasses} z-30 md:hidden md:relative`, safeAreaWidth), modalStyle]}>
          <View style={tailwind('h-full flex flex-row')}>
            <TouchableWithoutFeedback onPress={this.onSidebarCloseBtnClick}>
              <Animated.View style={[tailwind('absolute inset-0 bg-gray-100'), sidebarCloseBtnStyle]} />
            </TouchableWithoutFeedback>
            <Animated.View style={[tailwind('flex-1 max-w-56 w-full bg-white'), sidebarStyle]}>
              <ScrollView style={tailwind('flex-1')}>
                <View style={tailwind('pt-8 pb-4')}>
                  <View style={tailwind('px-4 flex-shrink-0 flex-row items-center')}>
                    <Text style={tailwind('text-xl text-gray-800 font-medium leading-6')}>Settings</Text>
                  </View>
                  <View style={tailwind('mt-6 px-2')}>
                    <TouchableOpacity onPress={this.onAccountBtnClick} style={tailwind('px-2 py-2.5 flex-row items-center w-full rounded-md')}>
                      <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                        <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                      </Svg>
                      <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.onIapBtnClick} style={tailwind('mt-2 px-2 py-2.5 flex-row items-center w-full rounded-md')}>
                      <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                        <Path fillRule="evenodd" clipRule="evenodd" d="M5 2C5.26522 2 5.51957 2.10536 5.70711 2.29289C5.89464 2.48043 6 2.73478 6 3V4H7C7.26522 4 7.51957 4.10536 7.70711 4.29289C7.89464 4.48043 8 4.73478 8 5C8 5.26522 7.89464 5.51957 7.70711 5.70711C7.51957 5.89464 7.26522 6 7 6H6V7C6 7.26522 5.89464 7.51957 5.70711 7.70711C5.51957 7.89464 5.26522 8 5 8C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7V6H3C2.73478 6 2.48043 5.89464 2.29289 5.70711C2.10536 5.51957 2 5.26522 2 5C2 4.73478 2.10536 4.48043 2.29289 4.29289C2.48043 4.10536 2.73478 4 3 4H4V3C4 2.73478 4.10536 2.48043 4.29289 2.29289C4.48043 2.10536 4.73478 2 5 2ZM5 12C5.26522 12 5.51957 12.1054 5.70711 12.2929C5.89464 12.4804 6 12.7348 6 13V14H7C7.26522 14 7.51957 14.1054 7.70711 14.2929C7.89464 14.4804 8 14.7348 8 15C8 15.2652 7.89464 15.5196 7.70711 15.7071C7.51957 15.8946 7.26522 16 7 16H6V17C6 17.2652 5.89464 17.5196 5.70711 17.7071C5.51957 17.8946 5.26522 18 5 18C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15C2 14.7348 2.10536 14.4804 2.29289 14.2929C2.48043 14.1054 2.73478 14 3 14H4V13C4 12.7348 4.10536 12.4804 4.29289 12.2929C4.48043 12.1054 4.73478 12 5 12ZM12 2C12.2207 1.99993 12.4352 2.07286 12.6101 2.20744C12.785 2.34201 12.9105 2.53066 12.967 2.744L14.146 7.2L17.5 9.134C17.652 9.22177 17.7782 9.34801 17.866 9.50002C17.9538 9.65204 18 9.82447 18 10C18 10.1755 17.9538 10.348 17.866 10.5C17.7782 10.652 17.652 10.7782 17.5 10.866L14.146 12.801L12.966 17.256C12.9094 17.4691 12.7839 17.6576 12.6091 17.792C12.4343 17.9264 12.22 17.9993 11.9995 17.9993C11.779 17.9993 11.5647 17.9264 11.3899 17.792C11.2151 17.6576 11.0896 17.4691 11.033 17.256L9.854 12.8L6.5 10.866C6.34799 10.7782 6.22177 10.652 6.13401 10.5C6.04625 10.348 6.00004 10.1755 6.00004 10C6.00004 9.82447 6.04625 9.65204 6.13401 9.50002C6.22177 9.34801 6.34799 9.22177 6.5 9.134L9.854 7.199L11.034 2.744C11.0905 2.53083 11.2158 2.3423 11.3905 2.20774C11.5652 2.07318 11.7795 2.00015 12 2Z" />
                      </Svg>
                      <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Subscription</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.onDataBtnClick} style={tailwind('mt-2 px-2 py-2.5 flex-row items-center w-full rounded-md')}>
                      <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                        <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                        <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                        <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                      </Svg>
                      <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.onListsBtnClick} style={tailwind('mt-2 px-2 py-2.5 flex-row items-center w-full rounded-md')}>
                      <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                        <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                      </Svg>
                      <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Lists</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.onMiscBtnClick} style={tailwind('mt-2 px-2 py-2.5 flex-row items-center w-full rounded-md')}>
                      <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                        <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                        <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                        <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                      </Svg>
                      <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Misc.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.onAboutBtnClick} style={tailwind('mt-2 px-2 py-2.5 flex-row items-center w-full rounded-md')}>
                      <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                        <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM11 6C11 6.26522 10.8946 6.51957 10.7071 6.70711C10.5196 6.89464 10.2652 7 10 7C9.73478 7 9.48043 6.89464 9.29289 6.70711C9.10536 6.51957 9 6.26522 9 6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6ZM9 9C8.73478 9 8.48043 9.10536 8.29289 9.29289C8.10536 9.48043 8 9.73478 8 10C8 10.2652 8.10536 10.5196 8.29289 10.7071C8.48043 10.8946 8.73478 11 9 11V14C9 14.2652 9.10536 14.5196 9.29289 14.7071C9.48043 14.8946 9.73478 15 10 15H11C11.2652 15 11.5196 14.8946 11.7071 14.7071C11.8946 14.5196 12 14.2652 12 14C12 13.7348 11.8946 13.4804 11.7071 13.2929C11.5196 13.1054 11.2652 13 11 13V10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9H9Z" />
                      </Svg>
                      <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>About</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Animated.View>
            <View style={tailwind('flex-shrink-0 w-14')}>
              {/* Force sidebar to shrink to fit close icon */}
            </View>
            <View style={tailwind('absolute top-0 right-0')}>
              <TouchableOpacity onPress={this.onPopupCloseBtnClick} style={tailwind('items-center justify-center h-12 w-12')}>
                <Svg style={tailwind('text-gray-300 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderAccountView() {
    const content = (
      /* @ts-ignore */
      <SettingsPopupAccount onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
    );
    return this._render(content);
  }

  renderIapView() {
    const content = (
      <SettingsPopupIap onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} onToRestoreIapViewBtnClick={this.onToRestoreIapViewBtnClick} />
    );
    return this._render(content);
  }

  renderRestoreIapView() {
    const content = (
      <SettingsPopupIapRestore onBackToIapViewBtnClick={this.onBackToIapViewBtnClick} />
    );
    return this._render(content);
  }

  renderDataView() {
    const content = (
      /* @ts-ignore */
      <SettingsPopupData onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} onToExportAllDataViewBtnClick={this.onToExportAllDataViewBtnClick} onToDeleteAllDataViewBtnClick={this.onToDeleteAllDataViewBtnClick} />
    );
    return this._render(content);
  }

  renderExportAllDataView() {
    const content = (
      /* @ts-ignore */
      <SettingsPopupDataExport onBackToDataViewBtnClick={this.onBackToDataViewBtnClick} />
    );
    return this._render(content);
  }

  renderDeleteAllDataView() {
    const content = (
      /* @ts-ignore */
      <SettingsPopupDataDelete onBackToDataViewBtnClick={this.onBackToDataViewBtnClick} />
    );
    return this._render(content);
  }

  renderListsView() {
    const content = (
      /* @ts-ignore */
      <SettingsPopupLists onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
    );
    return this._render(content);
  }

  renderMiscView() {
    const content = (
      /* @ts-ignore */
      <SettingsPopupMisc onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
    );
    return this._render(content);
  }

  renderAboutView() {
    const content = (
      <SettingsPopupAbout onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
    );
    return this._render(content);
  }

  render() {

    if (!this.props.isSettingsPopupShown && this.state.didCloseAnimEnd) return null;

    const { viewId } = this.state;

    if (viewId === VIEW_ACCOUNT) return this.renderAccountView();
    else if (viewId === VIEW_IAP) return this.renderIapView();
    else if (viewId === VIEW_IAP_RESTORE) return this.renderRestoreIapView();
    else if (viewId === VIEW_DATA) return this.renderDataView();
    else if (viewId === VIEW_DATA_EXPORT) return this.renderExportAllDataView();
    else if (viewId === VIEW_DATA_DELETE) return this.renderDeleteAllDataView();
    else if (viewId === VIEW_LISTS) return this.renderListsView();
    else if (viewId === VIEW_MISC) return this.renderMiscView();
    else if (viewId === VIEW_ABOUT) return this.renderAboutView();
    else throw new Error(`Invalid viewId: ${viewId}`);
  }
}

const mapStateToProps = (state, props) => {
  return {
    isSettingsPopupShown: state.display.isSettingsPopupShown,
  };
};

const mapDispatchToProps = { updateSettingsPopup };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(SettingsPopup));
