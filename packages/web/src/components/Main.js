import React from 'react';
import { connect } from 'react-redux';
import Url from 'url-parse';

import { updateHistoryPosition } from '../actions';
import { fetch, endIapConnection } from '../actions/chunk';
import {
  BACK_DECIDER, BACK_POPUP, PC_100, PC_50, PC_33, SHOW_BLANK, SHOW_COMMANDS,
  SM_WIDTH, LG_WIDTH, LAYOUT_LIST, LOCKED,
} from '../types/const';
import {
  getIsShowingLinkIdsNull, getLayoutType, getThemeMode, getSafeAreaWidth,
  getCurrentLockListStatus,
} from '../selectors';

import { withTailwind } from '.';

import TopBarMain from './TopBarMain';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import LockPanel from './LockPanel';
import FetchedPopup from './FetchedPopup';
import CardItemMenuPopup from './CardItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import BulkEditMenuPopup from './BulkEditMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import TagEditorPopup from './TagEditorPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import SettingsTagsMenuPopup from './SettingsTagsMenuPopup';
import PinErrorPopup from './PinErrorPopup';
import TagErrorPopup from './TagErrorPopup';
import {
  SettingsUpdateErrorPopup, SettingsConflictErrorPopup,
} from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import LockEditorPopup from './LockEditorPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';
import SWWUPopup from './SWWUPopup';

class Main extends React.PureComponent {

  componentDidMount() {
    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      // In case there is empty hash /#, remove it.
      const urlObj = new Url(window.location.href, {});
      if (urlObj.hash === '#') urlObj.set('hash', '');
      const href = urlObj.toString();

      window.history.replaceState(BACK_DECIDER, '', href);
      window.history.pushState(BACK_POPUP, '', href);
    }

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
    if (safeAreaWidth >= SM_WIDTH) columnWidth = PC_50;
    if (safeAreaWidth >= LG_WIDTH) columnWidth = PC_33;

    return columnWidth;
  }

  render() {
    const { layoutType, safeAreaWidth, tailwind, lockStatus } = this.props;

    const columnWidth = this.getColumnWidth(safeAreaWidth);
    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ?
      SHOW_COMMANDS : SHOW_BLANK;

    // In Settings, remove a list that makes listName change to MY_LIST
    //   and if not rehydrated yet, loading is shown
    //   so if not rehydrated, show loading under Settings.
    let contentPanel;
    if (lockStatus === LOCKED) {
      contentPanel = (
        <React.Fragment>
          <LockPanel columnWidth={columnWidth} />
          {columnWidth === PC_100 && <BottomBar />}
          <TopBarMain rightPane={topBarRightPane} />
        </React.Fragment>
      );
    } else {
      contentPanel = (
        <React.Fragment>
          {layoutType === LAYOUT_LIST ?
            <ListPanel columnWidth={columnWidth} /> :
            <CardPanel columnWidth={columnWidth} />
          }
          {/* BottomBar before TopBar so listNamePopup's bg in TopBar's above BottomBar */}
          {columnWidth === PC_100 && <BottomBar />}
          <TopBarMain rightPane={topBarRightPane} />
          <FetchedPopup />
          <CardItemMenuPopup />
          <PinMenuPopup />
          <BulkEditMenuPopup />
          <CustomEditorPopup />
          <TagEditorPopup />
        </React.Fragment>
      );
    }

    return (
      <div className={tailwind('min-h-screen bg-white blk:bg-gray-900')}>
        {contentPanel}
        <SettingsPopup />
        <SettingsListsMenuPopup />
        <SettingsTagsMenuPopup />
        <PinErrorPopup />
        <TagErrorPopup />
        <SettingsConflictErrorPopup />
        <SettingsUpdateErrorPopup />
        <ListNamesPopup />
        <LockEditorPopup />
        <ConfirmDeletePopup />
        <ConfirmDiscardPopup />
        <PaywallPopup />
        <AccessErrorPopup />
        <SWWUPopup />
      </div>
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
    lockStatus: getCurrentLockListStatus(state),
  };
};

const mapDispatchToProps = { updateHistoryPosition, fetch, endIapConnection };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(Main));
