import React from 'react';

import { SHOW_BLANK } from '../types/const';

import TopBar from './TopBar';
import Footer from './Footer';

class Terms extends React.PureComponent {

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <React.Fragment>
        <TopBar rightPane={SHOW_BLANK} />
        <div className="mx-auto px-4 pt-16 pb-4 w-full max-w-3xl bg-white text-gray-500 md:px-6 lg:px-8">
          <h1 className="text-3xl text-gray-900 font-extrabold text-center sm:text-4xl">Terms of Use</h1>
          <h2 className="pt-6 text-xl text-gray-900 font-semibold">Intro</h2>
          <p className="pt-3 leading-7">By accessing the website at <a className="text-gray-900 font-medium underline rounded-sm focus:outline-none focus:ring" href="https://brace.to">https://brace.to</a>, you are agreeing to be bound by these terms of use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
          <p className="pt-5 leading-7">The following terminology applies to these Terms of use, Privacy statement and Disclaimer notice and any or all Agreements: "Client", "You" and "Your" refer to you, the person accessing this website and accepting the Company's terms of use. "The Company", "Ourselves", "We", "Our", "Us", and "Brace.to" refer to our Company. "Party" or "Parties" refer to both the Client and ourselves, or either the Client or ourselves. Any use of the above terminology or other words in the singular, plural, capitalisation and/or he/she or they, are taken as interchangeable and therefore as referring to same.</p>

          <h2 className="pt-8 text-xl text-gray-900 font-semibold">License</h2>
          <p className="pt-3 leading-7">Unless otherwise stated, Brace.to and/or it's licensors own the intellectual property rights for all material on Brace.to. All intellectual property rights are reserved. You may view and/or print pages from https://brace.to for your own personal use subject to restrictions set in these terms of use.</p>
          <p className="pt-5 leading-7">You must not:</p>
          <ol className="list-disc">
            <li className="ml-8">Republish material from https://brace.to</li>
            <li className="ml-8">Sell, rent or sub-license material from https://brace.to</li>
            <li className="ml-8">Reproduce, duplicate or copy material from https://brace.to</li>
            <li className="ml-8">Redistribute content from Brace.to (unless content is specifically made for redistribution)</li>
          </ol>

          <h2 className="pt-8 text-xl text-gray-900 font-semibold">Disclaimer</h2>
          <p className="pt-3 leading-7">The materials on Brace.to's website are provided on an 'as is' basis. Brace.to makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          <p className="pt-5 leading-7">Further, Brace.to does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</p>

          <h2 className="pt-8 text-xl text-gray-900 font-semibold">Limitations</h2>
          <p className="pt-3 leading-7">In no event shall Brace.to or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Brace.to's website, even if Brace.to or a Brace.to authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>

          <h2 className="pt-8 text-xl text-gray-900 font-semibold">Accuracy of materials</h2>
          <p className="pt-3 leading-7">The materials appearing on Brace.to's website could include technical, typographical, or photographic errors. Brace.to does not warrant that any of the materials on its website are accurate, complete or current. Brace.to may make changes to the materials contained on its website at any time without notice. However Brace.to does not make any commitment to update the materials.</p>

          <h2 className="pt-8 text-xl text-gray-900 font-semibold">Links</h2>
          <p className="pt-3 leading-7">Brace.to has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Brace.to of the site. Use of any such linked website is at the user's own risk.</p>

          <h2 className="pt-8 text-xl text-gray-900 font-semibold">Modifications</h2>
          <p className="pt-3 leading-7">Brace.to may revise these terms of use for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of use.</p>

          <p className="pt-5 leading-7">If you have any questions regarding any of our terms, please contact us at <a className="text-gray-900 font-medium underline rounded-sm focus:outline-none focus:ring" href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#64;&#98;&#114;&#97;&#99;&#101;&#46;&#116;&#111;"><span className="e-mail" data-user="troppus" data-website="ot.ecarb"></span></a>.</p>
          <div className="pt-12 text-right">
            <button className="group rounded-sm hover:text-gray-600 focus:outline-none focus:ring" onClick={() => window.scrollTo(0, 0)}>
              <span className="pl-1">Back to top</span>
              <svg className="mb-1 ml-1 inline-block w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.29289 9.70711C2.90237 9.31658 2.90237 8.68342 3.29289 8.29289L9.29289 2.29289C9.68342 1.90237 10.3166 1.90237 10.7071 2.29289L16.7071 8.29289C17.0976 8.68342 17.0976 9.31658 16.7071 9.70711C16.3166 10.0976 15.6834 10.0976 15.2929 9.70711L11 5.41421V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V5.41421L4.70711 9.70711C4.31658 10.0976 3.68342 10.0976 3.29289 9.70711Z" />
              </svg>
            </button>
            <br />
            <a className="mt-2 inline-block group rounded-sm hover:text-gray-600 focus:outline-none focus:ring" href="/">
              <span className="pl-0.5">Go home</span>
              <svg className="mb-1 ml-1 inline-block w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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

export default Terms;
