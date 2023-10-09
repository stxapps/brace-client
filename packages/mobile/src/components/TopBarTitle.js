import React from 'react';
import { useSelector } from 'react-redux';

import TopBarTitleListName from './TopBarTitleListName';
import TopBarTitleQueryString from './TopBarTitleQueryString';

const TopBarTitle = () => {

  const queryString = useSelector(state => state.display.queryString);

  if (queryString) return <TopBarTitleQueryString />;
  return <TopBarTitleListName />;
};

export default React.memo(TopBarTitle);
