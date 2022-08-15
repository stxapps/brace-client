import React from 'react';
import { connect } from 'react-redux';

import { SHOW_BLANK } from '../types/const';

import { withTailwind } from '.';
import TopBar from './TopBar';
import Footer from './Footer';

class Privacy extends React.PureComponent {

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { tailwind } = this.props;

    return (
      <React.Fragment>
        <TopBar rightPane={SHOW_BLANK} />
        <div className={tailwind('mx-auto w-full max-w-3xl bg-white px-4 pt-16 pb-4 text-gray-500 md:px-6 lg:px-8')}>
          <h1 className={tailwind('text-center text-3xl font-extrabold text-gray-900 sm:text-4xl')}>Privacy Policy</h1>
          <p className={tailwind('pt-8 leading-7')}>This Privacy Policy is effective as of 06 May 2022.</p>
          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Summary</h2>
          <p className={tailwind('pt-3 leading-7')}>We don't rent, sell or share your information with other companies or advertisers. Our optional paid subscription is the only way we make money, so our incentives are aligned with yours.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Intro</h2>
          <p className={tailwind('pt-3 leading-7')}>At <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="https://www.stxapps.com" target="_blank" rel="noreferrer">STX App Co., Ltd.</a>, we believe you have the right to know how your data is being used, and that businesses should align their incentives with their customers'. In our case, as a software company, we take great pride in the fact that we only make money if you choose to upgrade to our optional paid subscription, which means we never have to sell data or clutter up the interface with annoying ads.</p>
          <p className={tailwind('pt-5 leading-7')}>To be totally transparent, we created this Privacy Policy to explain, in plain English, how we handle data, including any "Personally identifiable information" (PII). PII, as used in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our Privacy Policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your data.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Information We Collect and How We Use Information</h2>
          <p className={tailwind('pt-3 leading-7')}>We may collect non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each user request. If we do collect, the purpose in collecting non-personally identifying information is only to better understand how our users use our services. We may release non-personally-identifying information in the aggregate, e.g., by publishing a report on trends in the usage of our website.</p>
          <p className={tailwind('pt-5 leading-7')}>We may collect potentially personally-identifying information like Internet Protocol (IP) addresses. If we do collect, the purpose in collecting potentially personally-identifying information is only to better understand how our users use our services. We only disclose potentially personally-identifying information under the same circumstances that we use and disclose personally-identifying information as described below.</p>
          <p className={tailwind('pt-5 leading-7')}>We may collect personally-identifying information like user ID and purchase history. If we do collect, the purpose in collecting personally-identifying information is only to provide our services, our products, and our supports. We only disclose personally-identifying information under the circumstances as described below.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Protection of Certain Personally-Identifying Information</h2>
          <p className={tailwind('pt-3 leading-7')}>We disclose potentially personally-identifying and personally-identifying information only to our employees, contractors and affiliated organizations that (i) need to know that information in order to process it on our behalf or to provide services available at our websites and our apps, and (ii) that have agreed not to disclose it to others. Some of our employees, contractors and affiliated organizations may be located outside of your home country; by using our services, you consent to the transfer of such information to them. We will not rent or sell potentially personally-identifying and personally-identifying information to anyone. Other than to our employees, contractors and affiliated organizations, as described above, we disclose potentially personally-identifying and personally-identifying information only in response to a subpoena, court order or other governmental request, or when we believe in good faith that disclosure is reasonably necessary to protect the property or rights of us, third parties or the public at large.</p>
          <p className={tailwind('pt-5 leading-7')}>If you have supplied your email address to us, we may occasionally send you an email to tell you about new features, solicit your feedback, or just keep you up to date with what's going on with our services and our products. We primarily use our blog or our social media to communicate this type of information, so we expect to keep this type of email to a minimum.</p>
          <p className={tailwind('pt-5 leading-7')}>If you choose to send us any message, feedback or data, including, but not limited to, any ideas, comments, suggestions or questions regarding any product or service, such information shall be deemed to be non-confidential. We shall have no obligation of any kind with respect to such information and shall be free to reproduce, use, disclose and distribute the information to others without limitation. Further, we shall be free to use any ideas, concepts, know-how or techniques contained in such information for any purpose whatsoever, including but not limited to developing, manufacturing and marketing products and services incorporating such ideas, concepts, know-how or techniques.</p>
          <p className={tailwind('pt-5 leading-7')}>We take all measures reasonably necessary to protect against the unauthorized access, use, alteration or destruction of potentially personally-identifying and personally-identifying information.</p>
          <p className={tailwind('pt-5 leading-7')}>If we are involved in a merger, acquisition, or sale of assets, we will continue to take measures to protect the confidentiality of personal information and give affected users notice before transferring any personal information to a new entity.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Aggregated Statistics</h2>
          <p className={tailwind('pt-3 leading-7')}>We may collect statistics about the behavior of our users to our services. We may display this information publicly or provide it to others. However, we do not disclose your personally-identifying information.</p>


          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Security</h2>
          <p className={tailwind('pt-3 leading-7')}>The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Cookies and Local Storage</h2>
          <p className={tailwind('pt-3 leading-7')}>We do not use "Cookies". We use local storage provided by your browser to store your preferences which is considered safer and more privacy friendly. The purpose is to display personalized content, enrich and perfect your online experience.</p>
          <p className={tailwind('pt-5 leading-7')}>There is a string of information that our website stores in your browser's local storage, and that your browser provides to our website each time you return. We use this to help identify our users and their website access preferences. Our visitors who do not wish to allow this should set their browsers to disable local storage before using our services, with the drawback that certain features of our services may not function properly.</p>
          <p className={tailwind('pt-5 leading-7')}>By continuing to navigate our website without changing your browser's local storage settings, you hereby acknowledge and agree to our use of local storage.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Data Retention</h2>
          <p className={tailwind('pt-3 leading-7')}>To determine the appropriate retention period for your personal information, we consider the amount, nature, and sensitivity of the personal information, the potential risk of harm from unauthorized use or disclosure of your personal information, the purposes for which we use your personal information and whether we can achieve those purposes through other means, and the applicable legal requirements. In certain circumstances, we can anonymize your personal information, subject to applicable law.</p>
          <p className={tailwind('pt-5 leading-7')}>The personally identifiable information we collect right now is your user ID and your purchase history which is only collected if you purchase a paid subscription because we need it to unlock additional features of our services to your account. We keep your user ID and your purchase history for as long as reasonably necessary i.e. as your subscription is valid and not expired or as required by law (for example, for legal, tax, accounting or other purposes).</p>
          <p className={tailwind('pt-5 leading-7')}>If you have supplied your email address to us, we retain your email address until you opt out of receiving our email communications.</p>
          <p className={tailwind('pt-5 leading-7')}>If you'd like to get your data on our servers, or to permanently delete your data, please contact us and we will take care of it for you as quickly as possible.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Data Transfers</h2>
          <p className={tailwind('pt-3 leading-7')}>Your data is stored on our servers hosted by Google Cloud Platform located in the United States. We may also store information on servers and equipment in other countries depending on a variety of factors, including the locations of our users and service providers. These data transfers allow us to provide our services to you. By accessing or using our services or otherwise providing information to us, you understand that your information will be processed, transferred, and stored in the U.S. and other countries, where different data protection standards may apply and/or you may not have the same rights as you do under local law.</p>

          <h2 className={tailwind('pt-8 text-xl font-semibold text-gray-900')}>Privacy Policy Changes</h2>
          <p className={tailwind('pt-3 leading-7')}>Although most changes are likely to be minor, we may change our Privacy Policy from time to time, and in our sole discretion. We encourage you to frequently check this page for any changes to its Privacy Policy. Your continued use of our services after any change in this Privacy Policy will constitute your acceptance of such change.</p>

          <p className={tailwind('pt-5 leading-7')}>Your continued use of our services will be regarded as acceptance of our privacy policy. If you have any questions about this Privacy Policy, please contact us at <a className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')} href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#64;&#98;&#114;&#97;&#99;&#101;&#46;&#116;&#111;"><span className={tailwind('e-mail')} data-user="troppus" data-website="ot.ecarb"></span></a>. Alternatively, you may contact us at:</p>
          <p className={tailwind('pt-3 leading-7')}>STX Apps Co., Ltd.<br />ATTN: Brace.to Team<br />247 Chan 31 Sathon<br />Bangkok 10120 TH</p>

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
    safeAreaWidth: state.window.width,
  };
};

export default connect(mapStateToProps)(withTailwind(Privacy));
