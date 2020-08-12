import React from 'react';
import { connect } from 'react-redux';
import { ScrollView, View, TouchableOpacity, TouchableWithoutFeedback, Linking, BackHandler } from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { Flow } from 'react-native-animated-spinkit'
import Svg, { Path } from 'react-native-svg'

import {
  MY_LIST,
  ADDING, ADDED, DIED_ADDING,
  NO_URL, ASK_CONFIRM_URL, URL_MSGS,
} from '../types/const';
import { addLink, cancelDiedLinks } from '../actions';
import {
  validateUrl
} from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import { InterText as Text } from '.';

const BORDER_RADIUS_STYLE = {
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  borderBottomLeftRadius: 16,
};

class Adding extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      urlValidatedResult: null,
      addingUrl: null,
      hasAskedConfirm: false,
    };
  }

  componentDidMount() {
    this.justReceivedUrl = null;
    this.removeListerner = ReceiveSharingIntent.getReceivedFiles(
      this.onReceivedFiles,
      this.onErrorReceivedFiles
    );
  }

  componentDidUpdate() {
    const { addingUrl } = this.state;

    const link = this.getLinkFromAddingUrl(addingUrl);

    if (link && link.status === ADDED) {
      setTimeout(() => BackHandler.exitApp(), 2000);
      return;
    }
    if (link && link.status === ADDING) {
      return;
    }
    if (link && link.status === DIED_ADDING) {
      return;
    }
    if (link) {
      setTimeout(() => BackHandler.exitApp(), 2000);
      return;
    }
  }

  componentWillUnmount() {
    ReceiveSharingIntent.clearReceivedFiles();
    this.removeListerner();
  }

  onReceivedFiles = (files) => {
    // Strong assumption that this component is created to save a link and then close,
    //  so ignore subsequent calls.
    if (this.justReceivedUrl !== null) return;

    // No link to save, just close this component
    if (!(files && files[0] && (files[0].weblink || files[0].text))) {
      BackHandler.exitApp();
    }

    const url = files[0].weblink || files[0].text;

    this.addLink(url);
    this.justReceivedUrl = url;
  }

  onErrorReceivedFiles = (e) => {
    throw e;
  }

  addLink(addingUrl) {
    const { isUserSignedIn } = this.props;

    const urlValidatedResult = validateUrl(addingUrl);
    if (urlValidatedResult === NO_URL) {
      this.setState({ urlValidatedResult });
      return;
    }

    let { hasAskedConfirm } = this.state;
    if ((urlValidatedResult === ASK_CONFIRM_URL && !hasAskedConfirm) || !isUserSignedIn) {
      this.setState({ urlValidatedResult, addingUrl });
      return;
    }

    let link = this.getLinkFromAddingUrl(addingUrl);
    if (link && link.status === DIED_ADDING) {
      this.props.cancelDiedLinks([link.id]);
      link = null;
    }
    if (!link) this.props.addLink(addingUrl);

    this.setState({ urlValidatedResult, addingUrl });
  }

  getLinkFromAddingUrl(addingUrl) {

    if (!addingUrl) return null;

    const { links } = this.props;

    for (const _id in links) {
      if (links[_id].url === addingUrl) {
        return links[_id];
      }
    }

    return null;
  }

  onAskingConfirmOkBtnClick = () => {
    this.setState({ hasAskedConfirm: true }, () => {
      this.addLink(this.state.addingUrl);
    });
  }

  onBackgroundBtnClick = () => {
    const { addingUrl } = this.state;

    const link = this.getLinkFromAddingUrl(addingUrl);

    if (link && link.status === ADDED) {
      BackHandler.exitApp();
      return;
    }
    if (link && link.status === ADDING) {
      return;
    }
    if (link && link.status === DIED_ADDING) {
      return;
    }
    if (link) {
      BackHandler.exitApp();
      return;
    }
  }

  _render(content) {

    return (
      <View style={tailwind('flex-1 justify-end items-center')}>
        <TouchableWithoutFeedback onPress={this.onBackgroundBtnClick}>
          <View style={tailwind('absolute inset-0 bg-black opacity-50')}></View>
        </TouchableWithoutFeedback>
        {content}
      </View>
    );
  }

  renderAdding() {
    const content = (
      <View style={[tailwind('mb-8 p-4 items-center w-40 bg-white'), BORDER_RADIUS_STYLE]}>
        <View style={tailwind('justify-center items-center w-full h-14')}>
          <Flow size={48} color="rgba(113, 128, 150, 1)" />
        </View>
        <Text style={tailwind('mt-2 w-full text-xl text-gray-900 font-normal text-center')}>Saving to <Text style={tailwind('text-xl text-gray-900 font-semibold')}>Brace</Text></Text>
      </View>
    );

    return this._render(content);
  }

  renderAdded() {

    const content = (
      <View style={[tailwind('mb-8 p-4 items-center w-40 bg-white'), BORDER_RADIUS_STYLE]}>
        <Svg width={56} height={56} viewBox="0 0 96 96" fill="none">
          <Path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="#68D391" />
          <Path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="#22543D" />
        </Svg>
        <Text style={tailwind('mt-2 w-full text-xl text-gray-900 font-normal text-center')}>Saved to <Text style={tailwind('text-xl text-gray-900 font-semibold')}>Brace</Text></Text>
      </View>
    );

    return this._render(content);
  }

  renderDiedAdding() {
    let { windowWidth, windowHeight } = this.props;
    if (!windowWidth) windowWidth = 360;

    const style = {
      height: Math.min(windowHeight - 72, 359),
    };

    const content = (
      <View style={[tailwind('mb-8 bg-white'), style, BORDER_RADIUS_STYLE]}>
        <ScrollView contentContainerStyle={tailwind('p-4 items-center w-64 sm:w-72', windowWidth)}>
          <Svg style={tailwind('text-red-600')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('mt-2 w-full text-xl text-gray-900 font-normal text-center')}>Oops..., something went wrong!</Text>
          <Text style={tailwind('mt-2 w-full text-base text-gray-900 font-normal text-center')}>Please go to the app for more information</Text>
          <TouchableOpacity onPress={() => Linking.openURL('brace://app')} style={tailwind('mt-2 justify-center items-center h-14')}>
            <View style={tailwind('px-4 py-2 justify-center items-center bg-white border border-gray-900 rounded-full shadow-sm')}>
              <Text style={tailwind('text-base text-gray-900')}>Brace</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => BackHandler.exitApp()} style={tailwind('justify-center items-center h-14')}>
            <Text style={tailwind('text-base text-gray-900')}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );

    return this._render(content);
  }

  renderAskingConfirm() {
    let { windowWidth, windowHeight } = this.props;
    if (!windowWidth) windowWidth = 360;

    const style = {
      height: Math.min(windowHeight - 72, 309),
    };

    const content = (
      <View style={[tailwind('mb-8 bg-white'), style, BORDER_RADIUS_STYLE]}>
        <ScrollView contentContainerStyle={tailwind('p-4 items-center w-64 sm:w-72', windowWidth)}>

          <Svg style={tailwind('text-yellow-600')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM10 7C9.63113 7 9.3076 7.19922 9.13318 7.50073C8.85664 7.97879 8.24491 8.14215 7.76685 7.86561C7.28879 7.58906 7.12543 6.97733 7.40197 6.49927C7.91918 5.60518 8.88833 5 10 5C11.6569 5 13 6.34315 13 8C13 9.30622 12.1652 10.4175 11 10.8293V11C11 11.5523 10.5523 12 10 12C9.44773 12 9.00001 11.5523 9.00001 11V10C9.00001 9.44772 9.44773 9 10 9C10.5523 9 11 8.55228 11 8C11 7.44772 10.5523 7 10 7ZM10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15Z" />
          </Svg>
          <Text style={tailwind('mt-2 w-full text-xl text-gray-900 font-normal text-center')}>Are you sure{'\n'}to save to <Text style={tailwind('text-xl text-gray-900 font-semibold')}>Brace</Text>?</Text>
          <TouchableOpacity onPress={this.onAskingConfirmOkBtnClick} style={tailwind('mt-2 justify-center items-center h-14')}>
            <View style={tailwind('px-4 py-2 justify-center items-center bg-white border border-gray-900 rounded-full shadow-sm')}>
              <Text style={tailwind('text-base text-gray-900')}>Yes, I'm sure</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => BackHandler.exitApp()} style={tailwind('justify-center items-center h-14')}>
            <Text style={tailwind('text-base text-gray-900')}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );

    return this._render(content);
  }

  renderInvalid() {
    let { windowWidth, windowHeight } = this.props;
    if (!windowWidth) windowWidth = 360;

    const msg = URL_MSGS[this.state.urlValidatedResult];

    const content = (
      <View style={[tailwind('mb-8 p-4 items-center w-64 bg-white sm:w-72', windowWidth), BORDER_RADIUS_STYLE]}>
        <Svg style={tailwind('text-red-600')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
        </Svg>
        <Text style={tailwind('mt-2 w-full text-xl text-gray-900 font-normal text-center')}>{msg}</Text>
        <TouchableOpacity onPress={() => BackHandler.exitApp()} style={tailwind('justify-center items-center h-14')}>
          <Text style={tailwind('text-base text-gray-900')}>Close</Text>
        </TouchableOpacity>
      </View>
    );

    return this._render(content);
  }

  renderNotSignedIn() {
    let { windowWidth, windowHeight } = this.props;
    if (!windowWidth) windowWidth = 360;

    const content = (
      <View style={[tailwind('mb-8 p-4 items-center w-64 sm:w-72 bg-white', windowWidth), BORDER_RADIUS_STYLE]}>
        <Svg style={tailwind('text-yellow-600')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
        </Svg>
        <Text style={tailwind('mt-2 w-full text-xl text-gray-900 font-normal text-center')}>Please sign in first</Text>
        <TouchableOpacity onPress={() => Linking.openURL('brace://app')} style={tailwind('mt-2 justify-center items-center h-14')}>
          <View style={tailwind('px-4 py-2 justify-center items-center bg-white border border-gray-900 rounded-full shadow-sm')}>
            <Text style={tailwind('text-base text-gray-900')}>Sign in</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => BackHandler.exitApp()} style={tailwind('justify-center items-center h-14')}>
          <Text style={tailwind('text-base text-gray-900')}>Close</Text>
        </TouchableOpacity>
      </View>
    );

    return this._render(content);
  }

  renderInOtherProcessing() {

    const content = (
      <View style={[tailwind('mb-8 p-4 items-center w-40 bg-white'), BORDER_RADIUS_STYLE]}>
        <Svg width={56} height={56} viewBox="0 0 96 96" fill="none">
          <Path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="#68D391" />
          <Path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="#22543D" />
        </Svg>
        <Text style={tailwind('mt-2 w-full text-xl text-gray-900 font-normal text-center')}>Already in <Text style={tailwind('text-xl text-gray-900 font-semibold')}>Brace</Text></Text>
      </View>
    );

    return this._render(content);
  }

  render() {

    const { isUserSignedIn, windowWidth } = this.props;
    // windowWidth can be null if Redux state is not completely loaded.
    //   waiting by faking saving and be careful if use windowWidth in there.
    if (!windowWidth) {
      return this.renderAdding();
    }
    if (!isUserSignedIn) {
      return this.renderNotSignedIn();
    }

    const { urlValidatedResult, addingUrl } = this.state;

    const link = this.getLinkFromAddingUrl(addingUrl);

    if (link && link.status === ADDED) {
      return this.renderAdded();
    }
    if (link && link.status === ADDING) {
      return this.renderAdding();
    }
    if (link && link.status === DIED_ADDING) {
      return this.renderDiedAdding();
    }
    if (link) {
      return this.renderInOtherProcessing();
    }

    if (urlValidatedResult === ASK_CONFIRM_URL) {
      return this.renderAskingConfirm();
    }
    if (urlValidatedResult === NO_URL) {
      return this.renderInvalid();
    }

    return this.renderAdding();
  }
}

const mapStateToProps = (state) => {
  return {
    isUserSignedIn: state.user.isUserSignedIn,
    links: state.links[MY_LIST],
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

export default connect(mapStateToProps, { addLink, cancelDiedLinks })(Adding);
