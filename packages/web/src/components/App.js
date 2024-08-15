import React from 'react';
import { connect } from 'react-redux';
import Url from 'url-parse';
import { LazyMotion, domAnimation } from 'framer-motion';

import {
  HASH_LANDING, HASH_LANDING_HOW, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS,
  HASH_PRIVACY, HASH_PRICING, HASH_SUPPORT, HASH_BACK, APP_RENDER_LOADING,
  APP_RENDER_LANDING, APP_RENDER_ABOUT, APP_RENDER_TERMS, APP_RENDER_PRIVACY,
  APP_RENDER_PRICING, APP_RENDER_SUPPORT, APP_RENDER_BACK, APP_RENDER_ADDING,
  APP_RENDER_MAIN,
} from '../types/const';

import Loading from './Loading';
import Landing from './Landing';
import Back from './Back';
import ErrorBoundary from './ErrorBoundary';

// @ts-expect-error
const _AppChunk = import('./AppChunk');
const AppChunk = React.lazy(() => _AppChunk);

class App extends React.PureComponent {

  getType() {
    const hrefObj = new Url(this.props.href);
    if (hrefObj.pathname !== '/') return APP_RENDER_ADDING;

    if (this.props.href === null || this.props.isHandlingSignIn) {
      return APP_RENDER_LOADING;
    }

    if (
      hrefObj.hash === HASH_LANDING ||
      hrefObj.hash === HASH_LANDING_HOW ||
      hrefObj.hash === HASH_LANDING_MOBILE
    ) return APP_RENDER_LANDING;
    if (hrefObj.hash === HASH_ABOUT) return APP_RENDER_ABOUT;
    if (hrefObj.hash === HASH_TERMS) return APP_RENDER_TERMS;
    if (hrefObj.hash === HASH_PRIVACY) return APP_RENDER_PRIVACY;
    if (hrefObj.hash === HASH_PRICING) return APP_RENDER_PRICING;
    if (hrefObj.hash === HASH_SUPPORT) return APP_RENDER_SUPPORT;
    if (hrefObj.hash === HASH_BACK) return APP_RENDER_BACK;

    if (this.props.isUserSignedIn) return APP_RENDER_MAIN;

    return APP_RENDER_LANDING;
  }

  render() {
    const type = this.getType();

    let component;
    if (type === APP_RENDER_LOADING) component = <Loading />;
    else if (type === APP_RENDER_LANDING) component = <Landing />;
    else if (type === APP_RENDER_BACK) component = <Back />;
    if (component) {
      return (
        <LazyMotion features={domAnimation} strict={true}>
          {component}
        </LazyMotion>
      );
    }

    return (
      <ErrorBoundary>
        <React.Suspense fallback={<Loading />}>
          <AppChunk type={type} />
        </React.Suspense>
      </ErrorBoundary>
    );
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
