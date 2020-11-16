import React from 'react';
import { connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, TextInput, Linking, Animated, LayoutAnimation, Platform,
} from 'react-native';
import {
  Menu, MenuOptions, MenuOption, MenuTrigger, renderers, withMenuContext,
} from 'react-native-popup-menu';
import Svg, { SvgXml, Path } from 'react-native-svg'
import jdenticon from 'jdenticon';

import {
  signIn, signOut, updatePopup, addLink, updateSearchString,
  updateBulkEdit,
} from '../actions';
import {
  DOMAIN_NAME,
  ADD_POPUP, PROFILE_POPUP, SETTINGS_POPUP,
  SHOW_BLANK, SHOW_SIGN_IN, SHOW_COMMANDS,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
  MD_WIDTH,
} from '../types/const';
import { validateUrl, isEqual } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { withSafeAreaContext, getTopBarSizes } from '.';
import GracefulImage from './GracefulImage';

import ListName from './ListName';
import StatusPopup from './StatusPopup';
import TopBarBulkEditCommands from './TopBarBulkEditCommands';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

class TopBar extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    if (props.userImage) {
      this.userImage = (
        <GracefulImage style={tailwind('w-full h-full')} source={cache('TB_userImage', { uri: props.userImage }, props.userImage)} />
      );
      this.profileBtnStyleClasses = 'rounded-full';
    } else {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = (
        <SvgXml width={28} height={28} xml={svgString} />
      );
      this.profileBtnStyleClasses = 'rounded-lg';
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {

    if (
      this.props.rightPane !== nextProps.rightPane ||
      this.props.isListNameShown !== nextProps.isListNameShown ||
      this.props.scrollY !== nextProps.scrollY ||
      this.props.username !== nextProps.username ||
      this.props.userImage !== nextProps.userImage ||
      this.props.searchString !== nextProps.searchString ||
      this.props.isBulkEditing !== nextProps.isBulkEditing ||
      this.props.safeAreaWidth !== nextProps.safeAreaWidth ||
      !isEqual(this.state, nextState)
    ) {
      return true;
    }

    return false;
  }

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;
    this.props.updatePopup(ADD_POPUP, true);
  }

  onAddInputChange = (e) => {
    this.setState({ url: e.nativeEvent.text, msg: '', isAskingConfirm: false });
  }

  onAddInputKeyPress = () => {
    this.onAddOkBtnClick();
  }

  onAddOkBtnClick = () => {
    if (!this.state.isAskingConfirm) {
      const urlValidatedResult = validateUrl(this.state.url);
      if (urlValidatedResult === NO_URL) {
        this.setState({ msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false });
        return;
      }
      if (urlValidatedResult === ASK_CONFIRM_URL) {
        this.setState({ msg: URL_MSGS[urlValidatedResult], isAskingConfirm: true });
        return;
      }
    }

    const { safeAreaWidth } = this.props;
    const animConfig = cardItemAnimConfig(safeAreaWidth);

    LayoutAnimation.configureNext(animConfig);
    this.props.addLink(this.state.url, null);
    this.props.ctx.menuActions.closeMenu();
    this.props.updatePopup(ADD_POPUP, false);
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  onSearchInputChange = (e) => {
    this.props.updateSearchString(e.nativeEvent.text);
  }

  onSearchClearBtnClick = () => {
    this.props.updateSearchString('');
  }

  onBulkEditBtnClick = () => {
    this.props.updateBulkEdit(true);
  }

  onProfileBtnClick = () => {
    if (this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSettingsBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.updatePopup(SETTINGS_POPUP, true);
  }

  onSignOutBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut();
  }

  onSignInBtnClick = () => {
    this.props.signIn();
  }

  renderAddPopup() {
    const { safeAreaWidth } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    return (
      <View style={tailwind('px-4 pt-6 pb-6 w-72 md:w-96', safeAreaWidth)}>
        <View style={tailwind('flex-row justify-start items-center')}>
          <Text style={tailwind('flex-none text-sm font-medium text-gray-700')}>Url:</Text>
          {/* onKeyPress event for Enter key only if there is multiline TextInput */}
          <TextInput onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind('ml-3 px-4 py-2 flex-1 bg-white text-base text-gray-900 font-normal border border-gray-500 rounded-full')} placeholder="https://" value={url} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} autoFocus />
        </View>
        {msg === '' ? <View style={tailwind('w-full h-3')}></View> : <Text style={tailwind('pt-3 text-base text-red-500 font-normal')}>{msg}</Text>}
        <View style={tailwind('pt-3 flex-row justify-start items-center')}>
          <TouchableOpacity onPress={this.onAddOkBtnClick} style={tailwind('px-5 py-2 justify-center items-center bg-gray-800 rounded-full shadow-sm')}>
            <Text style={tailwind('text-base text-white font-medium')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.ctx.menuActions.closeMenu()} style={tailwind('ml-4 rounded-sm')}>
            <Text style={tailwind('text-base text-gray-700 font-normal')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderProfilePopup() {
    return (
      <View style={tailwind('py-2 w-32')}>
        <MenuOption onSelect={this.onSettingsBtnClick} customStyles={cache('TB_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2 pl-4 text-base text-gray-800 font-normal')}>Settings</Text>
        </MenuOption>
        <MenuOption onSelect={() => Linking.openURL(DOMAIN_NAME + '/#support')} customStyles={cache('TB_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2 pl-4 text-base text-gray-800 font-normal')}>Support</Text>
        </MenuOption>
        <MenuOption onSelect={this.onSignOutBtnClick} customStyles={cache('TB_profileMenuOption', { optionWrapper: { padding: 0 } })}>
          <Text style={tailwind('py-2 pl-4 text-base text-gray-800 font-normal')}>Sign out</Text>
        </MenuOption>
      </View>
    );
  }

  _renderCommands() {

    const { searchString, safeAreaWidth } = this.props;

    const anchorClasses = Platform.select({ ios: 'z-10', android: 'shadow-xl' })
    const searchClearBtnClasses = searchString.length === 0 ? 'hidden relative' : 'flex absolute';

    return (
      <View style={tailwind('flex-row justify-end items-center')}>
        <Menu renderer={renderers.Popover} rendererProps={cache('TB_commandMenuRendererProps', { preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) })} onOpen={this.onAddBtnClick} onClose={this.onAddCancelBtnClick}>
          <MenuTrigger>
            <View style={cache('TB_addTriggerView', [tailwind('flex-row justify-center items-center bg-white border border-gray-700 rounded-full shadow-sm'), { height: 32, paddingLeft: 10, paddingRight: 12 }])}>
              <Svg style={tailwind('text-base text-gray-700 font-normal')} width={12} height={11} viewBox="0 0 16 14" stroke="currentColor" fill="none">
                <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={tailwind('ml-1 text-base text-gray-700 font-normal')}>Add</Text>
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={cache('TB_commandMenuOptions', { optionsContainer: tailwind('bg-white rounded-lg shadow-xl') })}>
            {this.renderAddPopup()}
          </MenuOptions>
        </Menu>
        <View style={tailwind('ml-4 w-48 lg:w-56', safeAreaWidth)}>
          <TextInput onChange={this.onSearchInputChange} style={tailwind('py-1 pl-10 pr-6 w-full bg-gray-300 text-base text-gray-900 font-normal border border-transparent rounded-full')} placeholder="Search" placeholderTextColor="rgba(113, 128, 150, 1)" value={searchString} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} />
          {/* A bug display: none doesn't work with absolute, need to change to relative. https://github.com/facebook/react-native/issues/18415 */}
          <TouchableOpacity onPress={this.onSearchClearBtnClick} style={tailwind(`pr-2 ${searchClearBtnClasses} inset-y-0 right-0 justify-center items-center`)}>
            <Svg style={tailwind('text-base text-gray-600 font-normal rounded-full')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </Svg>
          </TouchableOpacity>
          <View style={tailwind('pl-3 absolute inset-y-0 left-0 justify-center')}>
            <Svg style={tailwind('text-base text-gray-600 font-normal')} width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
              <Path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            </Svg>
          </View>
        </View>
        <TouchableOpacity onPress={this.onBulkEditBtnClick} style={tailwind('ml-4')}>
          <View style={cache('TB_bulkEditBtnView', [tailwind('px-3 py-1 flex-row justify-center items-center bg-white border border-gray-600 rounded-full shadow-sm'), { height: 32, paddingLeft: 10, paddingRight: 12 }])}>
            <Svg style={tailwind('text-base text-gray-600 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
              <Path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
            </Svg>
            <Text style={tailwind('ml-1 text-base text-gray-700 font-normal')}>Select</Text>
          </View>
        </TouchableOpacity>
        <Menu renderer={renderers.Popover} rendererProps={cache('TB_commandMenuRendererProps', { preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) })} onOpen={this.onProfileBtnClick} onClose={this.onProfileCancelBtnClick}>
          <MenuTrigger>
            <View style={tailwind('ml-4')}>
              <View style={tailwind(`justify-center items-center h-8 w-8 bg-white overflow-hidden border-2 border-gray-200 ${this.profileBtnStyleClasses}`)}>
                {this.userImage}
              </View>
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={cache('TB_commandMenuOptions', { optionsContainer: tailwind('bg-white rounded-lg shadow-xl') })}>
            {this.renderProfilePopup()}
          </MenuOptions>
        </Menu>
      </View >
    );
  }

  renderSignInBtn() {
    return (
      <TouchableOpacity onPress={this.onSignInBtnClick} style={tailwind('justify-center items-center h-14')}>
        <View style={cache('TB_signInBtnView', [tailwind('bg-white border border-gray-700 rounded-full shadow-sm'), { paddingTop: 5, paddingBottom: 5, paddingLeft: 11, paddingRight: 11 }])}>
          <Text style={tailwind('text-base text-gray-700 font-normal')}>Sign in</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderListName() {

    const { scrollY, safeAreaWidth } = this.props;
    const {
      topBarHeight, headerHeight, listNameHeight, headerListNameSpace,
      laidStatusPopupHeight, laidListNameCommandsHeight, laidTopBarHeight,
      listNameDistanceX, listNameDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = (laidListNameCommandsHeight - listNameHeight) / 2;
    const space2 = laidStatusPopupHeight;
    const space3 = headerHeight;

    // Start from MD width, align baseline with Brace logo instead of align center
    let space4 = (headerHeight - listNameHeight) / 2;
    if (safeAreaWidth >= MD_WIDTH) space4 += 4;

    const changingTranslateX = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [0, listNameDistanceX],
      extrapolate: 'clamp'
    });
    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [
        space1 * -1 - space2 + headerListNameSpace + (laidTopBarHeight - topBarHeight),
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - headerHeight)
      ],
      extrapolate: 'clamp'
    });

    const listNameStyle = {
      transform: [{ translateX: changingTranslateX }, { translateY: changingTranslateY }]
    };

    return (
      <Animated.View style={listNameStyle}>
        <ListName fetched={this.props.fetched} />
      </Animated.View>
    );
  };

  renderStatusPopup() {

    const { scrollY, safeAreaWidth } = this.props;
    const {
      topBarHeight, headerHeight, listNameHeight, statusPopupHeight, headerListNameSpace,
      laidStatusPopupHeight, laidTopBarHeight,
      statusPopupDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = (laidStatusPopupHeight - statusPopupHeight) / 2;
    const space2 = listNameHeight - statusPopupHeight;

    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, statusPopupDistanceY],
      outputRange: [
        space1 * -1 + headerListNameSpace + space2 + (laidTopBarHeight - topBarHeight),
        space1 * -1 + headerListNameSpace + space2 + (laidTopBarHeight - headerHeight) - statusPopupDistanceY
      ],
      extrapolate: 'clamp'
    });
    const changingOpacity = scrollY.interpolate({
      inputRange: [0, statusPopupDistanceY],
      outputRange: [1.0, 0.0],
      extrapolate: 'clamp'
    });

    const statusPopupStyle = {
      transform: [{ translateY: changingTranslateY }],
      opacity: changingOpacity,
    };
    return (
      <Animated.View style={statusPopupStyle}>
        <StatusPopup />
      </Animated.View>
    );
  }

  renderCommands() {

    const { scrollY, safeAreaWidth, isBulkEditing } = this.props;
    const {
      topBarHeight, headerHeight, commandsHeight,
      laidStatusPopupHeight, laidListNameCommandsHeight, laidTopBarHeight,
      listNameDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const space1 = (laidListNameCommandsHeight - commandsHeight) / 2;
    const space2 = laidStatusPopupHeight;
    const space3 = headerHeight;
    const space4 = (headerHeight - commandsHeight) / 2;

    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, listNameDistanceY],
      outputRange: [
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - topBarHeight),
        space1 * -1 - space2 - space3 + space4 + (laidTopBarHeight - headerHeight)
      ],
      extrapolate: 'clamp'
    });

    const commandsStyle = { transform: [{ translateY: changingTranslateY }] };
    return (
      <Animated.View style={commandsStyle}>
        {isBulkEditing ? <TopBarBulkEditCommands /> : this._renderCommands()}
      </Animated.View>
    )
  }

  render() {

    const rightPaneProp = this.props.rightPane;

    let rightPane;
    if (rightPaneProp === SHOW_BLANK) rightPane = null;
    else if (rightPaneProp === SHOW_SIGN_IN) rightPane = this.renderSignInBtn();
    else if (rightPaneProp === SHOW_COMMANDS) rightPane = null;
    else throw new Error(`Invalid rightPane: ${rightPaneProp}`);

    const { isListNameShown, scrollY, safeAreaWidth, insets } = this.props;

    let topBarStyleClasses, topBarStyle, headerStyle, headerBorderStyle, listNamePane;
    if (isListNameShown) {

      const {
        topBarHeight, headerHeight,
        laidTopBarHeight, laidListNameCommandsHeight,
        listNameDistanceY,
      } = getTopBarSizes(safeAreaWidth);

      const changingTopBarTranslateY = scrollY.interpolate({
        inputRange: [0, listNameDistanceY],
        outputRange: [
          topBarHeight - laidTopBarHeight,
          headerHeight - laidTopBarHeight
        ],
        extrapolate: 'clamp'
      });
      const changingHeaderTranslateY = scrollY.interpolate({
        inputRange: [0, listNameDistanceY],
        outputRange: [
          laidTopBarHeight - topBarHeight,
          laidTopBarHeight - headerHeight
        ],
        extrapolate: 'clamp'
      });
      const changingHeaderBorderOpacity = scrollY.interpolate({
        inputRange: [0, listNameDistanceY - 1, listNameDistanceY],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp'
      });

      topBarStyleClasses = 'absolute inset-x-0 top-0 bg-white border-gray-300 z-30';
      topBarStyle = { transform: [{ translateY: changingTopBarTranslateY }] };
      headerStyle = { transform: [{ translateY: changingHeaderTranslateY }] };
      headerBorderStyle = { opacity: changingHeaderBorderOpacity };

      listNamePane = (
        <React.Fragment>
          <View style={tailwind('px-4 flex-row justify-end items-center h-7 md:px-6 lg:px-8', safeAreaWidth)}>
            {this.renderStatusPopup()}
          </View>
          <View style={[tailwind('px-4 flex-row justify-between items-center md:px-6 lg:px-8', safeAreaWidth), { height: laidListNameCommandsHeight }]}>
            {this.renderListName()}
            {rightPaneProp === SHOW_COMMANDS && this.renderCommands()}
          </View>
        </React.Fragment>
      );

      topBarStyle['marginLeft'] = insets.left;
      topBarStyle['marginRight'] = insets.right;
      headerStyle['marginTop'] = insets.top;
    } else {
      topBarStyleClasses = '';
      topBarStyle = {};
      headerStyle = {};
      headerBorderStyle = { opacity: 0 };
      listNamePane = null;
    }

    return (
      <Animated.View style={[tailwind(`items-center w-full ${topBarStyleClasses}`), topBarStyle]}>
        <View style={tailwind('w-full max-w-6xl')}>
          <Animated.View style={headerStyle}>
            <View style={tailwind('px-4 flex-row justify-between items-center h-14 md:px-6 lg:px-8', safeAreaWidth)}>
              <View>
                <SvgXml style={tailwind('md:hidden', safeAreaWidth)} width={28.36} height={32} xml={shortLogo} />
                <SvgXml style={tailwind('hidden md:flex', safeAreaWidth)} width={109.63} height={24} xml={fullLogo} />
              </View>
              {rightPane}
            </View>
            <Animated.View style={[tailwind('w-full h-px bg-gray-300'), headerBorderStyle]}></Animated.View>
          </Animated.View>
          {listNamePane}
        </View>
      </Animated.View >
    );
  }
}

TopBar.defaultProps = {
  isListNameShown: false,
  fetched: null,
  scrollY: null,
};

const mapStateToProps = (state, props) => {
  return {
    username: state.user.username,
    userImage: state.user.image,
    searchString: state.display.searchString,
    isAddPopupShown: state.display.isAddPopupShown,
    isProfilePopupShown: state.display.isProfilePopupShown,
    isBulkEditing: state.display.isBulkEditing,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  signIn, signOut, updatePopup, addLink, updateSearchString, updateBulkEdit,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(withMenuContext(TopBar)));
