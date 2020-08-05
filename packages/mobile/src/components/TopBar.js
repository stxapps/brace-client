import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Svg, { SvgXml, Path } from 'react-native-svg'
import jdenticon from 'jdenticon';

import { signIn, signOut, updatePopup, addLink, updateSearchString } from '../actions';
import {
  ADD_POPUP, PROFILE_POPUP,
  SHOW_BLANK, SHOW_SIGN_IN, SHOW_COMMANDS,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
} from '../types/const';
import { validateUrl, isEqual } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import { InterText as Text } from '.';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

class TopBar extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = {
      url: '',
      msg: '',
      isAskingConfirm: false,
    };
    this.state = { ...this.initialState };

    this.searchClearBtn = React.createRef();

    this.userImage = props.userImage;
    if (this.userImage === null) {
      const svgString = jdenticon.toSvg(props.username, 32);
      this.userImage = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    }

    this.prevIsAddPopupShown = false;
  }

  componentDidUpdate() {
    if (!this.prevIsAddPopupShown && this.props.isAddPopupShown) {
      if (!isEqual(this.state, this.initialState)) {
        this.setState({ ...this.initialState });
      }
    }
    this.prevIsAddPopupShown = this.props.isAddPopupShown;
  }

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;
    this.props.updatePopup(ADD_POPUP, true);
  }

  onAddInputChange = (e) => {
    this.setState({ url: e.target.value, msg: '', isAskingConfirm: false });
  }

  onAddInputKeyPress = (e) => {
    if (e.key === 'Enter') this.onAddOkBtnClick();
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

    this.props.addLink(this.state.url, true);
    this.props.updatePopup(ADD_POPUP, false);
  }

  onAddCancelBtnClick = () => {
    this.props.updatePopup(ADD_POPUP, false);
  }

  onSearchInputChange = (e) => {
    const value = e.target.value;

    this.props.updateSearchString(value);

    if (value.length === 0) this.searchClearBtn.current.classList.add('hidden');
    else this.searchClearBtn.current.classList.remove('hidden');
  }

  onSearchClearBtnClick = () => {
    this.props.updateSearchString('');
    this.searchClearBtn.current.classList.add('hidden')
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

  }

  renderProfilePopup() {

  }

  renderCommands() {

  }

  renderSignInBtn() {

  }

  render() {

    const rightPaneProp = this.props.rightPane;
    const { windowWidth } = this.props;

    let rightPane;
    if (rightPaneProp === SHOW_BLANK) rightPane = null;
    else if (rightPaneProp === SHOW_SIGN_IN) rightPane = this.renderSignInBtn();
    else if (rightPaneProp === SHOW_COMMANDS) rightPane = this.renderCommands();
    else throw new Error(`Invalid rightPane: ${rightPaneProp}`);

    return (
      <View style={tailwind('items-center w-full')}>
        <View style={tailwind('px-4 flex-row justify-between items-center w-full max-w-6xl min-h-14 md:px-6 lg:px-8', windowWidth)}>
          <View style={tailwind('')}>
            <SvgXml style={tailwind('md:hidden', windowWidth)} width={28.36} height={32} xml={shortLogo} />
            <SvgXml style={tailwind('hidden md:flex', windowWidth)} width={109.63} height={24} xml={fullLogo} />
            <Text style={[tailwind('absolute text-xs'), { top: -9, right: -28.4 }]}>beta</Text>
          </View>
          {rightPane}
        </View>
      </View>
    );
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
