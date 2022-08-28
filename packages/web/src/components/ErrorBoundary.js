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
                  <p className="mt-2.5 text-base text-gray-500">
                    It's likely to be a network issue. Please wait a moment, check your internet connection and try to refresh the page. If the problem persists, please <a className="rounded-sm underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400" href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
                      <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                        <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
                      </svg></a>.
                  </p>
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
