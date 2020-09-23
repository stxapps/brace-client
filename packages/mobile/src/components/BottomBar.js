import React from 'react';
import { connect } from 'react-redux';
import {
  View, TouchableOpacity, Animated, Keyboard, BackHandler, Linking, LayoutAnimation,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { SvgXml, Path } from 'react-native-svg';
import jdenticon from 'jdenticon';
import Modal from 'react-native-modal';

import { signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  DOMAIN_NAME,
  ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
  BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
} from '../types/const';
import { getLinks } from '../selectors';
import { validateUrl, isEqual, toPx } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { InterText as Text, InterTextInput as TextInput, withSafeAreaContext } from '.';

const BOTTOM_BAR_DURATION = 225;

class BottomBar extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState, isKeyboardShown: false };

    this.addInput = React.createRef();
    this.searchInput = React.createRef();

    this.userImage = props.userImage;
    if (this.userImage === null) {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = svgString;
    }

    this.bottomBarTranslateY = new Animated.Value(0);
    this.searchPopupBottom = new Animated.Value(toPx(BAR_HEIGHT));

    this.searchPopupBackHandler = null;
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

    const duration = this.props.isShown ? 0 : BOTTOM_BAR_DURATION;

    if (prevProps.isShown != this.props.isShown) {

      const totalHeight = toPx(BAR_HEIGHT) + this.props.insets.bottom;
      const toValue = this.props.isShown ? 0 : totalHeight;

      Animated.timing(this.bottomBarTranslateY, {
        toValue: toValue,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }

    if (prevProps.isShown != this.props.isShown || prevState.isKeyboardShown !== this.state.isKeyboardShown) {

      const bottom = this.props.isShown ? toPx(BAR_HEIGHT) : 0 - this.props.insets.bottom;
      const toValue = this.state.isKeyboardShown ? 0 : bottom;

      Animated.timing(this.searchPopupBottom, {
        toValue: toValue,
        duration: duration,
        useNativeDriver: false,
      }).start();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
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

    const { windowWidth } = this.props;
    const animConfig = cardItemAnimConfig(windowWidth);

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

  onProfileBtnClick = () => {
    if (this.props.isProfilePopupShown) return;
    this.props.updatePopup(PROFILE_POPUP, true);
  }

  onProfileCancelBtnClick = () => {
    this.props.updatePopup(PROFILE_POPUP, false);
  }

  onSignOutBtnClick = () => {
    // No need to update it, will get already unmount
    // this.props.updatePopup(PROFILE_POPUP, false);
    this.props.signOut()
  }

  renderAddPopup() {

    const { isAddPopupShown, windowWidth, windowHeight } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    return (
      <Modal isVisible={isAddPopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onAddCancelBtnClick} onBackButtonPress={this.onAddCancelBtnClick} onModalShow={() => setTimeout(() => this.addInput.current.focus(), 1)} onModalWillHide={() => this.addInput.current.blur()} style={tailwind('justify-end m-0')} supportedOrientations={['portrait', 'landscape']} backdropOpacity={0.25} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true} avoidKeyboard={Platform.OS === 'ios' ? true : false}>
        <View style={tailwind('px-4 pt-6 pb-6 w-full bg-white border border-gray-200 rounded-t-lg shadow-xl')}>
          {/* onKeyPress event for Enter key only if there is multiline TextInput */}
          <TextInput ref={this.addInput} onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind('px-4 py-2 w-full bg-white text-gray-900 border border-gray-600 rounded-full')} placeholder="https://" value={url} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} />
          {msg === '' ? <View style={tailwind('w-full h-3')}></View> : <Text style={tailwind('pt-3 text-red-500')}>{msg}</Text>}
          <View style={tailwind('pt-3 flex-row justify-start items-center')}>
            <TouchableOpacity onPress={this.onAddOkBtnClick} style={tailwind('px-5 py-2 justify-center items-center bg-gray-900 rounded-full shadow-sm')}>
              <Text style={tailwind('text-base text-white font-medium')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onAddCancelBtnClick} style={tailwind('ml-2 rounded-sm')}>
              <Text style={tailwind('text-base text-gray-900 underline')}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  renderSearchPopup() {

    const { isSearchPopupShown, searchString } = this.props;

    // Only transition when moving with BottomBar
    //   but when show/hide this search popup, no need animation
    //   as keyboard is already animated.
    const style = {
      bottom: this.searchPopupBottom,
    };
    if (!isSearchPopupShown) style.transform = [{ translateY: toPx(SEARCH_POPUP_HEIGHT) }];

    const searchClearBtnClasses = searchString.length === 0 ? 'hidden relative' : 'flex absolute';

    const searchPopup = (
      <Animated.View style={[tailwind('px-2 py-2 absolute inset-x-0 flex-row justify-between items-center bg-white border border-gray-200 z-10'), style]}>
        <View style={tailwind('flex-grow flex-shrink')}>
          <TextInput ref={this.searchInput} onChange={this.onSearchInputChange} style={tailwind('pl-4 pr-6 py-1 w-full bg-white text-gray-900 border border-gray-600 rounded-full')} placeholder="Search" value={searchString} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} />
          {/* A bug display: none doesn't work with absolute, need to change to relative. https://github.com/facebook/react-native/issues/18415 */}
          <TouchableOpacity onPress={this.onSearchClearBtnClick} style={tailwind(`pr-2 ${searchClearBtnClasses} inset-y-0 right-0 justify-center items-center`)}>
            <Svg style={tailwind('text-gray-600 rounded-full')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </Svg>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={this.onSearchCancelBtnClick} style={tailwind('ml-2 flex-grow-0 flex-shrink-0 justify-center items-center h-10 rounded-lg')}>
          <Text style={tailwind('text-base text-gray-900 underline')}>Cancel</Text>
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
      <Modal isVisible={isProfilePopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onProfileCancelBtnClick} onBackButtonPress={this.onProfileCancelBtnClick} style={tailwind('justify-end m-0')} supportedOrientations={['portrait', 'landscape']} backdropOpacity={0.25} animationIn="slideInUp" animationInTiming={200} animationOut="slideOutDown" animationOutTiming={200} useNativeDriver={true}>
        <View style={tailwind('py-4 w-full bg-white border border-gray-200 rounded-t-lg shadow-xl')}>
          <TouchableOpacity onPress={() => Linking.openURL(DOMAIN_NAME + '/#support')} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-gray-800')}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSignOutBtnClick} style={tailwind('py-4 pl-4 w-full')}>
            <Text style={tailwind('text-gray-800')}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  render() {

    const style = {
      height: toPx(BAR_HEIGHT) + this.props.insets.bottom,
      transform: [{ translateY: this.bottomBarTranslateY }],
    };
    const innerStyle = {
      height: toPx(BAR_HEIGHT),
    };
    const shadowStyle = {
      height: 10,
      transform: [{ translateY: -15 }],
    };

    return (
      <React.Fragment>
        <Animated.View style={[tailwind('absolute inset-x-0 bottom-0 bg-white z-30'), style]}>
          <View style={[tailwind('relative flex-row w-full overflow-hidden'), innerStyle]}>
            <View style={[tailwind('absolute inset-x-0 top-0 bg-white shadow-lg'), shadowStyle]}></View>
            <TouchableOpacity onPress={this.onAddBtnClick} style={tailwind('justify-center items-center w-1/3 h-full')}>
              <View style={tailwind('justify-center items-center w-8 h-7 bg-gray-800 rounded-lg shadow-sm')}>
                <Svg style={tailwind('text-white')} width={16} height={14} viewBox="0 0 16 14" stroke="currentColor" fill="none">
                  <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onSearchBtnClick} style={tailwind('justify-center items-center w-1/3 h-full')}>
              <Svg style={tailwind('text-gray-800 rounded-lg')} width={32} height={32} viewBox="0 0 24 24" fill="currentColor">
                <Path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onProfileBtnClick} style={tailwind('justify-center items-center w-1/3 h-full')}>
              <View style={tailwind('justify-center items-center h-10 w-10 bg-white rounded-lg overflow-hidden border-2 border-gray-200')}>
                <SvgXml width={36} height={36} xml={this.userImage} />
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

const mapStateToProps = (state, props) => {

  const { popupLink } = getLinks(state);

  return {
    username: state.user.username,
    userImage: state.user.image,
    searchString: state.display.searchString,
    isAddPopupShown: state.display.isAddPopupShown,
    isSearchPopupShown: state.display.isSearchPopupShown,
    isProfilePopupShown: state.display.isProfilePopupShown,
    popupLink: popupLink,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  signOut, updatePopup, addLink, updateSearchString,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(BottomBar));
