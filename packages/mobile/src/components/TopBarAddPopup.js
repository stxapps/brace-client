import React from 'react';
import { connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, TextInput, LayoutAnimation, Platform,
} from 'react-native';
import { Menu, MenuOptions, MenuTrigger, withMenuContext } from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, addLink } from '../actions';
import {
  ADD_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
} from '../types/const';
import { validateUrl, isEqual } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { withSafeAreaContext } from '.';
import MenuPopoverRenderers from './MenuPopoverRenderer';

const ADD_POPUP_MENU_NAME = 'addPopup';

class TopBarAddPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    this.didClick = false;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isAddPopupShown && this.props.isAddPopupShown) {
      if (!this.props.ctx.menuActions.isMenuOpen()) {
        this.props.ctx.menuActions.openMenu(ADD_POPUP_MENU_NAME);
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
    this.didClick = false;
  }

  onAddInputChange = (e) => {
    this.setState({ url: e.nativeEvent.text, msg: '', isAskingConfirm: false });
  }

  onAddInputKeyPress = () => {
    this.onAddOkBtnClick();
  }

  onAddOkBtnClick = () => {
    if (this.didClick) return;

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
    this.props.addLink(this.state.url, null, null);
    this.props.ctx.menuActions.closeMenu();
    this.props.updatePopup(ADD_POPUP, false);

    this.didClick = true;
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  renderAddPopup() {
    const { safeAreaWidth } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-0.5';

    return (
      <View style={tailwind('px-4 pt-6 pb-5 w-72 md:w-96', safeAreaWidth)}>
        <View style={tailwind('flex-row justify-start items-center')}>
          <Text style={tailwind('flex-none text-sm text-gray-600 font-normal')}>Url:</Text>
          {/* onKeyPress event for Enter key only if there is multiline TextInput */}
          <TextInput onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind(`ml-3 px-3.5 flex-1 bg-white text-base text-gray-700 font-normal rounded-full border border-gray-400 ${inputClassNames}`)} keyboardType="url" placeholder="https://" value={url} autoCapitalize="none" autoFocus />
        </View>
        {msg !== '' && <Text style={tailwind('pt-3 text-sm text-red-500 font-normal')}>{msg}</Text>}
        <View style={tailwind(`${msg !== '' ? 'pt-3' : 'pt-5'} flex-row justify-start items-center`)}>
          <TouchableOpacity onPress={this.onAddOkBtnClick} style={[tailwind('px-4 justify-center items-center bg-gray-800 rounded-full'), { paddingTop: 7, paddingBottom: 7 }]}>
            <Text style={tailwind('text-sm text-gray-50 font-medium')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.ctx.menuActions.closeMenu()} style={tailwind('ml-2 px-2.5 py-1.5 rounded-md')}>
            <Text style={tailwind('text-sm text-gray-500 font-normal')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  render() {

    const anchorClasses = Platform.select({ ios: 'z-10', android: 'shadow-xl' });

    return (
      <Menu name={ADD_POPUP_MENU_NAME} renderer={MenuPopoverRenderers} rendererProps={cache('TBAP_menuRendererProps', { preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) })} onOpen={this.onAddBtnClick} onClose={this.onAddCancelBtnClick}>
        <MenuTrigger>
          <View style={cache('TBAP_menuTriggerViewStyle', [tailwind('flex-row justify-center items-center bg-white border border-gray-400 rounded-full'), { height: 32, paddingLeft: 10, paddingRight: 12 }])}>
            <Svg style={tailwind('text-gray-500 font-normal')} width={12} height={11} viewBox="0 0 16 14" stroke="currentColor" fill="none">
              <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={tailwind('ml-1 text-sm text-gray-500 font-normal')}>Add</Text>
          </View>
        </MenuTrigger>
        <MenuOptions customStyles={cache('TBAP_menuOptionsCustomStyles', { optionsContainer: tailwind('bg-white rounded-lg shadow-xl') })}>
          {this.renderAddPopup()}
        </MenuOptions>
      </Menu>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
  };
};

const mapDispatchToProps = { updatePopup, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(withMenuContext(TopBarAddPopup)));
