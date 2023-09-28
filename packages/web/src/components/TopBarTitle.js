import React from 'react';
import { useSelector } from 'react-redux';

import TopBarTitleListName from './TopBarTitleListName';
import TopBarTitleTagName from './TopBarTitleTagName';

const TopBarTitle = () => {

  const queryString = useSelector(state => state.display.queryString);

  if (queryString) return <TopBarTitleTagName />;
  return <TopBarTitleListName />;
};

export default React.memo(TopBarTitle);
