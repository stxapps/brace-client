import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { signOut, updateMigrateHubState, migrateHub } from '../actions';
import { HASH_SUPPORT } from '../types/const';
import { isString } from '../utils';
import { initialMigrateHubState } from '../types/initialStates';

import { useSafeAreaFrame, useTailwind } from '.';

const MigrateHubPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const hubUrl = useSelector(state => state.migrateHub.hubUrl);
  const hubUrlInProfile = useSelector(state => state.migrateHub.hubUrlInProfile);
  const didWarn = useSelector(state => state.migrateHub.didWarn);
  const progress = useSelector(state => state.migrateHub.progress);
  const scrollView = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    if (progress && progress.total !== progress.done) return;
    dispatch(updateMigrateHubState({ ...initialMigrateHubState }));
    didClick.current = true;
  };

  const onMigrateBtnClick = () => {
    if (didClick.current) return;

    if (hubUrlInProfile) {
      window.open(
        'https://forum.stacks.org/t/domain-migrations-for-hiro-hosted-services',
        '_blank'
      );
      dispatch(updateMigrateHubState({ ...initialMigrateHubState }));
      return;
    }

    dispatch(updateMigrateHubState({ didWarn: true }));
    didClick.current = true;
  };

  const onStartBtnClick = () => {
    if (didClick.current) return;
    dispatch(migrateHub());
    didClick.current = true;
  };

  const onSignOutBtnClick = () => {
    dispatch(signOut());
  };

  useEffect(() => {
    didClick.current = false;
  }, [hubUrl, didWarn, progress]);

  useEffect(() => {
    if (didWarn && scrollView.current) scrollView.current.scrollTo(0, 0);
  }, [didWarn]);

  const renderWarning = () => {
    return (
      <div className={tailwind('fixed inset-x-0 top-14 z-40 flex items-start justify-center md:top-0')}>
        <div className={tailwind('relative m-4 rounded-md bg-yellow-50 p-4 shadow-lg sm:max-w-lg')}>
          <div className={tailwind('flex')}>
            <div className={tailwind('flex-shrink-0')}>
              <svg className={tailwind('h-6 w-6 text-yellow-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={tailwind('ml-3 lg:mt-0.5')}>
              <h3 className={tailwind('text-left text-base font-medium text-yellow-800 lg:text-sm')}>Data migration needed</h3>
              <p className={tailwind('mt-2.5 text-sm text-yellow-700')}>Our current data server will be out of service soon. Please migrate all your data to our new data server.</p>
              <div className={tailwind('mt-4')}>
                <div className={tailwind('-mx-2 -my-1.5 flex')}>
                  <button onClick={onMigrateBtnClick} className={tailwind('rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 transition duration-150 ease-in-out hover:bg-yellow-100 focus:outline-none focus:ring')}>Migrate</button>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onCloseBtnClick} className={tailwind('absolute top-1 right-1 rounded-md bg-yellow-50 p-1 hover:bg-yellow-100 focus:outline-none focus:ring')} type="button">
            <span className={tailwind('sr-only')}>Dismiss</span>
            <svg className={tailwind('h-5 w-5 text-yellow-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const _render = (content) => {
    let _height = 448;
    if (progress && progress.total === -1) _height = 528;
    const panelHeight = Math.min(_height, safeAreaHeight * 0.9);

    return (
      <div className={tailwind('fixed inset-0 z-40 overflow-hidden')}>
        <div className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: safeAreaHeight }}>
          <div className={tailwind('fixed inset-0 bg-black bg-opacity-25')} />
          <div className={tailwind('relative w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl blk:bg-gray-800 blk:ring-1 blk:ring-white blk:ring-opacity-25')}>
            <div ref={scrollView} className={tailwind('relative overflow-y-auto overflow-x-hidden px-4 sm:px-6')} style={{ height: panelHeight }}>
              {content}
              <div className={tailwind('absolute top-0 right-0 p-1')}>
                <button onClick={onCloseBtnClick} className={tailwind('group flex h-7 w-7 items-center justify-center focus:outline-none')} aria-label="Close migrate hub popup">
                  <svg className={tailwind('h-5 w-5 rounded text-gray-400 group-hover:text-gray-500 group-focus:ring blk:text-gray-500 blk:group-hover:text-gray-400')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMigrateView = () => {
    let actionPanel;
    if (!progress) {
      actionPanel = (
        <div className={tailwind('mt-7 mb-6')}>
          <button onClick={onStartBtnClick} className={tailwind('block rounded-full border border-gray-400 bg-white px-3.5 py-1.5 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-600 focus:outline-none focus:ring blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200')} type="button">Migrate All My Data</button>
        </div>
      );
    } else if (progress.total === -1) {
      actionPanel = (
        <div className={tailwind('mt-5 mb-6')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-red-600 blk:text-red-500')}>Oops..., something went wrong!</p>
          </div>
          <p className={tailwind('text-base leading-relaxed text-red-600 blk:text-red-500')}>{progress.error}</p>
          <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring blk:hover:text-gray-200')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
        </div>
      );
    } else if (progress.total === progress.done) {
      actionPanel = (
        <div className={tailwind('mt-7 mb-6')}>
          <div className={tailwind('flex items-center')}>
            <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-green-500 blk:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
            </svg>
            <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>Finish. Please <button onClick={onSignOutBtnClick} className={tailwind('rounded-md underline hover:text-gray-600 focus:outline-none focus:ring blk:hover:text-gray-300')}>Sign out</button>.</p>
          </div>
        </div>
      );
    } else {
      actionPanel = (
        <div className={tailwind('mt-5 mb-6')}>
          <div className={tailwind('flex items-center')}>
            <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
              <div />
            </div>
            <p className={tailwind('ml-1 text-base text-gray-500 blk:text-gray-400')}>Migrating...</p>
          </div>
          <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{progress.done} / {progress.total}</p>
        </div>
      );
    }

    const content = (
      <React.Fragment>
        <h3 className={tailwind('mt-8 text-left text-xl font-medium leading-none text-gray-800 blk:text-gray-100')}>Data Migration</h3>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>As our current data server will be out of service soon, all your data is needed to migrate to our new data server. Please start the migration by clicking the button below and wait until it finishes.</p>
        <ul className={tailwind('mt-3 list-inside list-disc pl-2 text-base text-gray-500 blk:text-gray-400')}>
          <li>It may take several minutes.</li>
          <li className={tailwind('mt-1')}>You need to sign out and sign back in after it finishes.</li>
          <li className={tailwind('mt-1')}>Also, you need to sign in again on your other devices.</li>
        </ul>
        {actionPanel}
      </React.Fragment>
    );

    return _render(content);
  };

  if (!isString(hubUrl) || !hubUrl.includes('hub.blockstack.org')) return null;
  if (!didWarn) return renderWarning();
  return renderMigrateView();
};

export default React.memo(MigrateHubPopup);
