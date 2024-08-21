import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';

import { updatePopup } from '../actions';
import { updateLinkEditor, addLink } from '../actions/chunk';
import {
  ADD_POPUP, NO_URL, ASK_CONFIRM_URL, URL_MSGS, MODAL_SUPPORTED_ORIENTATIONS, BLK_MODE,
} from '../types/const';
import { getThemeMode } from '../selectors';
import { validateUrl } from '../utils';

import { withTailwind } from '.';

class BottomBarAddPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.addInput = React.createRef();
    this.didClick = false;
  }

  onAddPopupShow = () => {
    setTimeout(() => {
      if (this.addInput.current) this.addInput.current.focus();
    }, 100);
    this.didClick = false;
  }

  onAddPopupHide = () => this.addInput.current.blur()

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

    const url = this.props.url.trim();
    if (!this.props.isAskingConfirm) {
      const urlValidatedResult = validateUrl(url);
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

    this.props.addLink(url, null, null);
    this.props.updatePopup(ADD_POPUP, false);

    this.didClick = true;
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  render() {

    const {
      isAddPopupShown, safeAreaWidth, safeAreaHeight, insets,
      url, msg, isAskingConfirm, themeMode, tailwind,
    } = this.props;

    const windowWidth = safeAreaWidth + insets.left + insets.right;
    const windowHeight = safeAreaHeight + insets.top + insets.bottom;

    const inputClassNames = Platform.OS === 'ios' ? 'py-1.5 leading-5' : 'py-0.5';

    return (
      <Modal isVisible={isAddPopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onAddCancelBtnClick} onBackButtonPress={this.onAddCancelBtnClick} onModalShow={this.onAddPopupShow} onModalWillHide={this.onAddPopupHide} style={tailwind('m-0 justify-end')} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true} avoidKeyboard={Platform.OS === 'ios' ? true : false}>
        <View style={tailwind('w-full rounded-t-lg bg-white px-4 pt-6 pb-6 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800')}>
          <View style={tailwind('flex-row items-center justify-start')}>
            <Text style={tailwind('flex-none text-sm font-normal text-gray-500 blk:text-gray-300')}>Url:</Text>
            {/* onKeyPress event for Enter key only if there is multiline TextInput */}
            <TextInput ref={this.addInput} onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind(`ml-3 flex-1 rounded-full border border-gray-400 bg-white px-3.5 text-base font-normal text-gray-700 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 ${inputClassNames}`)} keyboardType="url" placeholder="https://" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={url} autoCapitalize="none" />
          </View>
          {msg !== '' && <Text style={tailwind('pt-3 text-sm font-normal text-red-500')}>{msg}</Text>}
          <View style={tailwind(`flex-row items-center justify-start ${msg !== '' ? 'pt-3' : 'pt-5'}`)}>
            <TouchableOpacity onPress={this.onAddOkBtnClick} style={[tailwind('items-center justify-center rounded-full bg-gray-800 px-4 blk:bg-gray-100'), { paddingTop: 7, paddingBottom: 7 }]}>
              <Text style={tailwind('text-sm font-medium text-gray-50 blk:text-gray-800')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onAddCancelBtnClick} style={tailwind('ml-2 rounded-md px-2.5 py-1.5')}>
              <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
    url: state.linkEditor.url,
    msg: state.linkEditor.msg,
    isAskingConfirm: state.linkEditor.isAskingConfirm,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updatePopup, updateLinkEditor, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(BottomBarAddPopup));
