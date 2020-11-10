import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    include: [/^((?!(MenuOptions|MenuTrigger)).)*$/],
    exclude: [
      /^Connect/, /^LogBox/,
      /^AnimatedComponentWrapper$/, /^AnimatedComponent$/, /^Svg$/, /^G$/, /^Path$/,
    ],
  });
}
