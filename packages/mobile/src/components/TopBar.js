import React from 'react';
import { connect } from 'react-redux';
import {
  View, TouchableOpacity, Linking, Animated, LayoutAnimation, Platform,
} from 'react-native';
import {
  Menu, MenuOptions, MenuOption, MenuTrigger, renderers, withMenuContext,
} from 'react-native-popup-menu';
import Svg, { SvgXml, Path } from 'react-native-svg'
import jdenticon from 'jdenticon';

import { signIn, signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  DOMAIN_NAME,
  ADD_POPUP, PROFILE_POPUP,
  SHOW_BLANK, SHOW_SIGN_IN, SHOW_COMMANDS,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
  TOP_HEADER_HEIGHT, TOP_LIST_NAME_HEIGHT,
  TOP_HEADER_LIST_NAME_SPACE, TOP_HEADER_LIST_NAME_SPACE_MD,
  TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD,
  MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { validateUrl, isEqual, toPx } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { InterText as Text, InterTextInput as TextInput, withSafeAreaContext } from '.';
import GracefulImage from './GracefulImage';

import ListName from './ListName';
import StatusPopup from './StatusPopup';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

/* header: 56, border: 1, status: 28, list name + commands: 109 */
const LAID_TOP_BAR_HEIGHT = 56 + 1 + 28 + 109;

const LIST_NAME_DISTANCE_X = toPx('3rem');
const LIST_NAME_DISTANCE_X_MD = toPx('9rem');

const LIST_NAME_START_Y = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE);
const LIST_NAME_START_Y_MD = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE_MD);

const LIST_NAME_END_Y = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
const LIST_NAME_END_Y_MD = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2) + 6;

const LIST_NAME_DISTANCE_Y = Math.abs(LIST_NAME_END_Y - LIST_NAME_START_Y);
const LIST_NAME_DISTANCE_Y_MD = Math.abs(LIST_NAME_END_Y_MD - LIST_NAME_START_Y_MD);

const STATUS_POPUP_DISTANCE_Y = 36;

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
        <GracefulImage style={tailwind('w-full h-full')} source={{ uri: props.userImage }} />
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
    this.props.addLink(this.state.url, true);
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

  onProfileBtnClick = () => {
    if (this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSignOutBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()
  }

  renderAddPopup() {
    const { safeAreaWidth } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    return (
      <View style={tailwind('px-4 pt-6 pb-6 w-72 md:w-96', safeAreaWidth)}>
        {/* onKeyPress event for Enter key only if there is multiline TextInput */}
        <TextInput onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind('px-4 py-2 w-full bg-white text-gray-900 border border-gray-600 rounded-full')} placeholder="https://" value={url} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} autoFocus />
        {msg === '' ? <View style={tailwind('w-full h-3')}></View> : <Text style={tailwind('pt-3 text-red-500')}>{msg}</Text>}
        <View style={tailwind('pt-3 flex-row justify-start items-center')}>
          <TouchableOpacity onPress={this.onAddOkBtnClick} style={tailwind('px-5 py-2 justify-center items-center bg-gray-900 rounded-full shadow-sm')}>
            <Text style={tailwind('text-base text-white font-medium')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.ctx.menuActions.closeMenu()} style={tailwind('ml-2 rounded-sm')}>
            <Text style={tailwind('text-base text-gray-900 underline')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderProfilePopup() {
    return (
      <View style={tailwind('py-2 w-32')}>
        <MenuOption onSelect={() => Linking.openURL(DOMAIN_NAME + '/#support')} customStyles={{ optionWrapper: { padding: 0 } }}>
          <Text style={tailwind('py-2 pl-4 text-gray-800')}>Support</Text>
        </MenuOption>
        <MenuOption onSelect={this.onSignOutBtnClick} customStyles={{ optionWrapper: { padding: 0 } }}>
          <Text style={tailwind('py-2 pl-4 text-gray-800')}>Sign out</Text>
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
        <Menu renderer={renderers.Popover} rendererProps={{ preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) }} onOpen={this.onAddBtnClick} onClose={this.onAddCancelBtnClick}>
          <MenuTrigger>
            <View style={tailwind('justify-center items-center w-8 h-8')}>
              <View style={tailwind('justify-center items-center w-8 h-7 bg-gray-900 rounded-lg shadow-sm')}>
                <Svg style={tailwind('text-white')} width={16} height={14} viewBox="0 0 16 14" stroke="currentColor" fill="none">
                  <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: tailwind('bg-white rounded-lg shadow-xl') }}>
            {this.renderAddPopup()}
          </MenuOptions>
        </Menu>
        <View style={tailwind('ml-4 w-48 lg:w-56', safeAreaWidth)}>
          <TextInput onChange={this.onSearchInputChange} style={tailwind('py-1 pl-10 pr-6 w-full bg-gray-200 text-gray-900 border border-transparent rounded-full')} placeholder="Search" value={searchString} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} />
          {/* A bug display: none doesn't work with absolute, need to change to relative. https://github.com/facebook/react-native/issues/18415 */}
          <TouchableOpacity onPress={this.onSearchClearBtnClick} style={tailwind(`pr-2 ${searchClearBtnClasses} inset-y-0 right-0 justify-center items-center`)}>
            <Svg style={tailwind('text-gray-600 rounded-full')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </Svg>
          </TouchableOpacity>
          <View style={tailwind('pl-3 absolute inset-y-0 left-0 justify-center')}>
            <Svg style={tailwind('text-gray-600')} width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
              <Path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            </Svg>
          </View>
        </View>
        <Menu renderer={renderers.Popover} rendererProps={{ preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) }} onOpen={this.onProfileBtnClick} onClose={this.onProfileCancelBtnClick}>
          <MenuTrigger>
            <View style={tailwind('ml-4')}>
              <View style={tailwind(`justify-center items-center h-8 w-8 bg-white overflow-hidden border-2 border-gray-200 ${this.profileBtnStyleClasses}`)}>
                {this.userImage}
              </View>
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: tailwind('bg-white rounded-lg shadow-xl') }}>
            {this.renderProfilePopup()}
          </MenuOptions>
        </Menu>
      </View >
    );
  }

  renderSignInBtn() {
    return (
      <TouchableOpacity onPress={() => this.props.signIn()} style={tailwind('justify-center items-center h-14')}>
        <View style={tailwind('px-3 py-1 bg-white border border-gray-700 rounded-full shadow-sm')}>
          <Text style={tailwind('text-base text-gray-700')}>Sign in</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderListName() {

    const { scrollY, safeAreaWidth } = this.props;

    const topBarHeight = toPx(safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD);
    const headerHeight = toPx(TOP_HEADER_HEIGHT);
    const space = toPx(safeAreaWidth < MD_WIDTH ? TOP_HEADER_LIST_NAME_SPACE : TOP_HEADER_LIST_NAME_SPACE_MD);

    const distanceX = safeAreaWidth < MD_WIDTH ? LIST_NAME_DISTANCE_X : LIST_NAME_DISTANCE_X_MD;
    const distanceY = safeAreaWidth < MD_WIDTH ? LIST_NAME_DISTANCE_Y : LIST_NAME_DISTANCE_Y_MD;

    const changingTranslateX = scrollY.interpolate({
      inputRange: [0, distanceY],
      outputRange: [0, distanceX],
      extrapolate: 'clamp'
    });
    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, distanceY],
      outputRange: [(109 - 28) / 2 * -1 - 28 + space + (LAID_TOP_BAR_HEIGHT - topBarHeight), (109 - 28) / 2 * -1 - 28 - 56 + (56 - 28) / 2 + (LAID_TOP_BAR_HEIGHT - headerHeight)],
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

    const topBarHeight = toPx(safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD);
    const headerHeight = toPx(TOP_HEADER_HEIGHT);
    const space = toPx(safeAreaWidth < MD_WIDTH ? TOP_HEADER_LIST_NAME_SPACE : TOP_HEADER_LIST_NAME_SPACE_MD);

    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, STATUS_POPUP_DISTANCE_Y],
      outputRange: [(28 - 24) / 2 * -1 + space + (28 - 24) + (LAID_TOP_BAR_HEIGHT - topBarHeight), (28 - 24) / 2 * -1 + space + (28 - 24) + (LAID_TOP_BAR_HEIGHT - headerHeight) - STATUS_POPUP_DISTANCE_Y],
      extrapolate: 'clamp'
    });
    const changingOpacity = scrollY.interpolate({
      inputRange: [0, STATUS_POPUP_DISTANCE_Y],
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

    const { scrollY, safeAreaWidth } = this.props;

    const topBarHeight = toPx(safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD);
    const headerHeight = toPx(TOP_HEADER_HEIGHT);
    const distanceY = safeAreaWidth < MD_WIDTH ? LIST_NAME_DISTANCE_Y : LIST_NAME_DISTANCE_Y_MD;

    const changingTranslateY = scrollY.interpolate({
      inputRange: [0, distanceY],
      outputRange: [(109 - 38) / 2 * -1 - 28 - 56 + (56 - 38) / 2 + (LAID_TOP_BAR_HEIGHT - topBarHeight), (109 - 38) / 2 * -1 - 28 - 56 + (56 - 38) / 2 + (LAID_TOP_BAR_HEIGHT - headerHeight)],
      extrapolate: 'clamp'
    });

    const commandsStyle = { transform: [{ translateY: changingTranslateY }] };
    return (
      <Animated.View style={commandsStyle}>
        {this._renderCommands()}
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

      const topBarHeight = toPx(safeAreaWidth < MD_WIDTH ? TOP_BAR_HEIGHT : TOP_BAR_HEIGHT_MD);
      const headerHeight = toPx(TOP_HEADER_HEIGHT);

      const distanceY = safeAreaWidth < MD_WIDTH ? LIST_NAME_DISTANCE_Y : LIST_NAME_DISTANCE_Y_MD;

      const changingTopBarTranslateY = scrollY.interpolate({
        inputRange: [0, distanceY],
        outputRange: [topBarHeight - LAID_TOP_BAR_HEIGHT, headerHeight - LAID_TOP_BAR_HEIGHT],
        extrapolate: 'clamp'
      });
      const changingHeaderTranslateY = scrollY.interpolate({
        inputRange: [0, distanceY],
        outputRange: [LAID_TOP_BAR_HEIGHT - topBarHeight, LAID_TOP_BAR_HEIGHT - headerHeight],
        extrapolate: 'clamp'
      });
      const changingHeaderBorderOpacity = scrollY.interpolate({
        inputRange: [0, distanceY - 1, distanceY],
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
          <View style={[tailwind('px-4 flex-row justify-between items-center md:px-6 lg:px-8', safeAreaWidth), { height: 108 }]}>
            {this.renderListName()}
            {rightPaneProp === SHOW_COMMANDS && this.renderCommands()}
          </View>
        </React.Fragment>
      );
    } else {
      topBarStyleClasses = '';
      topBarStyle = {};
      headerStyle = {};
      headerBorderStyle = { opacity: 1.0 };
      listNamePane = null;
    }

    headerStyle['marginTop'] = insets.top;

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
      </Animated.View>
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
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  signIn, signOut, updatePopup, addLink, updateSearchString,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(withMenuContext(TopBar)));
