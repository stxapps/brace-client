import React from 'react';

import { APP_DOMAIN_NAME, BLOCKSTACK_AUTH } from '../types/const';
import { separateUrlAndParam } from '../utils';

class BlockstackAuth extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      hasTimeout: false,
    };
  }

  componentDidMount() {
    window.location.replace(this.genAppBlockstackAuthUrl());
    setTimeout(() => this.setState({ hasTimeout: true }), 3000);
  }

  genAppBlockstackAuthUrl() {
    const url = window.location.href;
    const { param: { authResponse } } = separateUrlAndParam(url, 'authResponse');
    return APP_DOMAIN_NAME + BLOCKSTACK_AUTH + '?authResponse=' + authResponse;
  }

  render() {
    const { hasTimeout } = this.state;
    const blockstackAuthUrl = this.genAppBlockstackAuthUrl();

    return (
      <div className="mx-auto px-4 pt-20 w-full max-w-md min-h-screen md:px-6 lg:px-8">
        <h1 className="text-lg text-gray-800 font-medium text-center">Brace.to is processing...</h1>
        <div className={`mt-6 text-gray-500 text-left ${hasTimeout ? '' : 'hidden'} sm:text-center`}>
          <p>Normally, it would take just a few seconds to process your sign up/sign in request.</p>
          <p className="mt-4">If this page is still showing, please click <a className="text-gray-900 font-medium underline rounded-sm focus:outline-none focus:ring" href={blockstackAuthUrl}>here</a>.</p>
        </div>
      </div>
    );
  }
}

export default BlockstackAuth;
