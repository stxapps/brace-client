import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Animated, Keyboard, BackHandler, Platform,
} from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateSearchString } from '../actions';
import {
  SEARCH_POPUP, BOTTOM_BAR_HEIGHT, SEARCH_POPUP_HEIGHT,
} from '../types/const';
import { getPopupLink, getThemeMode } from '../selectors';
import { toPx } from '../utils';
import { bbFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class BottomBarSearchPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      keyboardHeight: 0,
    };

    this.searchInput = React.createRef();

    this.searchPopupTranslateY = new Animated.Value(toPx(SEARCH_POPUP_HEIGHT));

    this.searchPopupBackHandler = null;
    this.keyboardDidShowListener = null;
    this.keyboardDidHideListener = null;
    this.doFocus = true;
  }

  componentDidMount() {
    const { searchString, isSearchPopupShown } = this.props;

    this.registerSearchPopupBackHandler(isSearchPopupShown);
    this.registerKeyboardListeners(isSearchPopupShown);

    if (searchString && !isSearchPopupShown) {
      this.doFocus = false;
      this.props.updatePopup(SEARCH_POPUP, true);
    } else if (searchString && isSearchPopupShown) {
      this.translateSearchPopup(true);
    } else if (!searchString && isSearchPopupShown) {
      this.props.updatePopup(SEARCH_POPUP, false);
    }
  }

  componentDidUpdate(prevProps, prevState) {

    const { isBottomBarShown, isSearchPopupShown } = this.props;
    if (prevProps.isSearchPopupShown !== isSearchPopupShown) {
      this.registerSearchPopupBackHandler(isSearchPopupShown);
    }

    if (!prevProps.isSearchPopupShown && isSearchPopupShown) {
      // Register keyboard listerners before input focus
      this.registerKeyboardListeners(isSearchPopupShown);
      if (this.doFocus) this.searchInput.current.focus();
      this.doFocus = true;
    }

    if (prevProps.isSearchPopupShown && !isSearchPopupShown) {
      // Input blur before unregister keyboard listerners
      this.searchInput.current.blur();
      this.registerKeyboardListeners(isSearchPopupShown);
    }

    if (
      prevProps.isBottomBarShown !== isBottomBarShown ||
      prevProps.isSearchPopupShown !== isSearchPopupShown ||
      prevState.keyboardHeight !== this.state.keyboardHeight
    ) {
      this.translateSearchPopup(prevProps.isBottomBarShown);
    }
  }

  componentWillUnmount() {
    this.registerSearchPopupBackHandler(false);
    this.registerKeyboardListeners(false);
  }

  registerSearchPopupBackHandler = (isSearchPopupShown) => {
    if (isSearchPopupShown) {
      if (!this.searchPopupBackHandler) {
        this.searchPopupBackHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            if (!this.props.isSearchPopupShown) return false;
            if (this.props.popupLink) return false;

            this.onSearchCancelBtnClick();
            return true;
          }
        );
      }
    } else {
      if (this.searchPopupBackHandler) {
        this.searchPopupBackHandler.remove();
        this.searchPopupBackHandler = null;
      }
    }
  }

  registerKeyboardListeners = (isSearchPopupShown) => {
    if (isSearchPopupShown) {
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

  translateSearchPopup = (prevIsBottomBarShown) => {
    const { isBottomBarShown, isSearchPopupShown, insets } = this.props;

    let toValue;
    if (!isBottomBarShown) {
      toValue = toPx(BOTTOM_BAR_HEIGHT) + toPx(SEARCH_POPUP_HEIGHT) + insets.bottom;
    } else {
      if (!isSearchPopupShown) toValue = toPx(SEARCH_POPUP_HEIGHT);
      else {
        // Avoid keyboard only on iOS
        //   as on Android, the window is resized already.
        const bottom = toPx(BOTTOM_BAR_HEIGHT) + insets.bottom;
        if (Platform.OS === 'ios' && this.state.keyboardHeight > bottom) {
          toValue = -1 * (this.state.keyboardHeight - bottom);
        } else toValue = 0;
      }
    }

    if (!prevIsBottomBarShown && isBottomBarShown) {
      Animated.timing(this.searchPopupTranslateY, { toValue, ...bbFMV.visible }).start();
    } else {
      Animated.timing(this.searchPopupTranslateY, {
        toValue: toValue,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
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
  }

  render() {
    const { searchString, insets, tailwind } = this.props;

    // Only transition when moving with BottomBar
    //   but when show/hide this search popup, no need animation
    //   as keyboard is already animated.
    const style = {
      transform: [{ translateY: this.searchPopupTranslateY }],
    };
    style.bottom = toPx(BOTTOM_BAR_HEIGHT) + insets.bottom;

    const searchClearBtnClasses = searchString.length === 0 ? 'hidden relative' : 'flex absolute';
    const inputClassNames = Platform.OS === 'ios' ? 'py-2 leading-4' : 'py-0.5';

    return (
      <Animated.View style={[tailwind('absolute inset-x-0 z-10 flex-row items-center justify-between border-t border-gray-200 bg-white px-2 py-2'), style]}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <TextInput ref={this.searchInput} onChange={this.onSearchInputChange} style={tailwind(`w-full rounded-full border border-gray-400 bg-white pl-4 pr-6 text-sm font-normal text-gray-700 ${inputClassNames}`)} placeholder="Search" placeholderTextColor="rgb(107, 114, 128)" value={searchString} autoCapitalize="none" />
          {/* A bug display: none doesn't work with absolute, need to change to relative. https://github.com/facebook/react-native/issues/18415 */}
          <TouchableOpacity onPress={this.onSearchClearBtnClick} style={tailwind(`inset-y-0 right-0 items-center justify-center pr-2 ${searchClearBtnClasses}`)}>
            <Svg style={tailwind('rounded-full font-normal text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
            </Svg>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={this.onSearchCancelBtnClick} style={tailwind('ml-2 h-10 flex-shrink-0 flex-grow-0 items-center justify-center rounded-md px-1.5 py-1')}>
          <Text style={tailwind('text-sm font-normal text-gray-500')}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const mapStateToProps = (state, props) => {

  const { isListNamesPopupShown, isPinMenuPopupShown } = state.display;
  const popupLink = getPopupLink(state);

  return {
    searchString: state.display.searchString,
    isBottomBarShown: (
      popupLink === null && !isListNamesPopupShown && !isPinMenuPopupShown
    ),
    isSearchPopupShown: state.display.isSearchPopupShown,
    popupLink: popupLink,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updatePopup, updateSearchString };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarSearchPopup));
