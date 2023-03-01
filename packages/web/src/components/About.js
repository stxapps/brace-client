import React from 'react';
import { connect } from 'react-redux';

import { SHOW_BLANK } from '../types/const';
import { getSafeAreaWidth, getThemeMode } from '../selectors';

import TopBar from './TopBar';
import Footer from './Footer';

import stacksShort from '../images/stacks-short.svg';
import reactReduxNative from '../images/react-redux-native.png';
import undrawShareLink from '../images/undraw-share-link.svg';

import { withTailwind } from '.';

class About extends React.PureComponent {

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { tailwind } = this.props;

    return (
      <React.Fragment>
        <TopBar rightPane={SHOW_BLANK} />
        <div className={tailwind('mx-auto w-full max-w-3xl bg-white px-4 pt-16 pb-4 text-gray-500 md:px-6 lg:px-8')}>
          <h1 className={tailwind('text-center text-3xl font-extrabold text-gray-900 sm:text-4xl')}>About Us</h1>
          <div className={tailwind('pt-6')}>
            <p className={tailwind('max-w-lg text-justify leading-7 hyphens-auto')}>
              Brace.to is a service to help people save links around the web. We provide simple, easy, and convenient ways for saving links to interesting articles, websites, items on online shops, videos, music, and whatever comes across while scrolling. Users can save links on our website or at an address bar. Then all saved links can be viewed and visited on any user's device anytime. Our goal is to provide our users the best experience. We're inspired by <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://getpocket.com" target="_blank" rel="noreferrer">Pocket</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://saved.io/" target="_blank" rel="noreferrer">Saved.io</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://www.pinterest.com/" target="_blank" rel="noreferrer">Pinterest</a>, and many more.
            </p>
          </div>
          <div className={tailwind('ml-auto max-w-md pt-6 md:flex md:max-w-none md:items-start md:justify-end')}>
            <img className={tailwind('mx-4 h-20 md:mx-0 md:mt-1')} src={stacksShort} alt="Stacks logo" />
            <p className={tailwind('mx-4 mt-4 text-justify leading-7 hyphens-auto md:mt-0 md:max-w-md')}>
              Privacy is at our heart. That's why we choose <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://www.stacks.co/" target="_blank" rel="noreferrer">Stacks</a>. Stacks provides tools and libraries for building a website that respects our users' privacy. User identities live in the blockchain securely and cannot be locked, banned, or deleted by Brace.to or anyone. All links at Brace.to are encrypted, no one can see their content. Even Brace.to cannot see what links users save. Also, users can set up their own server to save their links if they want.
            </p>
          </div>
          <div className={tailwind('max-w-xl pt-6')}>
            <img className={tailwind('mx-auto w-full max-w-md')} src={reactReduxNative} alt="React, Redux, and React Native logos" />
            <p className={tailwind('text-justify leading-7 hyphens-auto')}>
              Brace.to is open-sourced and published at <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://github.com/stxapps/brace-client" target="_blank" rel="noreferrer">Github.com</a>. It's built with many tools and libraries. The list is not exhaustive and continues to grow: <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://reactjs.org/" target="_blank" rel="noreferrer">React</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://create-react-app.dev/" target="_blank" rel="noreferrer">Create React App</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://react-redux.js.org/" target="_blank" rel="noreferrer">React Redux</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://redux.js.org" target="_blank" rel="noreferrer">Redux</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://github.com/reduxjs/redux-thunk" target="_blank" rel="noreferrer">Redux Thunk</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://redux-loop.js.org/" target="_blank" rel="noreferrer">Redux Loop</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://github.com/rt2zz/redux-persist" target="_blank" rel="noreferrer">Redux Persist</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://github.com/redux-offline/redux-offline" target="_blank" rel="noreferrer">Redux Offline</a>, and <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://reactnative.dev/" target="_blank" rel="noreferrer">React Native</a>. Brace.to cannot go this far without these tools and libraries. Really appreciate.
            </p>
          </div>
          <div className={tailwind('pt-6 md:flex md:items-center md:justify-end')}>
            <img className={tailwind('ml-4 w-full max-w-xs flex-shrink-0 md:ml-0 md:w-64')} src={undrawShareLink} alt="unDraw share link illustration" />
            <p className={tailwind('mt-4 ml-4 max-w-xl text-justify leading-7 hyphens-auto md:mt-0')}>
              We know that design is very important. Our user interface needs to be slick, intuitive, and beautiful. We use <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://www.figma.com/" target="_blank" rel="noreferrer">Figma</a> to design and <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://tailwindcss.com/" target="_blank" rel="noreferrer">TailwindCSS</a> to style. Many icons and illustrations are from <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://www.heroicons.com/" target="_blank" rel="noreferrer">Heroicons</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://iconmonstr.com/" target="_blank" rel="noreferrer">iconmonstr</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://undraw.co/" target="_blank" rel="noreferrer">unDraw.co</a>, <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://loading.io/" target="_blank" rel="noreferrer">Loading.io</a>, and <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://connoratherton.com/loaders" target="_blank" rel="noreferrer">Loaders.css</a>. We learn a lot from Adam Wathan's <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://www.youtube.com/channel/UCy1H38XrN7hi7wHSClfXPqQ" target="_blank" rel="noreferrer">youtube channel</a> and <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://refactoringui.com/" target="_blank" rel="noreferrer">RefactoringUI book</a> from Steve Schoger. We'd like to thank all of them very much.
            </p>
          </div>
          <p className={tailwind('max-w-lg pt-6 text-justify leading-7 hyphens-auto')}>
            Brace.to is free and we offer a paid subscription for a couple of dollars per year for use of extra features. Our business model is to create a lean, useful piece of software that grows with our users and can sustain ourself from every angle. The way everything is set up allows us to do that. If no one uses our service, it costs us almost nothing to run. If we have a lot of users, costs go up but so will revenue.
          </p>
          <p className={tailwind('max-w-lg pt-6 text-justify leading-7 hyphens-auto')}>
            It's our intention to keep all of the current free features free forever and to never show advertisements. We believe if our service is useful, our users will support us. We wouldn't force it in any way. If users aren't ready, they will always be able to close the popup and continue using our service.
          </p>
          <p className={tailwind('pt-6 leading-7')}>
            Brace Team
            <br />
            <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#64;&#98;&#114;&#97;&#99;&#101;&#46;&#116;&#111;">
              <span className={tailwind('e-mail')} data-user="troppus" data-website="ot.ecarb"></span>
            </a>
          </p>
          <div className={tailwind('pt-12 text-right')}>
            <button className={tailwind('group rounded-sm hover:text-gray-600 focus:outline-none focus:ring')} onClick={() => window.scrollTo(0, 0)}>
              <span className={tailwind('pl-1')}>Back to top</span>
              <svg className={tailwind('mb-1 ml-1 inline-block w-5 text-gray-400 group-hover:text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.29289 9.70711C2.90237 9.31658 2.90237 8.68342 3.29289 8.29289L9.29289 2.29289C9.68342 1.90237 10.3166 1.90237 10.7071 2.29289L16.7071 8.29289C17.0976 8.68342 17.0976 9.31658 16.7071 9.70711C16.3166 10.0976 15.6834 10.0976 15.2929 9.70711L11 5.41421V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V5.41421L4.70711 9.70711C4.31658 10.0976 3.68342 10.0976 3.29289 9.70711Z" />
              </svg>
            </button>
            <br />
            <a className={tailwind('group mt-2 inline-block rounded-sm hover:text-gray-600 focus:outline-none focus:ring')} href="/">
              <span className={tailwind('pl-0.5')}>Go home</span>
              <svg className={tailwind('mb-1 ml-1 inline-block w-5 text-gray-400 group-hover:text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.7071 2.29289C10.3166 1.90237 9.68342 1.90237 9.29289 2.29289L2.29289 9.29289C1.90237 9.68342 1.90237 10.3166 2.29289 10.7071C2.68342 11.0976 3.31658 11.0976 3.70711 10.7071L4 10.4142V17C4 17.5523 4.44772 18 5 18H7C7.55228 18 8 17.5523 8 17V15C8 14.4477 8.44772 14 9 14H11C11.5523 14 12 14.4477 12 15V17C12 17.5523 12.4477 18 13 18H15C15.5523 18 16 17.5523 16 17V10.4142L16.2929 10.7071C16.6834 11.0976 17.3166 11.0976 17.7071 10.7071C18.0976 10.3166 18.0976 9.68342 17.7071 9.29289L10.7071 2.29289Z" />
              </svg>
            </a>
          </div>
        </div>
        <Footer />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

export default connect(mapStateToProps)(withTailwind(About));
