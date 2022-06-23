import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { retryDiedLinks, cancelDiedLinks } from '../actions';
import { ADDING, MOVING, SM_WIDTH, PINNED } from '../types/const';
import { makeGetPinStatus } from '../selectors';
import { ensureContainUrlProtocol, isDiedStatus, isPinningStatus } from '../utils';

import ListItemContent from './ListItemContent';
import ListItemSelector from './ListItemSelector';

import { useSafeAreaFrame } from '.';

const ListItem = (props) => {

  const { link } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const pinStatus = useSelector(state => getPinStatus(state, link));
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
    const errMsg = safeAreaWidth < SM_WIDTH ? 'Something went wrong!' : 'Oops..., something went wrong!';

    return (
      <React.Fragment>
        <div className="absolute inset-0 bg-black bg-opacity-75" />
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

  const renderPinning = () => {
    const svgStyle = { top: '28px', left: '34px' };

    return (
      <div className="absolute top-0 left-0 w-10 h-10 bg-transparent overflow-hidden">
        <div className="relative w-10 h-10 bg-gray-600 overflow-hidden transform rotate-45 -translate-x-1/2 -translate-y-1/2">
          <svg style={svgStyle} className="relative w-4 h-4 text-gray-100 transform -rotate-45 -translate-x-1/2 -translate-y-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  };

  const renderPin = () => {
    const svgStyle = { top: '27px', left: '32px' };

    return (
      <div className="absolute top-0 left-0 w-10 h-10 bg-transparent overflow-hidden">
        <div className="relative w-10 h-10 bg-gray-600 overflow-hidden transform rotate-45 -translate-x-1/2 -translate-y-1/2">
          <svg style={svgStyle} className="relative w-3 h-3 text-gray-100 transform -rotate-45 -translate-x-1/2 -translate-y-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.2349 14.61C19.8599 12.865 17.8929 11.104 16.2249 10.485L15.6809 5.53698L17.1759 3.29498C17.3329 3.05898 17.3479 2.75698 17.2129 2.50798C17.0789 2.25798 16.8209 2.10498 16.5379 2.10498H7.39792C7.11392 2.10498 6.85592 2.25898 6.72192 2.50798C6.58792 2.75798 6.60192 3.06098 6.75992 3.29598L8.25792 5.54298L7.77392 10.486C6.10592 11.106 4.14092 12.866 3.76992 14.602C3.72992 14.762 3.75392 15.006 3.90192 15.196C4.00492 15.328 4.20592 15.486 4.58192 15.486H8.63992L11.5439 22.198C11.6219 22.382 11.8039 22.5 12.0019 22.5C12.1999 22.5 12.3819 22.382 12.4619 22.198L15.3649 15.485H19.4219C19.7979 15.485 19.9979 15.329 20.1019 15.199C20.2479 15.011 20.2739 14.765 20.2369 14.609L20.2349 14.61Z" />
          </svg>
        </div>
      </div>
    );
  };

  const { status } = link;

  const isPinning = isPinningStatus(pinStatus);
  const canSelect = ![ADDING, MOVING].includes(status) && !isPinning;

  return (
    <li className="bg-white relative">
      <ListItemContent link={link} />
      {[ADDING, MOVING].includes(status) && renderBusy()}
      {isPinning && renderPinning()}
      {[PINNED].includes(pinStatus) && renderPin()}
      {canSelect && <ListItemSelector linkId={link.id} />}
      {isDiedStatus(status) && renderRetry()}
    </li>
  );
};

export default React.memo(ListItem);
