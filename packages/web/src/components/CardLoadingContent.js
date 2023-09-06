import React from 'react';

import { PC_100, PC_50, PC_33 } from '../types/const';
import { sample } from '../utils';

import { useTailwind } from '.';

const heights = ['224px', '248px', '272px'];

const CardLoadingContentItem = () => {
  const tailwind = useTailwind();

  const style = { height: sample(heights) };
  return (
    <div style={style} className={tailwind('relative mx-auto max-w-md overflow-hidden rounded-lg border border-gray-200 bg-gray-200 shadow-sm blk:border-gray-700 blk:bg-gray-700 sm:max-w-none')}></div>
  );
};

const CardLoadingContent = (props) => {

  const { columnWidth } = props;
  const tailwind = useTailwind();

  let nLinks = 2;
  if (columnWidth === PC_50) nLinks = 4;
  if (columnWidth === PC_33) nLinks = 6;

  const links = [];
  for (let i = 0; i < nLinks; i++) links.push({ id: i });

  const colData = [];
  if (columnWidth === PC_100) {
    colData.push(links);
  } else if (columnWidth === PC_50) {
    colData.push(links.filter((_, i) => i % 2 === 0));
    colData.push(links.filter((_, i) => i % 2 === 1));
  } else if (columnWidth === PC_33) {
    colData.push(links.filter((_, i) => i % 3 === 0));
    colData.push(links.filter((_, i) => i % 3 === 1));
    colData.push(links.filter((_, i) => i % 3 === 2));
  }

  let panelClassNames;
  if (columnWidth === PC_100) panelClassNames = 'space-x-4';
  else if (columnWidth === PC_50) panelClassNames = 'space-x-6';
  else if (columnWidth === PC_33) panelClassNames = 'space-x-8';

  let columnClassNames;
  if (columnWidth === PC_100) columnClassNames = 'space-y-4';
  else if (columnWidth === PC_50) columnClassNames = 'space-y-6';
  else if (columnWidth === PC_33) columnClassNames = 'space-y-8';

  return (
    <div className={tailwind(`flex items-start justify-evenly ${panelClassNames}`)}>
      {colData.map((colItems, i) => {
        return (
          <div key={`col-${i}`} className={tailwind(`w-full min-w-0 ${columnClassNames}`)}>
            {colItems.map(link => <CardLoadingContentItem key={link.id} />)}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CardLoadingContent);
