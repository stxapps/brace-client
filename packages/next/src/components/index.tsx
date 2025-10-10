import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useSelector } from '../store';
import {
  TOP_HEADER_HEIGHT, TOP_LIST_NAME_HEIGHT, TOP_HEADER_LIST_NAME_SPACE,
  TOP_HEADER_LIST_NAME_SPACE_MD, TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MD, MD_WIDTH, LG_WIDTH,
} from '../types/const';
import { isFldStr, toPx } from '../utils';
import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';

export const getTopBarSizes = (safeAreaWidth) => {

  const topBarHeight = safeAreaWidth < toPx(MD_WIDTH) ? toPx(TOP_BAR_HEIGHT) : toPx(TOP_BAR_HEIGHT_MD);
  const headerHeight = toPx(TOP_HEADER_HEIGHT);

  const listNameDistanceX = toPx('3rem');

  const LIST_NAME_START_Y = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE);
  const LIST_NAME_START_Y_MD = toPx(TOP_HEADER_HEIGHT) + toPx(TOP_HEADER_LIST_NAME_SPACE_MD);
  const listNameStartY = safeAreaWidth < toPx(MD_WIDTH) ? LIST_NAME_START_Y : LIST_NAME_START_Y_MD;

  const LIST_NAME_END_Y = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
  const LIST_NAME_END_Y_MD = (toPx(TOP_HEADER_HEIGHT) / 2 - toPx(TOP_LIST_NAME_HEIGHT) / 2);
  const listNameEndY = safeAreaWidth < toPx(MD_WIDTH) ? LIST_NAME_END_Y : LIST_NAME_END_Y_MD;

  const listNameDistanceY = Math.abs(listNameEndY - listNameStartY);

  const statusPopupDistanceY = toPx('2.25rem'); // 36px

  let headerPaddingX = toPx('1rem') * 2; // From px-4 md:px-6 lg:px-8
  if (safeAreaWidth >= MD_WIDTH) headerPaddingX = toPx('1.5rem') * 2;
  if (safeAreaWidth >= LG_WIDTH) headerPaddingX = toPx('2rem') * 2;

  const listNameArrowWidth = toPx('1.25rem'); // From inspect
  const listNameArrowSpace = toPx('0.25rem'); // From inspect
  const commandsWidth = toPx('26.375rem'); // From inspect

  return {
    topBarHeight,
    headerHeight,
    listNameDistanceX,
    listNameStartY,
    listNameEndY,
    listNameDistanceY,
    statusPopupDistanceY,
    headerPaddingX,
    listNameArrowWidth,
    listNameArrowSpace,
    commandsWidth,
  };
};

export const useSafeAreaFrame = () => {
  return useSelector(state => getSafeAreaFrame(state));
};

export const useSafeAreaInsets = () => {
  return useSelector(state => getSafeAreaInsets(state));
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);

  // Make SSR and loading state have the same width to prevent rehydration error.
  let twWidth = 9999;
  if ([true, false].includes(isUserSignedIn) && isFldStr(href)) twWidth = safeAreaWidth;

  const tailwind = getTailwind(twWidth, themeMode);
  return tailwind;
};

export const withTailwind = (Component) => {
  const hoc = React.forwardRef((props: any, ref) => {
    const tailwind = useTailwind();
    return <Component {...props} tailwind={tailwind} ref={ref} />;
  });
  hoc.displayName = 'withTailwindComponent';
  return hoc;
};

export const useHash = () => {
  const pathname = usePathname();
  const [hash, setHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  useEffect(() => {
    setHash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return hash;
};

export const withRouter = (Component) => {
  const hoc = React.forwardRef((props: any, ref) => {
    const router = useRouter();
    return <Component {...props} router={router} ref={ref} />;
  });
  hoc.displayName = 'withRouterComponent';
  return hoc;
};
