import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { updatePopup } from '../actions';
import { SIGN_IN_POPUP, SHOW_SIGN_IN, BLK_MODE } from '../types/const';
import { getSafeAreaWidth, getThemeMode } from '../selectors';

import { withTailwind } from '.';

import shortLogo from '../images/logo-short.svg';
import shortLogoBlk from '../images/logo-short-blk.svg';

class TopBar extends React.PureComponent {

  onSignInBtnClick = () => {
    this.props.updatePopup(SIGN_IN_POPUP, true);
  }

  renderSignInBtn() {
    const { tailwind } = this.props;

    return (
      <button onClick={this.onSignInBtnClick} className={tailwind('group block h-14 focus:outline-none')}>
        <span className={tailwind('rounded-full border border-gray-400 bg-white px-2.5 py-1.5 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring')}>Sign in</span>
      </button>
    );
  }

  render() {
    const {
      rightPane: rightPaneProp, doSupportTheme, themeMode, tailwind,
    } = this.props;

    let rightPane = null;
    if (rightPaneProp === SHOW_SIGN_IN) rightPane = this.renderSignInBtn();

    let topBarStyleClasses = 'bg-white';
    if (doSupportTheme) topBarStyleClasses += ' blk:bg-gray-900';

    return (
      <div className={tailwind(`mx-auto max-w-6xl px-4 md:px-6 lg:px-8 ${topBarStyleClasses}`)}>
        <div className={tailwind('relative')}>
          <header className={tailwind('flex h-14 items-center justify-between')}>
            <a className={tailwind('relative rounded focus:outline-none focus:ring focus:ring-offset-2')} href="/">
              <img className={tailwind('h-8')} src={doSupportTheme && themeMode === BLK_MODE ? shortLogoBlk : shortLogo} alt="Brace logo" />
            </a>
            {rightPane}
          </header>
        </div>
      </div>
    );
  }
}

TopBar.propTypes = {
  rightPane: PropTypes.string.isRequired,
  doSupportTheme: PropTypes.bool,
};

TopBar.defaultProps = {
  doSupportTheme: false,
};

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBar));
