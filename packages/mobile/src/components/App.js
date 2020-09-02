import React from 'react';
import { connect } from 'react-redux';
import { NativeModules } from 'react-native';

import {
  APP_DOMAIN_NAME, SAVE_TO_BRACE,
} from '../types/const';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';
import Adding from './Adding';

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

class App extends React.PureComponent {

  render() {

    if (this.props.href === null || this.props.isHandlingSignIn) {
      return <Loading />;
    }

    if (this.props.href.startsWith(APP_DOMAIN_NAME + SAVE_TO_BRACE)) {
      return <Adding />;
    }

    if (this.props.isUserSignedIn) {
      return <Main />;
    }

    return <Landing />;
  }
}

const mapStateToProps = (state) => {
  return {
    isUserSignedIn: state.user.isUserSignedIn,
    href: state.window.href,
    isHandlingSignIn: state.display.isHandlingSignIn,
  };
};

export default connect(mapStateToProps)(App);
