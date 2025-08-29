import React from 'react';

import { useSelector } from '../store';
import { BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';

import { useTailwind } from '.';

import Logo from '../images/logo-short.svg';
import LogoBlk from '../images/logo-short-blk.svg';

const Loading = () => {
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = useTailwind();

  return (
    <div className={tailwind('relative h-screen w-screen max-w-full bg-white blk:bg-gray-900')}>
      <div style={{ top: '33.3333%' }} className={tailwind('absolute left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center square-spin')}>
        <img src={themeMode === BLK_MODE ? LogoBlk : Logo} alt="" />
      </div>
    </div>
  );
};

export default React.memo(Loading);
