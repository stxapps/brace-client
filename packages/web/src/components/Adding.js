import React from 'react';
import { connect } from 'react-redux';

import {
  HASH_SUPPORT, SIGN_UP_POPUP, SIGN_IN_POPUP, MY_LIST, ADDING, ADDED, DIED_ADDING,
  URL_QUERY_CLOSE_KEY, URL_QUERY_CLOSE_WINDOW, SHOW_BLANK, VALID_URL, NO_URL,
  ASK_CONFIRM_URL, URL_MSGS, BLK_MODE,
} from '../types/const';
import { updatePopup, addLink, cancelDiedLinks } from '../actions';
import { getThemeMode } from '../selectors';
import {
  getUrlPathQueryHash,
  validateUrl, separateUrlAndParam, ensureContainUrlProtocol,
  isEqual,
  truncateString,
} from '../utils';

import { withTailwind } from '.';
import Loading from './Loading';
import TopBar from './TopBar';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';

const MAX_LINK_LENGTH = 157;

class Adding extends React.PureComponent {

  state = {
    urlValidatedResult: null,
    addingUrl: null,
    param: null,
    hasAskedConfirm: false,
  };

  componentDidMount() {
    this.addLink(true);
  }

  componentDidUpdate() {
    this.addLink(false);
  }

  addLink(doCancelDiedLink = false) {
    const { isUserSignedIn, href } = this.props;

    let addingUrl = null, param = {};

    addingUrl = getUrlPathQueryHash(href);

    const urlValidatedResult = validateUrl(addingUrl);
    if (urlValidatedResult === NO_URL) {
      this.updateState({ urlValidatedResult });
      return;
    }

    const res = separateUrlAndParam(addingUrl, URL_QUERY_CLOSE_KEY);
    [addingUrl, param] = [res.separatedUrl, res.param];

    let { hasAskedConfirm } = this.state;
    if ((urlValidatedResult === ASK_CONFIRM_URL && !hasAskedConfirm) || !isUserSignedIn) {
      this.updateState({ urlValidatedResult, addingUrl, param });
      return;
    }

    let link = this.getLinkFromAddingUrl(addingUrl);
    if (doCancelDiedLink) {
      if (link && link.status === DIED_ADDING) {
        this.props.cancelDiedLinks([link.id]);
        link = null;
      }
    }
    if (!link) this.props.addLink(addingUrl, MY_LIST, false);

    this.updateState({ urlValidatedResult, addingUrl, param });
  }

  getLinkFromAddingUrl(addingUrl) {

    if (!addingUrl) return null;

    const { links } = this.props;

    for (const _id in links) {
      if (links[_id].url === addingUrl) {
        return links[_id];
      }
    }

    return null;
  }

  updateState(newState) {
    if (this.shouldSetState(newState, this.state)) this.setState(newState);
  }

  shouldSetState(newState, oldState) {
    for (const key in newState) {
      if (!isEqual(newState[key], oldState[key])) return true;
    }
    return false;
  }

  onAskingConfirmOkBtnClick = () => {
    this.setState({ hasAskedConfirm: true });
  }

  onSignUpBtnClick = () => {
    this.props.updatePopup(SIGN_UP_POPUP, true);
  }

  onSignInBtnClick = () => {
    this.props.updatePopup(SIGN_IN_POPUP, true);
  }

  _processAddingUrl(addingUrl) {
    return {
      addingPUrl: ensureContainUrlProtocol(addingUrl),
      addingTUrl: truncateString(addingUrl, MAX_LINK_LENGTH),
    };
  }

  _render(content) {
    const { tailwind } = this.props;

    return (
      <div className={tailwind('min-h-screen bg-white blk:bg-gray-900')}>
        <TopBar rightPane={SHOW_BLANK} doSupportTheme={true} />
        <div className={tailwind('mx-auto w-full max-w-md px-4 pt-28 md:px-6 md:pt-36 lg:px-8')}>
          {content}
        </div>
        <SignUpPopup />
        <SignInPopup />
      </div>
    );
  }

  renderNav() {
    const { isUserSignedIn, tailwind } = this.props;
    const { urlValidatedResult, addingUrl, param } = this.state;

    const { addingPUrl } = this._processAddingUrl(addingUrl);

    let rightLink = <a className={tailwind('block rounded-sm text-right text-base font-medium leading-none text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200')} href="/">{isUserSignedIn ? 'Go to My List >' : 'Go to Brace.to >'}</a>
    let centerText = null;
    let leftLink = urlValidatedResult === VALID_URL ? <a className={tailwind('mt-6 block rounded-sm text-left text-base leading-none text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200 md:mt-0')} href={addingPUrl}>Back to the link</a> : <div />;

    if (param && param[URL_QUERY_CLOSE_KEY]) {
      if (param[URL_QUERY_CLOSE_KEY] === URL_QUERY_CLOSE_WINDOW) {
        leftLink = null;
        centerText = <button onClick={() => window.close()} className={tailwind('block w-full rounded-sm py-2 text-center text-base text-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-200')}>Close this window</button>;
        rightLink = null;
      }
    }

    return (
      <div className={tailwind('mt-16 md:flex md:flex-row-reverse md:items-baseline md:justify-between')}>
        {rightLink}
        {centerText}
        {leftLink}
      </div>
    );
  }

  renderAdding() {
    const { tailwind } = this.props;
    const { addingPUrl, addingTUrl } = this._processAddingUrl(this.state.addingUrl);

    const content = (
      <React.Fragment>
        <div className={tailwind('flex h-24 items-center justify-center')}>
          <div className={tailwind('lds-ellipsis')}>
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
            <div className={tailwind('bg-gray-400 blk:bg-gray-400')} />
          </div>
        </div>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>
          <a className={tailwind('break-all rounded-sm hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={addingPUrl} target="_blank" rel="noreferrer">{addingTUrl}</a>
          <br />
          <span className={tailwind('break-normal text-lg font-semibold text-gray-900 blk:text-gray-50')}>is being saved.</span>
        </p>
      </React.Fragment>
    );

    return this._render(content);
  }

  renderAdded() {
    const { themeMode, tailwind } = this.props;
    const { addingPUrl, addingTUrl } = this._processAddingUrl(this.state.addingUrl);

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24')} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)'} />
          <path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(22, 101, 52)' : 'rgb(21, 128, 61)'} />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>
          <a className={tailwind('break-all rounded-sm hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={addingPUrl} target="_blank" rel="noreferrer">{addingTUrl}</a>
          <br />
          <span className={tailwind('break-normal text-lg font-semibold text-gray-900 blk:text-gray-50')}>has been saved.</span>
        </p>
        {this.renderNav()}
      </React.Fragment>
    );

    return this._render(content);
  }

  renderDiedAdding() {
    const { tailwind } = this.props;

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24 text-red-600 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-lg font-semibold text-gray-800 blk:text-gray-100')}>Oops..., something went wrong!</p>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-left text-base leading-relaxed text-gray-500 blk:text-gray-400 sm:text-center')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded underline hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us
          <svg className={tailwind('mb-2 inline-block w-4')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </svg></a>.
        </p>
        <button onClick={() => this.addLink(true)} className={tailwind('group mx-auto mt-5 mb-px block h-14 focus:outline-none')}>
          <span className={tailwind('rounded-full border border-gray-400 bg-white px-3 py-2 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>Try again</span>
        </button>
        {this.renderNav()}
      </React.Fragment>
    );

    return this._render(content);
  }

  renderAskingConfirm() {
    const { tailwind } = this.props;
    const { addingPUrl, addingTUrl } = this._processAddingUrl(this.state.addingUrl);

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24 text-yellow-500 blk:text-yellow-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM10 7C9.63113 7 9.3076 7.19922 9.13318 7.50073C8.85664 7.97879 8.24491 8.14215 7.76685 7.86561C7.28879 7.58906 7.12543 6.97733 7.40197 6.49927C7.91918 5.60518 8.88833 5 10 5C11.6569 5 13 6.34315 13 8C13 9.30622 12.1652 10.4175 11 10.8293V11C11 11.5523 10.5523 12 10 12C9.44773 12 9.00001 11.5523 9.00001 11V10C9.00001 9.44772 9.44773 9 10 9C10.5523 9 11 8.55228 11 8C11 7.44772 10.5523 7 10 7ZM10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15Z" />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>
          <a className={tailwind('break-all rounded-sm hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={addingPUrl} target="_blank" rel="noreferrer">{addingTUrl}</a>
          <br />
          <span className={tailwind('break-normal text-lg font-semibold text-gray-900 blk:text-gray-50')}>looks like an invalid link. Are you sure?</span>
        </p>
        <button onClick={this.onAskingConfirmOkBtnClick} className={tailwind('group mx-auto mt-5 mb-px block h-14 focus:outline-none')}>
          <span className={tailwind('rounded-full border border-gray-400 bg-white px-3 py-2 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>Yes, I'm sure</span>
        </button>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-sm tracking-wide text-gray-500 blk:text-gray-400')}>You can edit the link in address bar and press enter again</p>
        {this.renderNav()}
      </React.Fragment>
    );

    return this._render(content);
  }

  renderInvalid() {
    const { tailwind } = this.props;
    const msg = URL_MSGS[this.state.urlValidatedResult];

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24 text-red-600 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-red-700 blk:text-red-600')}>{msg}</p>
        {this.renderNav()}
      </React.Fragment>
    );

    return this._render(content);
  }

  renderNotSignedIn() {
    const { tailwind } = this.props;

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24 text-yellow-600 blk:text-yellow-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>Please sign in first</p>
        <button onClick={this.onSignInBtnClick} className={tailwind('group mx-auto mt-2 block h-14 focus:outline-none')}>
          <span className={tailwind('rounded-full border border-gray-400 bg-white px-3 py-1.5 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:group-hover:border-gray-300 blk:group-hover:text-gray-200')}>Sign in</span>
        </button>
        <div className={tailwind('mt-10 flex items-center justify-center')}>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>No account yet?</p>
          <button onClick={this.onSignUpBtnClick} className={tailwind('ml-2 rounded-sm text-base font-medium text-gray-600 hover:text-gray-700 focus:outline-none focus:ring blk:text-gray-300 blk:hover:text-gray-100')}>Sign up</button>
        </div>
        {this.renderNav()}
      </React.Fragment>
    );

    return this._render(content);
  }

  renderInOtherProcessing() {
    const { themeMode, tailwind } = this.props;
    const { addingPUrl, addingTUrl } = this._processAddingUrl(this.state.addingUrl);

    const content = (
      <React.Fragment>
        <svg className={tailwind('mx-auto h-24')} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)'} />
          <path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill={themeMode === BLK_MODE ? 'rgb(22, 101, 52)' : 'rgb(21, 128, 61)'} />
        </svg>
        <p className={tailwind('mx-auto mt-5 w-full max-w-xs text-center text-base text-gray-500 blk:text-gray-400')}>
          <a className={tailwind('break-all rounded-sm hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')} href={addingPUrl} target="_blank" rel="noreferrer">{addingTUrl}</a>
          <br />
          <span className={tailwind('break-normal text-lg font-semibold text-gray-900 blk:text-gray-50')}>already exists</span>
        </p>
        {this.renderNav()}
      </React.Fragment>
    );

    return this._render(content);
  }

  render() {

    const { isUserSignedIn } = this.props;
    if (!isUserSignedIn) {
      return this.renderNotSignedIn();
    }

    const { urlValidatedResult, addingUrl } = this.state;

    const link = this.getLinkFromAddingUrl(addingUrl);

    if (link && link.status === ADDED) {
      return this.renderAdded();
    }
    if (link && link.status === ADDING) {
      return this.renderAdding();
    }
    if (link && link.status === DIED_ADDING) {
      return this.renderDiedAdding();
    }
    if (link) {
      return this.renderInOtherProcessing();
    }

    if (urlValidatedResult === ASK_CONFIRM_URL) {
      return this.renderAskingConfirm();
    }
    if (urlValidatedResult === NO_URL) {
      return this.renderInvalid();
    }

    return <Loading />;
  }
}

const mapStateToProps = (state) => {
  return {
    isUserSignedIn: state.user.isUserSignedIn,
    href: state.window.href,
    links: state.links[MY_LIST],
    themeMode: getThemeMode(state),
    safeAreaWidth: state.window.width,
  }
};

const mapDispatchToProps = { updatePopup, addLink, cancelDiedLinks };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(Adding));
