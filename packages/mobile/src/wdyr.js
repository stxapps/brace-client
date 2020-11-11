import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    include: [/^Main$/, /^TopBarBulkEditCommands$/, /^BottomBarBulkEditCommands$/, /^CardItemSelector$/, /^TopBar$/, /^CardItem$/, /^ConfirmDeletePopup$/],
    exclude: [/^Connect/, /^LogBox/,],
    /*include: [/^((?!(MenuOptions|MenuTrigger)).)*$/],
    exclude: [/^Connect/, /^LogBox/, /^EnhanceContext$/, /^ScrollView$/, /^View$/, /^Text$/, /^TouchableText$/, /^TouchableOpacity$/, /^TouchableWithoutFeedback$/, /^TouchableNativeFeedback$/, /^TextInput$ /, /^InternalTextInput$/, /^VirtualizedList$/, /^CellRenderer$/, /^MenuPlaceholder$/, /^Backdrop$/, /^Modal$/, /^ReactNativeModal$/, /^AppContainer$/, /^AnimatedComponentWrapper$/, /^AnimatedComponent$/, /^Svg$/, /^G$/, /^Path$/, /^Circle$/, /^undefined$/],*/
  });
}
