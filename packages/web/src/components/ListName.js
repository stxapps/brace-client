import React from 'react';
import { connect } from 'react-redux';

import { updatePopup, updateListNamesMode } from '../actions';
import {
  LIST_NAMES_POPUP, SM_WIDTH, LG_WIDTH, LIST_NAMES_MODE_CHANGE_LIST_NAME,
  LIST_NAMES_ANIM_TYPE_POPUP,
} from '../types/const';
import { getListNameMap, getThemeMode } from '../selectors';
import { getListNameDisplayName } from '../utils';

import { getTopBarSizes, withTailwind } from '.';

class ListName extends React.PureComponent {

  onListNameBtnClick = (e) => {
    this.props.updateListNamesMode(
      LIST_NAMES_MODE_CHANGE_LIST_NAME, LIST_NAMES_ANIM_TYPE_POPUP,
    );

    const rect = e.currentTarget.getBoundingClientRect();
    this.props.updatePopup(LIST_NAMES_POPUP, true, rect);

    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
  };

  render() {
    const { listName, listNameMap, updates, safeAreaWidth, tailwind } = this.props;
    const displayName = getListNameDisplayName(listName, listNameMap);

    let textMaxWidth = 160;
    if (safeAreaWidth >= SM_WIDTH) textMaxWidth = 320;
    if (safeAreaWidth >= LG_WIDTH) textMaxWidth = 512;

    if (safeAreaWidth >= SM_WIDTH) {
      const {
        headerPaddingX, commandsWidth,
        listNameDistanceX, listNameArrowWidth, listNameArrowSpace,
      } = getTopBarSizes(safeAreaWidth);
      let headerSpaceLeftover = safeAreaWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth - listNameArrowSpace - commandsWidth - 4;
      if (listName in updates) headerSpaceLeftover -= 8;

      textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover);
    }
    const textStyle = { maxWidth: textMaxWidth };

    return (
      <div className={tailwind('relative inline-block')}>
        <button onClick={this.onListNameBtnClick} className={tailwind('flex items-center rounded-sm focus:outline-none focus:ring')}>
          <h2 style={textStyle} className={tailwind('mr-1 truncate text-lg font-medium leading-7 text-gray-900')}>{displayName}</h2>
          {listName in updates && <div className={tailwind('h-1.5 w-1.5 self-start rounded-full bg-blue-400')} />}
          <svg className={tailwind('w-5 text-gray-900')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNameMap: getListNameMap(state),
    updates: state.fetched,
    themeMode: getThemeMode(state),
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToProps = { updatePopup, updateListNamesMode };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(ListName));
