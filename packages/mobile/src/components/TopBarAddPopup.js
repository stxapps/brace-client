import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, LayoutAnimation, Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { Menu, MenuOptions, MenuTrigger, withMenuContext } from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateLinkEditor, addLink } from '../actions';
import { ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS } from '../types/const';
import { validateUrl } from '../utils';
import cache from '../utils/cache';
import { cardItemFMV } from '../types/animConfigs';

import { withTailwind } from '.';
import MenuPopoverRenderers from './MenuPopoverRenderer';

const ADD_POPUP_MENU_NAME = 'addPopup';

class TopBarAddPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  componentDidMount() {
    if (this.props.isAddPopupShown) {
      if (!this.props.ctx.menuActions.isMenuOpen()) {
        this.props.ctx.menuActions.openMenu(ADD_POPUP_MENU_NAME);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isAddPopupShown && this.props.isAddPopupShown) {
      if (!this.props.ctx.menuActions.isMenuOpen()) {
        this.props.ctx.menuActions.openMenu(ADD_POPUP_MENU_NAME);
      }
    }
  }

  onAddBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, true);
    this.didClick = false;
  }

  onAddInputChange = (e) => {
    this.props.updateLinkEditor(
      { url: e.nativeEvent.text, msg: '', isAskingConfirm: false }
    );
  }

  onAddInputKeyPress = () => {
    this.onAddOkBtnClick();
  }

  onAddOkBtnClick = () => {
    if (this.didClick) return;

    if (!this.props.isAskingConfirm) {
      const urlValidatedResult = validateUrl(this.props.url);
      if (urlValidatedResult === NO_URL) {
        this.props.updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: false }
        );
        return;
      }
      if (urlValidatedResult === ASK_CONFIRM_URL) {
        this.props.updateLinkEditor(
          { msg: URL_MSGS[urlValidatedResult], isAskingConfirm: true }
        );
        return;
      }
    }

    const { safeAreaWidth } = this.props;
    const animConfig = cardItemFMV(safeAreaWidth);

    LayoutAnimation.configureNext(animConfig);
    this.props.addLink(this.props.url, null, null);
    this.props.ctx.menuActions.closeMenu();
    this.props.updatePopup(ADD_POPUP, false);

    this.didClick = true;
  }

  onAddCancelBtnClick = () => {
    this.props.ctx.menuActions.closeMenu();
    this.onAddPopupClosed();
  }

  onAddPopupClosed = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  renderAddPopup() {
    const { url, msg, isAskingConfirm, tailwind } = this.props;

    const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-0.5';

    return (
      <View style={tailwind('w-72 px-4 pt-6 pb-5 md:w-96')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <Text style={tailwind('flex-none text-sm font-normal text-gray-600')}>Url:</Text>
          {/* onKeyPress event for Enter key only if there is multiline TextInput */}
          <TextInput onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind(`ml-3 flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-base font-normal text-gray-700 ${inputClassNames}`)} keyboardType="url" placeholder="https://" value={url} autoCapitalize="none" autoFocus />
        </View>
        {msg !== '' && <Text style={tailwind('pt-3 text-sm font-normal text-red-500')}>{msg}</Text>}
        <View style={tailwind(`flex-row items-center justify-start ${msg !== '' ? 'pt-3' : 'pt-5'}`)}>
          <TouchableOpacity onPress={this.onAddOkBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4'), { paddingTop: 7, paddingBottom: 7 }]}>
            <Text style={tailwind('text-sm font-medium text-gray-50')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onAddCancelBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
            <Text style={tailwind('text-sm font-normal text-gray-500')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  render() {
    const { tailwind } = this.props;
    const anchorClasses = Platform.select({ ios: 'z-10', android: 'shadow-xl' });

    return (
      <Menu name={ADD_POPUP_MENU_NAME} renderer={MenuPopoverRenderers} rendererProps={cache('TBAP_menuRendererProps', { preferredPlacement: 'bottom', anchorStyle: tailwind(anchorClasses) })} onBackdropPress={this.onAddPopupClosed}>
        <MenuTrigger onPress={this.onAddBtnClick}>
          <View style={cache('TBAP_menuTriggerViewStyle', [tailwind('flex-row items-center justify-center rounded-full border border-gray-400 bg-white'), { height: 32, paddingLeft: 10, paddingRight: 12 }])}>
            <Svg style={tailwind('font-normal text-gray-500')} width={12} height={11} viewBox="0 0 16 14" stroke="currentColor" fill="none">
              <Path d="M8 1V13M1 6.95139H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={tailwind('ml-1 text-sm font-normal text-gray-500')}>Add</Text>
          </View>
        </MenuTrigger>
        <MenuOptions customStyles={cache('TBAP_menuOptionsCustomStyles', { optionsContainer: tailwind('rounded-lg bg-white shadow-xl') })}>
          {this.renderAddPopup()}
        </MenuOptions>
      </Menu>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
    url: state.linkEditor.url,
    msg: state.linkEditor.msg,
    isAskingConfirm: state.linkEditor.isAskingConfirm,
  };
};

const mapDispatchToProps = { updatePopup, updateLinkEditor, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(withMenuContext(TopBarAddPopup)));
