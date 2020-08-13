import React from 'react';

import { SHOW_BLANK } from '../types/const';

import TopBar from './TopBar';
import Footer from './Footer';

class Privacy extends React.PureComponent {

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="px-4 bg-gray-200 min-h-screen md:px-6 lg:px-8">
        <TopBar rightPane={SHOW_BLANK} />
        <section className="pt-12 pb-4">
          <div style={{ borderRadius: '1.5rem' }} className="mx-auto px-4 pt-8 pb-8 w-full max-w-3xl bg-white text-gray-800">
            <h1 className="text-2xl text-gray-900 font-semibold">Privacy policy</h1>
            <p className="pt-6 leading-relaxed">This Privacy Policy applies to <a className="focus:outline-none focus:shadow-outline" href="https://brace.to">https://brace.to</a> (hereinafter, "us", "we", or "https://brace.to"). We respect your privacy and are committed to protecting personally identifiable information you may provide us through the Website. We have adopted this privacy policy ("Privacy Policy") to explain what information may be collected on our Website, how we use this information, and under what circumstances we may disclose the information. This Privacy Policy applies only to information we collect through the Website and does not apply to our collection of information from other sources.</p>
            <p className="pt-6 leading-relaxed">This Privacy Policy, together with the Terms of use posted on our Website, set forth the general rules and policies governing your use of our Website. Depending on your activities when visiting our Website, you may be required to agree to additional terms of use.</p>

            <h2 className="pt-10 text-gray-900 font-semibold">Website Visitors</h2>
            <p className="pt-3 leading-relaxed">Brace.to may collect non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request. If we do collect, the purpose in collecting non-personally identifying information is only to better understand how Brace.to's visitors use its website. Brace.to may release non-personally-identifying information in the aggregate, e.g., by publishing a report on trends in the usage of its website.</p>
            <p className="pt-3 leading-relaxed">Brace.to may collect potentially personally-identifying information like Internet Protocol (IP) addresses. If we do collect, the purpose in collecting potentially personally-identifying information is only to better understand how Brace.to's visitors use its website. Brace.to only discloses potentially personally-identifying information under the same circumstances that it uses and discloses personally-identifying information as described below.</p>

            <h2 className="pt-10 text-gray-900 font-semibold">Gathering of Personally-Identifying Information</h2>
            <p className="pt-3 leading-relaxed">Certain visitors to Brace.to's websites choose to interact with Brace.to in ways that require Brace.to to gather personally-identifying information. The amount and type of information that Brace.to gathers depends on the nature of the interaction. For example, we ask visitors who sign up at https://brace.to to provide a username and email address.</p>

            <h2 className="pt-10 text-gray-900 font-semibold">Security</h2>
            <p className="pt-3 leading-relaxed">The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>


            <h2 className="pt-10 text-gray-900 font-semibold">Links To External Sites</h2>
            <p className="pt-3 leading-relaxed">Our Service may contain links to external sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy and terms of use of every site you visit.</p>
            <p className="pt-3 leading-relaxed">We have no control over, and assume no responsibility for the content, privacy policies or practices of any third party sites, products or services.</p>

            <h2 className="pt-10 text-gray-900 font-semibold">Protection of Certain Personally-Identifying Information</h2>
            <p className="pt-3 leading-relaxed">Brace.to discloses potentially personally-identifying and personally-identifying information only to those of its employees, contractors and affiliated organizations that (i) need to know that information in order to process it on Brace.to's behalf or to provide services available at Brace.to's website, and (ii) that have agreed not to disclose it to others. Some of those employees, contractors and affiliated organizations may be located outside of your home country; by using Brace.to's website, you consent to the transfer of such information to them. Brace.to will not rent or sell potentially personally-identifying and personally-identifying information to anyone. Other than to its employees, contractors and affiliated organizations, as described above, Brace.to discloses potentially personally-identifying and personally-identifying information only in response to a subpoena, court order or other governmental request, or when Brace.to believes in good faith that disclosure is reasonably necessary to protect the property or rights of Brace.to, third parties or the public at large.</p>
            <p className="pt-3 leading-relaxed">If you are a registered user of https://brace.to and have supplied your email address, Brace.to may occasionally send you an email to tell you about new features, solicit your feedback, or just keep you up to date with what's going on with Brace.to and our products. We primarily use our blog to communicate this type of information, so we expect to keep this type of email to a minimum. If you send us a request (for example via a support email or via one of our feedback mechanisms), we reserve the right to publish it in order to help us clarify or respond to your request or to help us support other users. Brace.to takes all measures reasonably necessary to protect against the unauthorized access, use, alteration or destruction of potentially personally-identifying and personally-identifying information.</p>

            <h2 className="pt-10 text-gray-900 font-semibold">Aggregated Statistics</h2>
            <p className="pt-3 leading-relaxed">Brace.to may collect statistics about the behavior of visitors to its website. Brace.to may display this information publicly or provide it to others. However, Brace.to does not disclose your personally-identifying information.</p>

            <h2 className="pt-10 text-gray-900 font-semibold">Cookies</h2>
            <p className="pt-3 leading-relaxed">Brace.to does not use "Cookies". We use local storage provided by your browser to store your preferences which is considered safer and more privacy friendly. The purpose is to display personalized content, enrich and perfect your online experience.</p>
            <p className="pt-3 leading-relaxed">There is a string of information that our website stores in your browser's local storage, and that your browser provides to our website each time you return. Brace.to uses this to help identify and track visitors, their usage of https://brace.to, and their website access preferences. Brace.to visitors who do not wish to allow this should set their browsers to disable local storage before using Brace.to, with the drawback that certain features of Brace.to may not function properly.</p>
            <p>By continuing to navigate our website without changing your browser's local storage settings, you hereby acknowledge and agree to Brace.to's use of local storage.</p>

            <h2 className="pt-10 text-gray-900 font-semibold">Privacy Policy Changes</h2>
            <p className="pt-3 leading-relaxed">Although most changes are likely to be minor, Brace.to may change its Privacy Policy from time to time, and in Brace.to's sole discretion. Brace.to encourages visitors to frequently check this page for any changes to its Privacy Policy. Your continued use of this site after any change in this Privacy Policy will constitute your acceptance of such change.</p>
            <p className="pt-10 leading-relaxed">
              Your continued use of our website will be regarded as acceptance of our privacy policy. If you have any questions about this Privacy Policy, please contact us at&nbsp;
              <a className="focus:outline-none focus:shadow-outline" href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;%73%75%70%70%6F%72%74%40%62%72%61%63%65%2E%74%6F">
                <span className="e-mail" data-user="troppus" data-website="ot.ecarb"></span>
              </a>
            </p>
            <p className="pt-10 leading-relaxed">
              This policy is effective as of 25 May 2020.
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

export default Privacy;
