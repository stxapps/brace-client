import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import { addSelectedLinkIds, deleteSelectedLinkIds } from '../actions';
import {
  SD_HUB_URL, MAX_SELECTED_LINK_IDS, SD_MAX_SELECTED_LINK_IDS,
} from '../types/const';
import { makeIsLinkIdSelected, getSelectedLinkIdsLength } from '../selectors';
import { popupFMV } from '../types/animConfigs';

import { useTailwind } from '.';

const ListItemSelector = (props) => {

  const { linkId } = props;
  const getIsLinkIdSelected = useMemo(makeIsLinkIdSelected, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsLinkIdSelected(state, props));
  const selectedLinkIdsLength = useSelector(state => getSelectedLinkIdsLength(state));
  const maxSelectedLinkIds = useSelector(state => {
    if (state.user.hubUrl === SD_HUB_URL) return SD_MAX_SELECTED_LINK_IDS;
    return MAX_SELECTED_LINK_IDS;
  });
  const [isMaxErrorShown, setIsMaxErrorShown] = useState(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSelectBtnClick = () => {
    if (!isSelected && selectedLinkIdsLength === maxSelectedLinkIds) {
      setIsMaxErrorShown(true);
      return;
    }
    setIsMaxErrorShown(false);

    if (isSelected) dispatch(deleteSelectedLinkIds([linkId]));
    else dispatch(addSelectedLinkIds([linkId]));
  };

  const renderMaxError = () => {
    if (!isMaxErrorShown) return (
      <AnimatePresence key="AnimatePresence_LIS_maxError" />
    );

    return (
      <AnimatePresence key="AnimatePresence_LIS_maxError">
        <motion.div className={tailwind('flex rounded-md bg-red-50 p-2 shadow')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('flex-shrink-0')}>
            <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={tailwind('ml-3 mt-0.5')}>
            <h3 className={tailwind('text-left text-sm leading-5 text-red-800')}>To prevent network overload, up to {maxSelectedLinkIds} items can be selected.</h3>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (isMaxErrorShown && selectedLinkIdsLength < maxSelectedLinkIds) {
    setIsMaxErrorShown(false);
  }

  if (!isBulkEditing) return null;

  const circleClassNames = isSelected ? 'bg-gray-800 blk:border-gray-700' : 'bg-white blk:bg-gray-100';
  const svgClassNames = isSelected ? 'text-gray-50' : 'text-gray-400';

  return (
    <button onClick={onSelectBtnClick} className={tailwind('group absolute inset-0 flex h-full w-full items-center bg-transparent focus:outline-none')}>
      <div className={tailwind('flex h-full w-16 flex-shrink-0 flex-grow-0 items-center justify-center bg-white pl-px blk:bg-gray-900')}>
        <div className={tailwind(`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 group-hover:ring group-focus:ring ${circleClassNames}`)}>
          <svg className={tailwind(`h-6 w-6 ${svgClassNames}`)} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
          </svg>
        </div>
      </div>
      <div className={tailwind('flex h-full min-w-0 flex-1 items-center pl-3 sm:pl-4')}>
        {renderMaxError()}
      </div>
      <div className={tailwind('-mr-3 h-full w-3 flex-shrink-0 flex-grow-0 bg-transparent sm:-mr-1 sm:w-1')} />
    </button>
  );
};

export default React.memo(ListItemSelector);
