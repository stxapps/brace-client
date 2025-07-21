import React from 'react';
import { View } from 'react-native';

import { sample } from '../utils';

import { useTailwind } from '.';

const widths = [
  '20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%',
  '80%', '85%', '90%', '95%',
];

const ListLoadingContentItem = () => {
  const tailwind = useTailwind();

  const titleStyle = { width: sample(widths) };
  const hostStyle = { width: sample(widths.slice(0, 5)) };

  return (
    <View style={tailwind('border-b border-gray-200 blk:border-gray-700')}>
      <View style={tailwind('flex-row items-center')}>
        <View style={tailwind('w-16 flex-shrink-0 flex-grow-0 pl-px')}>
          <View style={tailwind('w-full rounded bg-gray-200 blk:bg-gray-700 aspect-7/12')} />
        </View>
        <View style={tailwind('min-w-0 flex-1 py-3.5 pl-3 sm:pl-4')}>
          <View style={tailwind('')}>
            <View style={[tailwind('h-5 rounded-md bg-gray-200 blk:bg-gray-700'), titleStyle]} />
          </View>
          <View style={tailwind('pt-2')}>
            <View style={[tailwind('h-2.5 rounded-md bg-gray-200 blk:bg-gray-700'), hostStyle]} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default React.memo(ListLoadingContentItem);
