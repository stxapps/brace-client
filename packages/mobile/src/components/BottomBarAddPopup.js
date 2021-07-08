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
    this.didClick = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.isAddPopupShown && nextProps.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
  }

  onAddPopupShow = () => {
    setTimeout(() => this.addInput.current.focus(), 1);
    this.didClick = false;
  }

  onAddPopupHide = () => this.addInput.current.blur()

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
    this.props.updatePopup(ADD_POPUP, false);

    this.didClick = true;
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  render() {

    const { isAddPopupShown, windowWidth, windowHeight } = this.props;
    const { url, msg, isAskingConfirm } = this.state;

    return (
      <Modal isVisible={isAddPopupShown} deviceWidth={windowWidth} deviceHeight={windowHeight} onBackdropPress={this.onAddCancelBtnClick} onBackButtonPress={this.onAddCancelBtnClick} onModalShow={this.onAddPopupShow} onModalWillHide={this.onAddPopupHide} style={tailwind('justify-end m-0')} supportedOrientations={MODAL_SUPPORTED_ORIENTATIONS} backdropOpacity={0.25} animationIn="fadeIn" animationInTiming={1} animationOut="fadeOut" animationOutTiming={1} useNativeDriver={true} avoidKeyboard={Platform.OS === 'ios' ? true : false}>
        <View style={tailwind('px-4 pt-6 pb-6 w-full bg-white border border-gray-100 rounded-t-lg shadow-xl')}>
          <View style={tailwind('flex-row justify-start items-center')}>
            <Text style={tailwind('flex-none text-sm text-gray-600 font-normal')}>Url:</Text>
            {/* onKeyPress event for Enter key only if there is multiline TextInput */}
            <TextInput ref={this.addInput} onChange={this.onAddInputChange} onSubmitEditing={this.onAddInputKeyPress} style={tailwind('ml-3 px-3.5 py-1.5 flex-1 bg-white text-base text-gray-700 font-normal leading-5 rounded-full border border-gray-400')} keyboardType="url" placeholder="https://" value={url} autoCapitalize="none" />
          </View>
          {msg !== '' && <Text style={tailwind('pt-3 text-sm text-red-500 font-normal')}>{msg}</Text>}
          <View style={tailwind(`${msg !== '' ? 'pt-3' : 'pt-5'} flex-row justify-start items-center`)}>
            <TouchableOpacity onPress={this.onAddOkBtnClick} style={[tailwind('px-4 justify-center items-center bg-gray-800 rounded-full'), { paddingTop: 7, paddingBottom: 7 }]}>
              <Text style={tailwind('text-sm text-gray-50 font-medium')}>{isAskingConfirm ? 'Sure' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onAddCancelBtnClick} style={tailwind('ml-2 px-2.5 py-1.5 rounded-md')}>
              <Text style={tailwind('text-sm text-gray-500 font-normal')}>Cancel</Text>
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
