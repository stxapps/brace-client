import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { retryDiedLinks, cancelDiedLinks } from '../actions';
import { ADDING, MOVING, SM_WIDTH } from '../types/const';
import { ensureContainUrlProtocol, isDiedStatus } from '../utils';

import ListItemContent from './ListItemContent';
import ListItemSelector from './ListItemSelector';

const ListItem = (props) => {

  const { link } = props;
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onRetryRetryBtnClick = () => {
    if (didClick.current) return;
    dispatch(retryDiedLinks([link.id]));
    didClick.current = true;
  };

  const onRetryCancelBtnClick = () => {
    dispatch(cancelDiedLinks([link.id]));
  };

  useEffect(() => {
    didClick.current = false;
  }, [link.status]);

  const renderRetry = () => {
    const { url } = link;
    const errMsg = window.innerWidth < SM_WIDTH ? 'Something went wrong!' : 'Oops..., something went wrong!';

    return (
      <React.Fragment>
        <div className="absolute inset-0 bg-black opacity-75" />
        <div className="absolute inset-0 flex bg-transparent p-1">
          <div className="flex-grow flex-shrink min-w-0 flex flex-col justify-center items-center">
            <h3 className="text-base text-white font-semibold text-center leading-5">{errMsg}</h3>
            <a className="mt-1 px-2 text-sm text-white font-medium text-center tracking-wide rounded-sm hover:underline focus:outline-none focus:ring focus:ring-blue-300" href={ensureContainUrlProtocol(url)} target="_blank" rel="noreferrer">Go to the link</a>
          </div>
          <div className="flex-grow-0 flex-shrink-0 flex">
            <button onClick={onRetryRetryBtnClick} className="group focus:outline-none">
              <div className="px-3 py-1 bg-white text-sm text-gray-500 font-medium rounded-full border border-white group-hover:bg-gray-700 group-hover:text-gray-50 group-focus:ring group-focus:ring-blue-300">
                Retry
              </div>
            </button>
            <button onClick={onRetryCancelBtnClick} className="group focus:outline-none sm:px-2">
              <div className="m-0.5 p-0.5 text-sm text-gray-100 font-medium rounded group-hover:bg-gray-100 group-hover:text-gray-500 group-focus:ring group-focus:ring-blue-300">
                Cancel
              </div>
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const renderBusy = () => {
    const svgStyle = { top: '42px', left: '20px' };

    return (
      <div className="absolute top-0 right-0 w-10 h-10 bg-transparent overflow-hidden">
        <div className="relative w-10 h-10 bg-gray-600 overflow-hidden transform rotate-45 translate-x-1/2 -translate-y-1/2">
          <svg style={svgStyle} className="relative w-4 h-4 text-gray-100 transform -rotate-45 -translate-x-1/2 -translate-y-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  };

  const { status } = link;

  return (
    <li className="bg-white relative">
      <ListItemContent link={link} />
      {isDiedStatus(status) && renderRetry()}
      {[ADDING, MOVING].includes(status) && renderBusy()}
      {![ADDING, MOVING].includes(status) && <ListItemSelector linkId={link.id} />}
    </li>
  );
};

export default React.memo(ListItem);
