import React from 'react';
import { View } from 'react-native';

import { SM_WIDTH } from '../types/const';
import { sample, toPx } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const widths = [
  '20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%',
  '80%', '85%', '90%', '95%',
];

const CardLoadingContentItem = (props) => {
  const { style } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const tailwind = useTailwind();

  // Need to do this as React Native doesn't support maxWidth: "none"
  //   even though it's in tailwind-rn.
  const viewStyle = safeAreaWidth < toPx(SM_WIDTH) ? 'max-w-md' : '';

  const hostStyle = { width: sample(widths.slice(0, 8)) };
  const nLines = sample([1, 2, 3]);

  return (
    <View style={style}>
      <View style={tailwind(`w-full self-center rounded-lg pb-2 ${viewStyle}`)}>
        <View style={tailwind('h-44 rounded-t-lg bg-gray-200 blk:bg-gray-700')} />
        <View style={tailwind('flex-row items-center justify-start py-3')}>
          <View style={tailwind('h-3 w-3 rounded-full bg-gray-200 blk:bg-gray-700')} />
          <View style={[tailwind('ml-1 h-3 rounded bg-gray-200 blk:bg-gray-700'), hostStyle]} />
        </View>
        <View style={[tailwind('h-4 rounded bg-gray-200 blk:bg-gray-700'), { width: sample(widths.slice(8)) }]} />
        {nLines >= 2 && <View style={[tailwind('mt-1.5 h-4 rounded bg-gray-200 blk:bg-gray-700'), { width: sample(widths.slice(8)) }]} />}
        {nLines >= 3 && <View style={[tailwind('mt-1.5 h-4 rounded bg-gray-200 blk:bg-gray-700'), { width: sample(widths.slice(8)) }]} />}
      </View>
    </View>
  );
};

export default React.memo(CardLoadingContentItem);
