import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    include: [/^TopBarBulkEditCommands$/, /^BottomBarBulkEditCommands$/, /^CardItem$/, /^CardItemSelector$/, /^CardItemContent$/, /^ConfirmDeletePopup$/,],
    exclude: [/^Connect/, /^LogBox/,],
    logOnDifferentValues: true,
    collapseGroups: true,
  });
}
