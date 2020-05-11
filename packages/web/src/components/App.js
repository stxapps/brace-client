import React from 'react';
import { connect } from 'react-redux';
import Url from 'url-parse'

import Loading from './Loading'
import Landing from './Landing'
import Main from './Main'
import Adding from './Adding'
import About from './About'

class App extends React.Component {

  render() {

    if (this.props.href === null) {
      return <Loading />;
    }

    const hrefObj = new Url(this.props.href);

    if (hrefObj.pathname !== '/') {
      return <Adding />;
    }

    if (hrefObj.hash === '#about') {
      return <About />;
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
  }
};

export default connect(mapStateToProps)(App);
