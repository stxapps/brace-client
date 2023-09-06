import React from 'react';

import { sample } from '../utils';

import { useTailwind } from '.';

const widths = ['20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%', '80%', '85%', '90%', '95%'];

const ListLoadingContentItem = () => {
  const tailwind = useTailwind();

  const titleStyle = { width: sample(widths) };
  const hostStyle = { width: sample(widths.slice(0, 5)) };

  return (
    <li className={tailwind('relative bg-white blk:bg-gray-900')}>
      <div className={tailwind('flex items-center')}>
        <div className={tailwind('w-16 flex-shrink-0 flex-grow-0 pl-px')}>
          <div className={tailwind('bg-gray-200 rounded pb-7/12')} />
        </div>
        <div className={tailwind('min-w-0 flex-1 py-3.5 pl-3 sm:pl-4')}>
          <div className={tailwind('')}>
            <div style={titleStyle} className={tailwind('h-5 rounded-md bg-gray-200 blk:bg-gray-700')} />
          </div>
          <div className={tailwind('pt-2')}>
            <div style={hostStyle} className={tailwind('h-2.5 rounded-md bg-gray-200 blk:bg-gray-700')} />
          </div>
        </div>
      </div>
    </li>
  );
};

const ListLoadingContent = () => {

  const tailwind = useTailwind();

  const links = [];
  for (let i = 0; i < 7; i++) links.push({ id: i });

  return (
    <ul className={tailwind('divide-y divide-gray-200 blk:divide-gray-700')}>
      {links.map(link => <ListLoadingContentItem key={link.id} />)}
    </ul>
  );
};

export default React.memo(ListLoadingContent);
