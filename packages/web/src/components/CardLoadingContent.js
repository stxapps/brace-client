import React from 'react';

import { useTailwind } from '.';

const CardLoadingContent = () => {

  const tailwind = useTailwind();

  return (
    <div className={tailwind('bg-green-400')}>CardLoadingContent</div>
  );
};

export default React.memo(CardLoadingContent);
