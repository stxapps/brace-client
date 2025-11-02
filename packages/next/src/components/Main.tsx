import React from 'react';
import { connect } from 'react-redux';

import { fetch } from '../actions/chunk';
import { endIapConnection } from '../actions/iap';
import {
  PC_100, PC_50, PC_33, SHOW_BLANK, SHOW_COMMANDS, SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
} from '../types/const';
import {
  getIsShowingLinkIdsNull, getLayoutType, getThemeMode, getSafeAreaWidth,
} from '../selectors';
import { toPx } from '../utils';

import { withTailwind } from '.';

import ScrollControl from './ScrollControl';
import TopBarMain from './TopBarMain';
import TopBarAddPopup from './TopBarAddPopup';
import TopBarProfilePopup from './TopBarProfilePopup';
import BottomBar from './BottomBar';
import BottomBarAddPopup from './BottomBarAddPopup';
import BottomBarSearchPopup from './BottomBarSearchPopup';
import BottomBarProfilePopup from './BottomBarProfilePopup';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import LockPanel from './LockPanel';
import FetchedPopup from './FetchedPopup';
import CardItemMenuPopup from './CardItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import BulkEditMenuPopup from './BulkEditMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import TagEditorPopup from './TagEditorPopup';
import GlobalPopups from './GlobalPopups';

class Main extends React.PureComponent<any, any> {

  componentDidMount() {
    this.props.fetch();
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.listName !== this.props.listName) ||
      (prevProps.queryString !== this.props.queryString) ||
      (prevProps.didFetch && !this.props.didFetch) ||
      (prevProps.didFetchSettings && !this.props.didFetchSettings) ||
      (!prevProps.isShowingLinkIdsNull && this.props.isShowingLinkIdsNull)
    ) this.props.fetch();
  }

  componentWillUnmount() {
    this.props.endIapConnection();
  }

  getColumnWidth = (safeAreaWidth) => {
    let columnWidth = PC_100;
    if (safeAreaWidth >= toPx(SM_WIDTH)) columnWidth = PC_50;
    if (safeAreaWidth >= toPx(LG_WIDTH)) columnWidth = PC_33;

    return columnWidth;
  };

  render() {
    const { layoutType, safeAreaWidth } = this.props;

    const columnWidth = this.getColumnWidth(safeAreaWidth);
    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ?
      SHOW_COMMANDS : SHOW_BLANK;

    // In Settings, remove a list that makes listName change to MY_LIST
    //   and if not rehydrated yet, loading is shown
    //   so if not rehydrated, show loading under Settings.
    return (
      <React.Fragment>
        <ScrollControl />
        <TopBarMain rightPane={topBarRightPane} />
        {layoutType === LAYOUT_LIST ?
          <ListPanel columnWidth={columnWidth} /> :
          <CardPanel columnWidth={columnWidth} />
        }
        <LockPanel columnWidth={columnWidth} />
        {columnWidth === PC_100 && <>
          <BottomBarSearchPopup />
          <BottomBar />
        </>}
        <FetchedPopup />
        {columnWidth !== PC_100 && <>
          <TopBarAddPopup />
          <TopBarProfilePopup />
        </>}
        {columnWidth === PC_100 && <>
          <BottomBarAddPopup />
          <BottomBarProfilePopup />
        </>}
        <CardItemMenuPopup />
        <PinMenuPopup />
        <BulkEditMenuPopup />
        <CustomEditorPopup />
        <TagEditorPopup />
        <GlobalPopups />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    queryString: state.display.queryString,
    didFetch: state.display.didFetch,
    didFetchSettings: state.display.didFetchSettings,
    isShowingLinkIdsNull: getIsShowingLinkIdsNull(state),
    layoutType: getLayoutType(state),
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToProps = { fetch, endIapConnection };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(Main));
