import React from 'react';
import { connect } from 'react-redux';

import { updatePopup } from '../actions';
import { LIST_NAMES_POPUP, SM_WIDTH, LG_WIDTH } from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName } from '../utils';

import { getTopBarSizes } from '.';

class ListName extends React.PureComponent {

  onListNameBtnClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    this.props.updatePopup(LIST_NAMES_POPUP, true, rect);
    if (window.document.activeElement instanceof HTMLElement) {
      window.document.activeElement.blur();
    }
  };

  render() {

    const { listName, listNameMap, updates } = this.props;
    const displayName = getListNameDisplayName(listName, listNameMap);

    let textMaxWidth = 160;
    if (window.innerWidth >= SM_WIDTH) textMaxWidth = 320;
    if (window.innerWidth >= LG_WIDTH) textMaxWidth = 512;

    if (window.innerWidth >= SM_WIDTH) {
      const {
        headerPaddingX, commandsWidth,
        listNameDistanceX, listNameArrowWidth, listNameArrowSpace,
      } = getTopBarSizes(window.innerWidth);
      let headerSpaceLeftover = window.innerWidth - headerPaddingX - listNameDistanceX - listNameArrowWidth - listNameArrowSpace - commandsWidth - 4;
      if (listName in updates) headerSpaceLeftover -= 8;

      textMaxWidth = Math.min(textMaxWidth, headerSpaceLeftover);
    }
    const textStyle = { maxWidth: textMaxWidth };

    return (
      <div className="inline-block relative">
        <button onClick={this.onListNameBtnClick} className="flex items-center rounded-sm focus:outline-none focus:ring">
          <h2 style={textStyle} className="mr-1 text-lg text-gray-900 font-medium leading-7 truncate">{displayName}</h2>
          {listName in updates && <div className="self-start w-1.5 h-1.5 bg-blue-400 rounded-full" />}
          <svg className="w-5 text-gray-900" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  };
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(ListName);
