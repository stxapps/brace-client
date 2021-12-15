import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";

import { MAX_SELECTED_LINK_IDS } from '../types/const';
import { addSelectedLinkIds, deleteSelectedLinkIds } from '../actions';
import { makeIsLinkIdSelected, getSelectedLinkIdsLength } from '../selectors';
import { ccPopupFMV } from '../types/animConfigs';

const ListItemSelector = (props) => {

  const { linkId } = props;
  const getIsLinkIdSelected = useMemo(makeIsLinkIdSelected, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsLinkIdSelected(state, props));
  const selectedLinkIdsLength = useSelector(state => getSelectedLinkIdsLength(state));
  const [isMaxErrorShown, setIsMaxErrorShown] = useState(false);
  const dispatch = useDispatch();

  const onSelectBtnClick = () => {
    if (!isSelected && selectedLinkIdsLength === MAX_SELECTED_LINK_IDS) {
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
        <motion.div className="flex justify-center items-start" variants={ccPopupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className="p-2 bg-red-50 rounded-md shadow">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 mt-0.5">
                <h3 className="text-sm text-red-800 text-left leading-5">To prevent network overload, up to {MAX_SELECTED_LINK_IDS} items can be selected.</h3>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (isMaxErrorShown && selectedLinkIdsLength < MAX_SELECTED_LINK_IDS) {
    setIsMaxErrorShown(false);
  }

  if (!isBulkEditing) return null;

  const circleClassNames = isSelected ? 'bg-gray-800' : 'bg-white';
  const svgClassNames = isSelected ? 'text-gray-50' : 'text-gray-400';

  return (
    <button onClick={onSelectBtnClick} className="absolute inset-0 flex items-center w-full h-full bg-transparent group focus:outline-none">
      <div className="flex-grow-0 flex-shrink-0 w-16 pl-px flex justify-center items-center">
        <div className={`w-10 h-10 border rounded-full flex justify-center items-center ${circleClassNames} group-hover:ring group-focus:ring`}>
          <svg className={`w-6 h-6 ${svgClassNames}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0 h-full pl-3 flex items-center sm:pl-4">
        {renderMaxError()}
      </div>
    </button>
  );
};

export default React.memo(ListItemSelector);
