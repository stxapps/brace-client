import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, BackHandler,
  Animated, Keyboard, Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg'

import { updatePopup } from '../actions';
import { MD_WIDTH, SETTINGS_POPUP } from '../types/const';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';
import {
  popupOpenAnimConfig, popupCloseAnimConfig,
  bModalOpenAnimConfig, bModalCloseAnimConfig,
} from '../types/animConfigs';

import { withSafeAreaContext } from '.';

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

// This value comes from max-w-48.
// If screen width is too narrow, the value might be less than this.
const SIDE_BAR_WIDTH = 192;

class SettingsPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      didCloseAnimEnd: !props.isSettingsPopupShown,
      viewId: VIEW_ACCOUNT,
      isSidebarShown: props.safeAreaWidth < MD_WIDTH,
      didSidebarAnimEnd: true,
      keyboardHeight: 0,
    };

    this.panelContent = React.createRef();

    this.popupScale = new Animated.Value(0);
    this.sidebarTranslateX = new Animated.Value(
      this.state.isSidebarShown ? 0 : SIDE_BAR_WIDTH * -1
    );

    this.settingsPopupBackHandler = null;
    this.keyboardDidShowListener = null;
    this.keyboardDidHideListener = null;
  }

  componentDidMount() {
    this.registerSettingsPopupBackHandler(this.props.isSettingsPopupShown);
    this.registerKeyboardListeners(this.props.isSettingsPopupShown);

    if (this.props.isSettingsPopupShown) {
      Animated.spring(
        this.popupScale, { toValue: 1, ...popupOpenAnimConfig }
      ).start();
    }
  }

  componentDidUpdate(prevProps, prevState) {

    const { isSettingsPopupShown } = this.props;
    if (prevProps.isSettingsPopupShown !== isSettingsPopupShown) {
      this.registerSettingsPopupBackHandler(isSettingsPopupShown);
      this.registerKeyboardListeners(isSettingsPopupShown);
    }

    if (!prevProps.isSettingsPopupShown && isSettingsPopupShown) {
      Animated.spring(
        this.popupScale, { toValue: 1, ...popupOpenAnimConfig }
      ).start();
    }

    if (prevProps.isSettingsPopupShown && !isSettingsPopupShown) {
      Animated.spring(
        this.popupScale, { toValue: 0, ...popupCloseAnimConfig }
      ).start(() => {
        this.setState({ didCloseAnimEnd: true });
      });
    }

    const { isSidebarShown } = this.state;

    if (!prevState.isSidebarShown && isSidebarShown) {
      Animated.spring(
        this.sidebarTranslateX, { toValue: 0, ...bModalOpenAnimConfig }
      ).start(() => {
        this.setState({ didSidebarAnimEnd: true });
      });
    }

    if (prevState.isSidebarShown && !isSidebarShown) {
      Animated.spring(
        this.sidebarTranslateX,
        { toValue: SIDE_BAR_WIDTH * -1, ...bModalCloseAnimConfig }
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
          keyboardHeight: 0,
        })
      }
    }
  }

  componentWillUnmount() {
    this.registerSettingsPopupBackHandler(false);
    this.registerKeyboardListeners(false);
  }

  registerSettingsPopupBackHandler = (isSettingsPopupShown) => {
    if (isSettingsPopupShown) {
      if (!this.settingsPopupBackHandler) {
        this.settingsPopupBackHandler = BackHandler.addEventListener(
          "hardwareBackPress",
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

  registerKeyboardListeners = (isSettingsPopupShown) => {
    if (isSettingsPopupShown) {
      if (!this.keyboardDidShowListener) {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
          this.setState({ keyboardHeight: e.endCoordinates.height });
        });
      }
      if (!this.keyboardDidHideListener) {
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
          this.setState({ keyboardHeight: 0 });
        });
      }
    } else {
      if (this.keyboardDidShowListener) {
        this.keyboardDidShowListener.remove();
        this.keyboardDidShowListener = null;
      }
      if (this.keyboardDidHideListener) {
        this.keyboardDidHideListener.remove();
        this.keyboardDidHideListener = null;
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

    const { safeAreaWidth, safeAreaHeight, insets } = this.props;

    const statusBarHeight = 24;
    let appHeight = safeAreaHeight - statusBarHeight;
    if (Platform.OS === 'android' && this.state.keyboardHeight > 0) {
      appHeight -= this.state.keyboardHeight;
    }
    const panelHeight = appHeight * 0.9;

    const { isSidebarShown, didSidebarAnimEnd } = this.state;

    const sidebarCanvasStyleClasses = !isSidebarShown && didSidebarAnimEnd ? 'hidden relative' : 'absolute inset-0 flex flex-row';

    const sidebarStyle = {
      transform: [{ translateX: this.sidebarTranslateX }]
    };

    const changingSidebarCloseBtnOpacity = this.sidebarTranslateX.interpolate({
      inputRange: [SIDE_BAR_WIDTH * -1, 0],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });
    const sidebarCloseBtnStyle = { opacity: changingSidebarCloseBtnOpacity };

    const selectedMenuBtnStyleClasses = 'bg-gray-200';
    const menuBtnStyleClasses = '';

    const selectedMenuTextStyleClasses = 'text-gray-800';
    const menuTextStyleClasses = 'text-gray-600';

    const selectedMenuSvgStyleClasses = 'text-gray-600';
    const menuSvgStyleClasses = 'text-gray-500';

    const panelWithSidebar = (
      <View key="panel-with-sidebar" style={cache('SP_panel', { height: panelHeight }, panelHeight)}>
        <View style={tailwind('hidden relative p-1 md:flex md:absolute md:top-0 md:right-0', safeAreaWidth)}>
          <TouchableOpacity onPress={this.onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7 rounded-full')}>
            <Svg style={tailwind('text-base text-gray-500 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </Svg>
          </TouchableOpacity>
        </View>
        <View style={tailwind('hidden border-b border-gray-400 md:flex md:mt-6 md:ml-6 md:mr-6 lg:mt-8 lg:ml-8 lg:mr-8', safeAreaWidth)}>
          <Text style={tailwind('pb-3 text-3xl text-gray-800 font-semibold')}>Settings</Text>
        </View>
        <View style={tailwind('flex-1 flex-row')}>
          {/* Static sidebar for desktop */}
          <View key="sidebar-for-desktop" style={tailwind('hidden md:flex md:flex-shrink-0 md:flex-grow-0', safeAreaWidth)}>
            <View style={tailwind('mt-2 flex-1 w-48 border-r border-gray-400 md:ml-6 md:mb-6 lg:ml-8 lg:mb-8', safeAreaWidth)}>
              <View style={tailwind('mt-2 pr-2 bg-white')}>
                <TouchableOpacity onPress={this.onAccountBtnClick} style={tailwind(`px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 text-base ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-normal leading-5 ${this.isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onDataBtnClick} style={tailwind(`mt-1 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_DATA) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 text-base ${this.isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-normal leading-5 ${this.isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onListsBtnClick} style={tailwind(`mt-1 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_LISTS) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 text-base ${this.isViewSelected(VIEW_LISTS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-normal leading-5 ${this.isViewSelected(VIEW_LISTS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Lists</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onMiscBtnClick} style={tailwind(`mt-1 px-2 py-2 flex-row items-center w-full rounded-md ${this.isViewSelected(VIEW_MISC) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 text-base ${this.isViewSelected(VIEW_MISC) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses} font-normal`)} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                    <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                    <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-normal leading-5 ${this.isViewSelected(VIEW_MISC) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Misc.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View key="panel-content" style={tailwind('flex-shrink flex-grow')}>
            <ScrollView ref={this.panelContent} style={tailwind('flex-1')} keyboardShouldPersistTaps="handled">
              {content}
              <View style={tailwind('absolute top-0 right-0 p-1 md:hidden md:relative', safeAreaWidth)}>
                <TouchableOpacity onPress={this.onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7 rounded-full')}>
                  <Svg style={tailwind('text-base text-gray-500 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          {/* Off-canvas sidebar for mobile */}
          <View key="sidebar-for-mobile" style={tailwind(`${sidebarCanvasStyleClasses} z-10 md:hidden md:relative`, safeAreaWidth)}>
            <TouchableWithoutFeedback onPress={this.onSidebarCloseBtnClick}>
              <Animated.View style={[tailwind('absolute inset-0 bg-gray-300'), sidebarCloseBtnStyle]}></Animated.View>
            </TouchableWithoutFeedback>
            <View style={tailwind('absolute top-0 right-0 p-1')}>
              <TouchableOpacity onPress={this.onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7 rounded-full')}>
                <Svg style={tailwind('text-base text-gray-500 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>
            <Animated.View style={[tailwind('-ml-8 pt-5 pb-4 pl-8 flex-1 max-w-56 w-full bg-white'), sidebarStyle]}>
              <View style={tailwind('px-4 flex-shrink-0 flex-row items-center')}>
                <Text style={tailwind('text-3xl text-gray-800 font-semibold')}>Settings</Text>
              </View>
              <View style={tailwind('mt-5 px-2')}>
                <TouchableOpacity onPress={this.onAccountBtnClick} style={tailwind('px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-700 font-normal leading-6')}>Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onDataBtnClick} style={tailwind('mt-1 px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-700 font-normal leading-6')}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onListsBtnClick} style={tailwind('mt-1 px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-700 font-normal leading-6')}>Lists</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onMiscBtnClick} style={tailwind('mt-1 px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                    <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                    <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-700 font-normal leading-6')}>Misc.</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            <View style={tailwind('flex-shrink-0 w-14')}>
              {/* Force sidebar to shrink to fit close icon */}
            </View>
          </View>
        </View>
      </View>
    );

    const modalStyle = { paddingLeft: 16 + insets.left, paddingRight: 16 + insets.right };
    const popupStyle = { transform: [{ scale: this.popupScale }] };

    return (
      <View style={cache('SP_modal', [tailwind('absolute inset-0 items-center justify-center z-30'), modalStyle], [insets.left, insets.right])}>
        <TouchableWithoutFeedback onPress={this.onPopupCloseBtnClick}>
          <View style={tailwind('absolute inset-0 bg-black opacity-25')}></View>
        </TouchableWithoutFeedback>
        <Animated.View style={[tailwind('w-full max-w-4xl bg-white rounded-lg shadow-xl'), popupStyle]}>
          <View style={tailwind('w-full bg-white rounded-lg overflow-hidden')}>
            {panelWithSidebar}
          </View>
        </Animated.View>
      </View>
    );
  }

  renderAccountView() {
    const content = (
      /* @ts-ignore */
      <SettingsPopupAccount onSidebarOpenBtnClick={this.onSidebarOpenBtnClick} />
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

  render() {

    if (!this.props.isSettingsPopupShown && this.state.didCloseAnimEnd) return null;

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
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  }
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(SettingsPopup));
