import React from 'react';
import { connect } from 'react-redux';

import { getThemeMode } from '../selectors';

import { withTailwind } from '.';

class Back extends React.PureComponent {

  render() {
    const { tailwind } = this.props;

    return (
      <div className={tailwind('pt-32')}>
        <div className={tailwind('text-center text-base text-gray-500')}>[This Page intentionally Left Blank]</div>
        <a className={tailwind('block pt-12 pb-2 text-center text-base text-gray-500')} href="/">
          Go to <span className={tailwind('rounded-sm font-medium text-gray-900 underline focus:outline-none focus:ring')}>your links</span>
        </a>
        <div className={tailwind('text-center text-base text-gray-500')}>or</div>
        <div className={tailwind('pt-2 text-center text-base text-gray-500')}>Press back to close</div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
    safeAreaWidth: state.window.width,
  };
};

export default connect(mapStateToProps)(withTailwind(Back));
