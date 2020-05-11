import React from 'react';
import { connect } from 'react-redux';

import {
  MY_LIST,
  ADDING, ADDED, DIED_ADDING,
  URL_QUERY_CLOSE_KEY, URL_QUERY_CLOSE_WINDOW,
} from '../types/const';
import { signUp, signIn, addLink, cancelDiedLinks } from '../actions';
import { validateUrl, separateUrlAndParam, isEqual, ensureContainUrlProtocol } from '../utils';

import Loading from './Loading';

import shortLogo from '../images/logo-short.svg';
import fullLogo from '../images/logo-full.svg';

const BRACE_URL = 'https://brace.to/';
const LOCALHOST = 'http://localhost:3000/';

class Adding extends React.Component {

  state = {
    isValid: null,
    msg: null,
    doAskConfirm: null,
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

    if (href.startsWith(BRACE_URL)) {
      addingUrl = href.substring(BRACE_URL.length);
    } else if (href.startsWith(LOCALHOST)) {
      addingUrl = href.substring(LOCALHOST.length);
    }

    const [isValid, msg, doAskConfirm] = validateUrl(addingUrl);
    if (!isValid && !doAskConfirm) {
      this.updateState({ isValid, msg, doAskConfirm });
      return;
    }

    [addingUrl, param] = separateUrlAndParam(addingUrl, URL_QUERY_CLOSE_KEY);

    let { hasAskedConfirm } = this.state;
    if ((!isValid && !hasAskedConfirm) || !isUserSignedIn) {
      this.updateState({ isValid, msg, doAskConfirm, addingUrl, param });
      return;
    }

    let link = this.getLinkFromAddingUrl(addingUrl)
    if (doCancelDiedLink) {
      if (link && link.status === DIED_ADDING) {
        this.props.cancelDiedLinks([link.id]);
        link = null;
      }
    }
    if (!link) this.props.addLink(addingUrl);

    this.updateState({ isValid, msg, doAskConfirm, addingUrl, param });
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

  renderHeader() {
    return (
      <div>
        <div className="relative w-40">
          <img className="h-8 md:hidden" src={shortLogo} alt="Brace logo" />
          <img className="hidden h-8 md:block" src={fullLogo} alt="Brace logo" />
          <span className="absolute text-xs" style={{ top: '-9px', right: '-26px' }}>beta</span>
        </div>
      </div>
    );
  }

  renderNav() {

    const { isUserSignedIn } = this.props;
    const { isValid, addingUrl, param } = this.state;

    const addingPUrl = ensureContainUrlProtocol(addingUrl);

    let leftLink = isValid ? <a href={addingPUrl}>Back to the link</a> : <div></div>;
    let centerText = null;
    let rightLink = <a href="/">{isUserSignedIn ? 'Go to My List' : 'Go to Brace.to'}</a>

    if (param && param[URL_QUERY_CLOSE_KEY]) {
      if (param[URL_QUERY_CLOSE_KEY] === URL_QUERY_CLOSE_WINDOW) {
        leftLink = null;
        centerText = <p>You can close this window now.</p>;
        rightLink = null;
      }
    }

    return (
      <div className="flex justify-between content-center">
        {leftLink}
        {centerText}
        {rightLink}
      </div>
    );
  }

  renderAdding() {

    const { addingUrl } = this.props;

    return (
      <React.Fragment>
        {this.renderHeader()}
        <div>
          <h3>Adding</h3>
          <p>{addingUrl} is being added...</p>
          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
          <p>Please wait a moment</p>
        </div>
      </React.Fragment>
    );
  }

  renderAdded() {

    const { addingUrl } = this.state;
    const addingPUrl = ensureContainUrlProtocol(addingUrl);

    let content = <p><a href={addingPUrl}>{addingUrl}</a>{` has been saved in ${MY_LIST}.`}</p>

    return (
      <React.Fragment>
        {this.renderHeader()}
        <svg className="w-10 h-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" stroke="currentColor" strokeWidth="0">
          <path d="M165 0C74.019 0 0 74.019 0 165s74.019 165 165 165 165-74.019 165-165S255.981 0 165 0zm0 300c-74.44 0-135-60.561-135-135S90.56 30 165 30s135 60.561 135 135-60.561 135-135 135z" stroke="none" />
          <path d="M226.872 106.664l-84.854 84.853-38.89-38.891c-5.857-5.857-15.355-5.858-21.213-.001-5.858 5.858-5.858 15.355 0 21.213l49.496 49.498a15 15 0 0010.606 4.394h.001c3.978 0 7.793-1.581 10.606-4.393l95.461-95.459c5.858-5.858 5.858-15.355 0-21.213-5.858-5.858-15.355-5.859-21.213-.001z" stroke="none" />
        </svg>
        {content}
        {this.renderNav()}
      </React.Fragment>
    );
  }

  renderDiedAdding() {
    return (
      <React.Fragment>
        {this.renderHeader()}
        <div>
          <h3>Opps...</h3>
          <p>Something went wrong! Please wait a moment and try again. If the problem persists, please contact us.</p>
          <button onClick={() => this.addLink(true)}>Try again</button>
        </div>
        {this.renderNav()}
      </React.Fragment>
    );
  }

  renderAskingConfirm() {

    const { msg } = this.state;

    return (
      <React.Fragment>
        {this.renderHeader()}
        <div>
          <h3 className="text-lg bold text-center">Asking confirm</h3>
          <p>{msg}</p>
          <button onClick={this.onAskingConfirmOkBtnClick}>Sure</button>
          <p>You can edit at the address bar and press enter again</p>
        </div>
        {this.renderNav()}
      </React.Fragment>
    );
  }

  renderInvalid() {
    const { msg } = this.state;

    return (
      <React.Fragment>
        {this.renderHeader()}
        <div>
          <h3 className="text-lg bold text-center">Invalid</h3>
          <p>{msg}</p>
          <p>You can edit at the address bar and press enter again</p>
        </div>
        {this.renderNav()}
      </React.Fragment>
    );
  }

  renderNotSignedIn() {
    return (
      <React.Fragment>
        {this.renderHeader()}
        <div>
          <h3 className="text-lg bold text-center">Not signed in</h3>
          <p>Please sign in before</p>
          <button onClick={() => this.props.signIn()} className="px-3 py-2 border-2 border-gray-900">Sign in</button>
          <p>No account yet?</p>
          <button onClick={() => this.props.signUp()} className="px-3 py-2 border-2 border-gray-900">Sign up</button>
        </div>
        {this.renderNav()}
      </React.Fragment>
    );
  }

  renderInOtherProcessing() {
    return (
      <React.Fragment>
        {this.renderHeader()}
        <div>
          <h3 className="text-lg bold text-center">Already exists</h3>
          <p>It seems the link already exists and being processed. Please go to <a href="/">My List</a> for more information. (You can search this link and see its status.)</p>
        </div>
        {this.renderNav()}
      </React.Fragment>
    );
  }

  render() {

    const { isUserSignedIn } = this.props;
    if (!isUserSignedIn) {
      return this.renderNotSignedIn();
    }

    const { isValid, doAskConfirm, addingUrl } = this.state;

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

    if (isValid === false && doAskConfirm) {
      return this.renderAskingConfirm();
    }
    if (isValid === false) {
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
  }
};

export default connect(mapStateToProps, { signUp, signIn, addLink, cancelDiedLinks })(Adding);
