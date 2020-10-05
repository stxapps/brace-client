import React from 'react';

import { SHOW_BLANK } from '../types/const';

import TopBar from './TopBar';
import Footer from './Footer';

import shortLogo from '../images/logo-short.svg';
import blockstackShort from '../images/blockstack-short.svg';
import reactReduxGrid from '../images/react-redux-grid.png';
import undrawShareLink from '../images/undraw-share-link.svg';

class About extends React.PureComponent {

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="px-4 bg-gray-200 min-h-screen md:px-6 lg:px-8">
        <TopBar rightPane={SHOW_BLANK} />
        <section className="pt-12 pb-4">
          <div style={{ borderRadius: '1.5rem' }} className="mx-auto px-4 pt-8 pb-8 w-full max-w-3xl bg-white text-gray-800">
            <h1 className="text-2xl text-gray-900 font-semibold">About</h1>
            <div className="pt-8">
              <p className="max-w-lg leading-relaxed text-justify hyphens-auto">
                <img className="mx-4 mt-2 mb-4 float-right h-20" src={shortLogo} alt="Brace logo" />
                Brace.to is a service to help people save links around the web. We provide simple, easy and convenient ways for saving links to interesting articles, websites, items on online shops, videos, music, and whatever comes across while scrolling. Users can save links at our website or at an address bar. Then all saved links can be viewed and visited on any users' device anytime. Our goal is to provide our users the best experience. We're inspired by <a className="underline focus:outline-none focus:shadow-outline" href="https://getpocket.com">Pocket</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://saved.io/">Saved.io</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://www.pinterest.com/">Pinterest</a>, and many more.
              </p>
            </div>
            <div className="ml-auto pt-12 max-w-md md:flex md:justify-end md:items-start md:max-w-none">
              <img className="mx-4 h-20 md:mx-0 md:mt-1" src={blockstackShort} alt="Blockstack logo" />
              <p className="mx-4 mt-4 leading-relaxed text-justify hyphens-auto md:mt-0 md:max-w-md">
                Privacy is at our heart. That's why we choose <a className="underline focus:outline-none focus:shadow-outline" href="https://blockstack.org/">Blockstack</a>. Blockstack provides tools and libraries for building a website that respects our users' privacy. User identities live in blockchain securely and cannot be locked, banned, or deleted by Brace.to or anyone. All links at Brace.to is encrypted, no one can see their content. Brace.to cannot see what links users save. Also, users can setup their own server to save links if they want.
              </p>
            </div>
            <div className="pt-12 max-w-xl">
              <img className="mx-auto w-full max-w-md" src={reactReduxGrid} alt="React, Redux, and Stack Grid logos" />
              <p className="leading-relaxed text-justify hyphens-auto">
                Brace.to is open sourced and published at <a className="underline focus:outline-none focus:shadow-outline" href="https://github.com/bracedotto">Github.com</a>. It's built with many tools and libraries. The list is not exhausive and continue to grow: <a className="underline focus:outline-none focus:shadow-outline" href="https://reactjs.org/">React</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://create-react-app.dev/">Create React App</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://react-redux.js.org/">React Redux</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://redux.js.org">Redux</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://github.com/reduxjs/redux-thunk">Redux Thunk</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://redux-loop.js.org/">Redux Loop</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://github.com/rt2zz/redux-persist">Redux Persist</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://github.com/redux-offline/redux-offline">Redux Offline</a>, and <a className="underline focus:outline-none focus:shadow-outline" href="https://tsuyoshiwada.github.io/react-stack-grid">React Stack Grid</a>. Brace.to cannot go this far without these tools and libraries. Really appreciate.
                </p>
            </div>
            <div className="pt-12 md:flex md:justify-end md:items-center">
              <img className="ml-4 flex-shrink-0 w-full max-w-xs md:ml-0 md:w-64" src={undrawShareLink} alt="unDraw share link illustration" />
              <p className="mt-4 ml-4 max-w-xl leading-relaxed text-justify hyphens-auto md:mt-0">
                We know that design is very important. Our user interface needs to be slick, intuitive, and beautiful. We use <a className="underline focus:outline-none focus:shadow-outline" href="https://www.figma.com/">Figma</a> to design and <a className="underline focus:outline-none focus:shadow-outline" href="https://tailwindcss.com/">TailwindCSS</a> to style. Many icons and illustrations are from <a className="underline focus:outline-none focus:shadow-outline" href="https://www.heroicons.com/">Heroicons</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://iconmonstr.com/">iconmonstr</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://undraw.co/">unDraw.co</a>, <a className="underline focus:outline-none focus:shadow-outline" href="https://loading.io/">Loading.io</a>, and <a className="underline focus:outline-none focus:shadow-outline" href="https://connoratherton.com/loaders">Loaders.css</a>. We learn a lot from Adam Wathan's <a className="underline focus:outline-none focus:shadow-outline" href="https://www.youtube.com/channel/UCy1H38XrN7hi7wHSClfXPqQ">youtube channel</a> and <a className="underline focus:outline-none focus:shadow-outline" href="https://refactoringui.com/">RefactoringUI book</a> from Steve Schoger. We'd like to thank all of them very much.
                  </p>
            </div>
            <p className="pt-12 max-w-lg leading-relaxed text-justify hyphens-auto" >
              Currently, Brace.to is free. In the future, we plan to have a subscription plan like $0.99 US Dollar per year. We believe if our service is useful, our users will support us.We wouldn't force it in any way. If users aren't ready, they will always be able to close the popup and continue using.
            </p>
            <p className="pt-12 leading-relaxed">
              Brace Team
              <br />
              <a className="focus:outline-none focus:shadow-outline" href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;%73%75%70%70%6F%72%74%40%62%72%61%63%65%2E%74%6F">
                <span className="e-mail" data-user="troppus" data-website="ot.ecarb"></span>
              </a>
            </p>
            <div className="pt-12 text-right">
              <button className="focus:outline-none focus:shadow-outline" onClick={() => window.scrollTo(0, 0)}>
                <span>Back to top</span>
                <svg className="mb-1 ml-1 inline-block w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.29289 9.70711C2.90237 9.31658 2.90237 8.68342 3.29289 8.29289L9.29289 2.29289C9.68342 1.90237 10.3166 1.90237 10.7071 2.29289L16.7071 8.29289C17.0976 8.68342 17.0976 9.31658 16.7071 9.70711C16.3166 10.0976 15.6834 10.0976 15.2929 9.70711L11 5.41421V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V5.41421L4.70711 9.70711C4.31658 10.0976 3.68342 10.0976 3.29289 9.70711Z" />
                </svg>
              </button>
              <br />
              <a className="mt-2 inline-block focus:outline-none focus:shadow-outline" href="/">
                <span>Go home</span>
                <svg className="mb-1 ml-1 inline-block w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.7071 2.29289C10.3166 1.90237 9.68342 1.90237 9.29289 2.29289L2.29289 9.29289C1.90237 9.68342 1.90237 10.3166 2.29289 10.7071C2.68342 11.0976 3.31658 11.0976 3.70711 10.7071L4 10.4142V17C4 17.5523 4.44772 18 5 18H7C7.55228 18 8 17.5523 8 17V15C8 14.4477 8.44772 14 9 14H11C11.5523 14 12 14.4477 12 15V17C12 17.5523 12.4477 18 13 18H15C15.5523 18 16 17.5523 16 17V10.4142L16.2929 10.7071C16.6834 11.0976 17.3166 11.0976 17.7071 10.7071C18.0976 10.3166 18.0976 9.68342 17.7071 9.29289L10.7071 2.29289Z" />
                </svg>
              </a>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }
}

export default About;
