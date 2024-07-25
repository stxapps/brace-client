import React from 'react';
import { connect } from 'react-redux';
import Url from 'url-parse';

import {
  HASH_LANDING, HASH_LANDING_HOW, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS,
  HASH_PRIVACY, HASH_PRICING, HASH_SUPPORT, HASH_BACK,
} from '../types/const';

import Loading from './Loading';
import Landing from './Landing';
import Adding from './Adding';
import About from './About';
import Terms from './Terms';
import Privacy from './Privacy';
import Pricing from './Pricing';
import Support from './Support';
import Back from './Back';
import ErrorBoundary from './ErrorBoundary';

// @ts-expect-error
const _Main = import('./Main');
const Main = React.lazy(() => _Main);

class App extends React.PureComponent {

  render() {
    const hrefObj = new Url(this.props.href);
    if (hrefObj.pathname !== '/') return <Adding />;

    if (this.props.href === null || this.props.isHandlingSignIn) return <Loading />;

    if (
      hrefObj.hash === HASH_LANDING ||
      hrefObj.hash === HASH_LANDING_HOW ||
      hrefObj.hash === HASH_LANDING_MOBILE
    ) return <Landing />;
    if (hrefObj.hash === HASH_ABOUT) return <About />;
    if (hrefObj.hash === HASH_TERMS) return <Terms />;
    if (hrefObj.hash === HASH_PRIVACY) return <Privacy />;
    if (hrefObj.hash === HASH_PRICING) return <Pricing />;
    if (hrefObj.hash === HASH_SUPPORT) return <Support />;
    if (hrefObj.hash === HASH_BACK) return <Back />;

    if (this.props.isUserSignedIn) {
      return (
        <ErrorBoundary>
          <React.Suspense fallback={<Loading />}>
            <Main />
          </React.Suspense>
        </ErrorBoundary>
      );
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
