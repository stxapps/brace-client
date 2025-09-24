import React, { useLayoutEffect } from 'react';

import { useSelector } from '../store';

const ScrollControl = () => {

  const isSettingsPopupShown = useSelector(state => state.display.isSettingsPopupShown);

  useLayoutEffect(() => {
    const html = window.document.documentElement;
    const pr = window.getComputedStyle(html).paddingRight;
    if (pr !== '0px') {
      console.log('ScrollControl expects zero <html> padding rigth', pr);
    }

    const originalOverflowY = html.style.overflowY;
    const originalPaddingRight = html.style.paddingRight;
    if (originalPaddingRight !== '') {
      console.log('ScrollControl expects empty <html> padding rigth style', pr);
    }

    return () => {
      html.style.overflowY = originalOverflowY;
      html.style.paddingRight = originalPaddingRight;
    };
  }, []);

  useLayoutEffect(() => {
    const html = window.document.documentElement;
    if (isSettingsPopupShown) {
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      html.style.overflowY = 'hidden';
      if (scrollbarWidth > 0) {
        html.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      html.style.overflowY = 'scroll';
      html.style.paddingRight = '';
    }
  }, [isSettingsPopupShown]);

  return null;
};

export default React.memo(ScrollControl);
