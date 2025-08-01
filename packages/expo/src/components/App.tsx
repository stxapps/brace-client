import React from 'react';
import { connect } from 'react-redux';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';

class App extends React.PureComponent<any, any> {

  render() {

    if (this.props.href === null || this.props.isHandlingSignIn) {
      return <Loading />;
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
