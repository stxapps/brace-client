'use client';
import React, { HTMLAttributes } from 'react';
import Link, { LinkProps } from 'next/link';

import { useSelector } from '../store';
import { isString } from '../utils';

type CustomLinkProps = LinkProps & HTMLAttributes<HTMLAnchorElement>;

const CustomLink: React.FC<CustomLinkProps> = (props) => {
  const wHref = useSelector(state => state.window.href);

  let pHref: string;
  if (isString(props.href)) {
    pHref = props.href;
  } else {
    const { pathname = '', query, hash = '' } = props.href;

    let queryString = '';
    if (query) queryString = (
      `?${new URLSearchParams(query as Record<string, string>).toString()}`
    );

    pHref = `${pathname}${queryString}${hash}`;
  }

  let base = 'http://localhost';
  if (typeof window !== 'undefined') base = window.location.origin;
  const wUrl = new URL(wHref, base);
  const pUrl = new URL(pHref, base);

  if (wUrl.pathname === pUrl.pathname && wUrl.search === pUrl.search) {
    const aProps = { ...props, href: pHref, prefetch: `${props.prefetch}` };
    return <a {...aProps} />;
  }
  return <Link {...props} />;
};

export default React.memo(CustomLink);
