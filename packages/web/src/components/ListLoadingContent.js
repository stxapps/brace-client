import React from 'react';

import { useTailwind } from '.';

const ListLoadingContent = () => {

  const tailwind = useTailwind();

  return (
    <div className={tailwind('bg-yellow-400')}>ListLoadingContent</div>
  );
};

export default React.memo(ListLoadingContent);
