import React from 'react';
import Link from 'next/link';
import { connect } from 'react-redux';

import { getSafeAreaWidth, getThemeMode } from '../selectors';

import { withTailwind } from '.';

class Back extends React.PureComponent<any, any> {

  render() {
    const { tailwind } = this.props;

    return (
      <div className={tailwind('min-h-screen bg-white blk:bg-gray-900')}>
        <div className={tailwind('pt-32')}>
          <div className={tailwind('text-center text-base text-gray-500 blk:text-gray-400')}>[This Page intentionally Left Blank]</div>
          <Link className={tailwind('block pt-12 pb-2 text-center text-base text-gray-500 blk:text-gray-400')} href="/">
            Go to <span className={tailwind('rounded-xs font-medium text-gray-900 underline focus:outline-none focus:ring blk:text-gray-50')}>your links</span>
          </Link>
          <div className={tailwind('text-center text-base text-gray-500 blk:text-gray-400')}>or</div>
          <div className={tailwind('pt-2 text-center text-base text-gray-500 blk:text-gray-400')}>Press back to close</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

export default connect(mapStateToProps)(withTailwind(Back));
