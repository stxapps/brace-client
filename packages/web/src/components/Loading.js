import React from 'react';

import { useTailwind } from '.';
import logo from '../images/logo-short.svg';

const Loading = () => {
  // safeAreaWidth is undefined as init is not called yet,
  //   use tailwind with care!
  const tailwind = useTailwind();

  return (
    <div className={tailwind('relative h-screen w-screen max-w-full')}>
      <div style={{ top: '33.3333%' }} className={tailwind('absolute left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center square-spin')}>
        <img src={logo} alt="" />
      </div>
    </div>
  )
};

export default Loading;
