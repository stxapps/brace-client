import React from 'react';

import {
  APP_RENDER_ABOUT, APP_RENDER_TERMS, APP_RENDER_PRIVACY, APP_RENDER_PRICING,
  APP_RENDER_SUPPORT, APP_RENDER_ADDING, APP_RENDER_MAIN,
} from '../types/const';

import Landing from './Landing';
import About from './About';
import Terms from './Terms';
import Privacy from './Privacy';
import Pricing from './Pricing';
import Support from './Support';

import Adding from './Adding';
import Main from './Main';

const AppChunk = (props) => {
  const { type } = props;

  if (type === APP_RENDER_ABOUT) return <About />;
  else if (type === APP_RENDER_TERMS) return <Terms />;
  else if (type === APP_RENDER_PRIVACY) return <Privacy />;
  else if (type === APP_RENDER_PRICING) return <Pricing />;
  else if (type === APP_RENDER_SUPPORT) return <Support />;
  else if (type === APP_RENDER_ADDING) return <Adding />;
  else if (type === APP_RENDER_MAIN) return <Main />;
  else return <Landing />;
};

export default React.memo(AppChunk);
