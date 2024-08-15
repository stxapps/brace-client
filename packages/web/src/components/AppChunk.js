import React from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

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

  let component;
  if (type === APP_RENDER_ABOUT) component = <About />;
  else if (type === APP_RENDER_TERMS) component = <Terms />;
  else if (type === APP_RENDER_PRIVACY) component = <Privacy />;
  else if (type === APP_RENDER_PRICING) component = <Pricing />;
  else if (type === APP_RENDER_SUPPORT) component = <Support />;
  else if (type === APP_RENDER_ADDING) component = <Adding />;
  else if (type === APP_RENDER_MAIN) component = <Main />;
  else component = <Landing />;

  return (
    <LazyMotion features={domAnimation} strict={false}>
      {component}
    </LazyMotion>
  );
};

export default React.memo(AppChunk);
