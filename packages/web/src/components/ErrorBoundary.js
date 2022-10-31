import React from 'react';

import { HASH_SUPPORT } from '../types/const';

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);

    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.toString() };
  }

  render() {
    const { isInPopup } = this.props;
    const { hasError, errorMessage } = this.state;

    if (hasError) {
      return (
        <div className={`h-screen w-screen max-w-full bg-white px-4 py-16 ${isInPopup ? '' : 'sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8'}`}>
          <div className="mx-auto max-w-max">
            <main className={`${isInPopup ? '' : 'sm:flex'}`}>
              <p className={`text-4xl font-extrabold text-red-600 ${isInPopup ? '' : 'sm:text-5xl'}`}>5XX</p>
              <div className={`${isInPopup ? '' : 'sm:ml-6'}`}>
                <div className={`${isInPopup ? '' : 'sm:border-l sm:border-gray-200 sm:pl-6'}`}>
                  <h1 className={`text-4xl font-extrabold tracking-tight text-gray-900 ${isInPopup ? '' : 'sm:text-5xl'}`}>An error occured</h1>
                  <p className="mt-2.5 text-base text-gray-500">It's likely to be a network issue. Please wait a moment, check your internet connection and try to refresh the page. If the problem persists, please <a className="rounded-sm underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
                  <p className="mt-2.5 text-sm text-gray-500">{errorMessage}</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
