import React from 'react';
import { connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, TextInput, LayoutAnimation, Platform,
} from 'react-native';
import Modal from 'react-native-modal';

import { updatePopup, addLink } from '../actions';
import {
  ADD_POPUP,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
  MODAL_SUPPORTED_ORIENTATIONS,
} from '../types/const';
import { validateUrl, isEqual } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { withSafeAreaContext } from '.';

class BottomBarAddPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    this.addInput = React.createRef();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
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
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isAddPopupShown) return;

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
    this.props.updatePopup(ADD_POPUP, false);
  }

  onAddCancelBtnClick = () => {
    // As animation takes time, increase chance to duplicate clicks
    if (!this.props.isAddPopupShown) return;
    this.props.updatePopup(ADD_POPUP, false);
  }

  render() {

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
}

const mapStateToProps = (state, props) => {
  return {
    isAddPopupShown: state.display.isAddPopupShown,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = { updatePopup, addLink };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(BottomBarAddPopup));
