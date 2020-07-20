import React from 'react';
import { connect } from 'react-redux';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';
import Test from './Test';

class App extends React.Component {

  render() {

    return <Test />;
    //return <ReactNativeMasonryListExample />;

    /*if (this.props.href === null) {
      return <Loading />;
    }

    if (this.props.isUserSignedIn) {
      return <Main />;
    }

    return <Landing />;*/
  }
}

const mapStateToProps = (state) => {
  return {
    isUserSignedIn: state.user.isUserSignedIn,
    href: state.window.href,
  };
};

export default connect(mapStateToProps)(App);
