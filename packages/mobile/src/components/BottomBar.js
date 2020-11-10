import React from 'react';
import { connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, TextInput,
  Animated, Keyboard, BackHandler, Linking, LayoutAnimation,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { SvgXml, Path } from 'react-native-svg';
import jdenticon from 'jdenticon';
import Modal from 'react-native-modal';

import {
  signOut, updatePopup, addLink, updateSearchString,
  updateBulkEdit,
} from '../actions';
import {
  DOMAIN_NAME,
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP, SETTINGS_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
  BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT, MODAL_SUPPORTED_ORIENTATIONS,
} from '../types/const';
import { getPopupLink } from '../selectors';
import { validateUrl, isEqual, toPx } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { withSafeAreaContext } from '.';
import GracefulImage from './GracefulImage';

import BottomBarBulkEditCommands from './BottomBarBulkEditCommands';

const BOTTOM_BAR_DURATION = 225;

class BottomBar extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      url: '',
      msg: '',
      isAskingConfirm: false,
      isKeyboardShown: false,
    };

    this.addInput = React.createRef();
    this.searchInput = React.createRef();

    if (props.userImage) {
      this.userImage = (
        <GracefulImage style={tailwind('w-full h-full')} source={{ uri: props.userImage }} />
      );
      this.profileBtnStyleClasses = 'rounded-full';
    } else {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = (
        <SvgXml width={36} height={36} xml={svgString} />
      );
      this.profileBtnStyleClasses = 'rounded-lg';
    }

    this.bottomBarTranslateY = new Animated.Value(0);
    this.searchPopupTranslateY = new Animated.Value(toPx(SEARCH_POPUP_HEIGHT));

    this.searchPopupBackHandler = null;

    this.prevInsetsBottom = null;
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {
      this.setState({ isKeyboardShown: true });
    });
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      this.setState({ isKeyboardShown: false });
    });
  }

  componentDidUpdate(prevProps, prevState) {

    const { isShown, isSearchPopupShown, insets } = this.props;
    const duration = isShown ? 0 : BOTTOM_BAR_DURATION;

    if (prevProps.isShown != isShown) {

      const totalHeight = toPx(BOTTOM_BAR_HEIGHT) + insets.bottom;
      const toValue = isShown ? 0 : totalHeight;

      Animated.timing(this.bottomBarTranslateY, {
        toValue: toValue,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }

    if (
      prevProps.isShown !== isShown ||
      prevProps.isSearchPopupShown !== isSearchPopupShown ||
      prevState.isKeyboardShown !== this.state.isKeyboardShown
    ) {

      if (!isShown && isSearchPopupShown) throw new Error(`Illegal isShown: ${isShown} and isSearchPopupShown: ${isSearchPopupShown}`);

      let toValue;
      if (!isShown) {
        toValue = toPx(BOTTOM_BAR_HEIGHT) + toPx(SEARCH_POPUP_HEIGHT) + insets.bottom;
      } else {
        if (!isSearchPopupShown) toValue = toPx(SEARCH_POPUP_HEIGHT);
        else {
          // isKeyboardShown will be true only on iOS
          //   as the keyboard events: willShow and willHide are only supported in iOS.
          if (!this.state.isKeyboardShown) toValue = 0;
          else toValue = toPx(BOTTOM_BAR_HEIGHT);
        }
      }

      Animated.timing(this.searchPopupTranslateY, {
        toValue: toValue,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (
        this.state.url !== '' ||
        this.state.msg !== '' ||
        this.state.isAskingConfirm !== false
      ) {
        this.setState({ url: '', msg: '', isAskingConfirm: false, });
      }
    }

    this.prevInsetsBottom = this.props.insets.bottom;
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();

    if (this.searchPopupBackHandler) {
      this.searchPopupBackHandler.remove();
      this.searchPopupBackHandler = null;
    }
  }

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;
    this.props.updatePopup(ADD_POPUP, true);
  }

  onAddPopupShow = () => setTimeout(() => this.addInput.current.focus(), 1)

  onAddPopupHide = () => this.addInput.current.blur()

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
    this.props.updatePopup(ADD_POPUP, false);
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  onSearchBtnClick = () => {
    this.searchInput.current.focus();

    if (this.props.isSearchPopupShown) return;
    this.props.updatePopup(SEARCH_POPUP, true);

    if (this.searchPopupBackHandler) return;
    this.searchPopupBackHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!this.props.isSearchPopupShown) return false;
        if (this.props.popupLink) return false;

        this.onSearchCancelBtnClick();
        return true;
      }
    );
  }

  onSearchInputChange = (e) => {
    this.props.updateSearchString(e.nativeEvent.text);
  }

  onSearchClearBtnClick = () => {
    this.props.updateSearchString('');
    this.searchInput.current.focus();
  }

  onSearchCancelBtnClick = () => {
    this.props.updateSearchString('');
    this.props.updatePopup(SEARCH_POPUP, false);

    Keyboard.dismiss();

    if (this.searchPopupBackHandler) {
      this.searchPopupBackHandler.remove();
      this.searchPopupBackHandler = null;
    }
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
    // No need to update it, will get already unmount
    //this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()
  }

  renderAddPopup() {

    const { isAddPopupShown, windowWidth, windowHeight } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    return (
      <Modal isVisible={isAddPopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onAddCancelBtnClick} onBackButtonPress={this.onAddCancelBtnClick} onModalShow={this.onAddPopupShow} onModalWillHide={this.onAddPopupHide} style={tailwind('justify-end m-0')} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true} avoidKeyboard={Platform.OS === 'ios' ? true : false}>
        <View style={tailwind('px-4 pt-6 pb-6 w-full bg-white border border-gray-200 rounded-t-lg shadow-xl')}>
          <View style={tailwind('flex-row justify-start items-center')}>
            <Text style={tailwind('flex-none text-sm text-gray-700 font-medium')}>Url:</Text>
            {/* onKeyPress event for Enter key only if there is multiline TextInput */}
            <TextInput ref={this.addInput} onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind('ml-3 px-4 py-2 flex-1 bg-white text-base text-gray-900 font-normal border border-gray-500 rounded-full')} placeholder="https://" value={url} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} />
          </View>
          {msg === '' ? <View style={tailwind('w-full h-3')}></View> : <Text style={tailwind('pt-3 text-base text-red-500 font-normal')}>{msg}</Text>}
          <View style={tailwind('pt-3 flex-row justify-start items-center')}>
            <TouchableOpacity onPress={this.onAddOkBtnClick} style={tailwind('px-5 py-2 justify-center items-center bg-gray-800 rounded-full shadow-sm')}>
              <Text style={tailwind('text-base text-white font-medium')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onAddCancelBtnClick} style={tailwind('ml-4 rounded-sm')}>
              <Text style={tailwind('text-base text-gray-700 font-normal')}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  renderSearchPopup() {

    const { searchString, insets } = this.props;

    if (!styles.searchPopup || this.prevInsetsBottom !== insets.bottom) {
      // Only transition when moving with BottomBar
      //   but when show/hide this search popup, no need animation
      //   as keyboard is already animated.
      const style = {
        transform: [{ translateY: this.searchPopupTranslateY }],
      };
      style.bottom = toPx(BOTTOM_BAR_HEIGHT);
      // On iOS, there is a KeyboardAvoidingView which is already in SafeAreaView.
      if (Platform.OS !== 'ios') style.bottom += insets.bottom;

      styles.searchPopup = [tailwind('px-2 py-2 absolute inset-x-0 flex-row justify-between items-center bg-white border border-gray-200 z-10'), style];
    }

    const searchClearBtnClasses = searchString.length === 0 ? 'hidden relative' : 'flex absolute';

    const searchPopup = (
      <Animated.View style={styles.searchPopup}>
        <View style={tailwind('flex-grow flex-shrink')}>
          <TextInput ref={this.searchInput} onChange={this.onSearchInputChange} style={tailwind('pl-4 pr-6 py-1 w-full bg-white text-base text-gray-900 font-normal border border-gray-500 rounded-full')} placeholder="Search" value={searchString} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} />
          {/* A bug display: none doesn't work with absolute, need to change to relative. https://github.com/facebook/react-native/issues/18415 */}
          <TouchableOpacity onPress={this.onSearchClearBtnClick} style={tailwind(`pr-2 ${searchClearBtnClasses} inset-y-0 right-0 justify-center items-center`)}>
            <Svg style={tailwind('text-base text-gray-600 font-normal rounded-full')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </Svg>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={this.onSearchCancelBtnClick} style={tailwind('ml-2 flex-grow-0 flex-shrink-0 justify-center items-center h-10 rounded-lg')}>
          <Text style={tailwind('text-base text-gray-700 font-normal')}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    );

    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView behavior="position">
          {searchPopup}
        </KeyboardAvoidingView>
      );
    }

    return searchPopup;
  }

  renderProfilePopup() {

    const { isProfilePopupShown, windowWidth, windowHeight } = this.props;

    return (
      <Modal isVisible={isProfilePopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onProfileCancelBtnClick} onBackButtonPress={this.onProfileCancelBtnClick} style={tailwind('justify-end m-0')} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="slideInUp" animationInTiming={200} animationOut="slideOutDown" animationOutTiming={200} useNativeDriver={true}>
        <View style={tailwind('py-4 w-full bg-white border border-gray-200 rounded-t-lg shadow-xl')}>
          <TouchableOpacity onPress={this.onSettingsBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/#support')} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSignOutBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-base text-gray-800 font-normal')}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  render() {

    const { isBulkEditing, insets } = this.props;

    if (isBulkEditing) return <BottomBarBulkEditCommands />;

    if (!styles.bottomBar || this.prevInsetsBottom !== insets.bottom) {
      const style = {
        height: toPx(BOTTOM_BAR_HEIGHT) + insets.bottom,
        transform: [{ translateY: this.bottomBarTranslateY }],
      };

      styles.bottomBar = [tailwind('absolute inset-x-0 bottom-0 bg-white border-t border-gray-300 z-30'), style]
    }

    if (!styles.innerBottomBar) {
      const innerStyle = {
        height: toPx(BOTTOM_BAR_HEIGHT),
      };
      styles.innerBottomBar = [tailwind('relative flex-row justify-evenly w-full overflow-hidden'), innerStyle];
    }

    if (!styles.addSvg) styles.addSvg = [tailwind('text-base text-gray-600 font-normal'), { marginBottom: 2 }];
    if (!styles.addText) styles.addText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 2 }];

    if (!styles.searchText) styles.searchText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 2 }]

    if (!styles.selectText) styles.selectText = [tailwind('text-xs text-gray-700 font-normal leading-4'), { marginTop: 2 }];

    return (
      <React.Fragment>
        <Animated.View style={styles.bottomBar}>
          <View style={styles.innerBottomBar}>
            <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onAddBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center w-6 h-6')}>
                  <Svg style={styles.addSvg} width={18} height={17} viewBox="0 0 13 12" stroke="currentColor">
                    <Path d="M6.5 1V10.4286M1 5.67609H12" strokeWidth="1.57143" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onSearchBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center w-6 h-6')}>
                  <Svg style={tailwind('text-base text-gray-600 font-normal')} width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
                    <Path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                  </Svg>
                </View>
                <Text style={styles.searchText}>Search</Text>
              </TouchableOpacity>
            </View>
            <View style={tailwind('p-1 flex-1')}>
              <TouchableOpacity onPress={this.onBulkEditBtnClick} style={tailwind('justify-center items-center w-full h-full')}>
                <View style={tailwind('justify-center items-center w-6 h-6')}>
                  <Svg style={tailwind('text-base text-gray-600 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z" />
                  </Svg>
                </View>
                <Text style={styles.selectText}>Select</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={this.onProfileBtnClick} style={tailwind('flex-1 justify-center items-center')}>
              <View style={tailwind(`justify-center items-center h-10 w-10 bg-white overflow-hidden border-2 border-gray-200 ${this.profileBtnStyleClasses}`)}>
                {this.userImage}
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
        {this.renderAddPopup()}
        {this.renderSearchPopup()}
        {this.renderProfilePopup()}
      </React.Fragment>
    );
  }
}

const styles = {};

const mapStateToProps = (state, props) => {

  const popupLink = getPopupLink(state);

  return {
    username: state.user.username,
    userImage: state.user.image,
    searchString: state.display.searchString,
    isShown: popupLink === null,
    isAddPopupShown: state.display.isAddPopupShown,
    isSearchPopupShown: state.display.isSearchPopupShown,
    isProfilePopupShown: state.display.isProfilePopupShown,
    popupLink: popupLink,
    isBulkEditing: state.display.isBulkEditing,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, addLink, updateSearchString, updateBulkEdit,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(BottomBar));
