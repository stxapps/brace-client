import React from 'react';
import { Animated } from 'react-native';
import { connect } from 'react-redux';

import fileApi from '../apis/localFile';
import { addAppStateChangeListener } from '../actions';
import { fetch } from '../actions/chunk';
import { endIapConnection } from '../actions/iap';
import {
  PC_100, PC_50, PC_33, SHOW_BLANK, SHOW_COMMANDS, SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
  IMAGES, LOCKED,
} from '../types/const';
import {
  getIsShowingLinkIdsNull, getLayoutType, getCurrentLockListStatus,
} from '../selectors';

import { withSafeAreaContext } from '.';

import TopBarMain from './TopBarMain';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import LockPanel from './LockPanel';
import FetchedPopup from './FetchedPopup';
import PinMenuPopup from './PinMenuPopup';
import BulkEditMenuPopup from './BulkEditMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import TagEditorPopup from './TagEditorPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import SettingsTagsMenuPopup from './SettingsTagsMenuPopup';
import TimePickPopup from './TimePickPopup';
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

class Main extends React.PureComponent {

  constructor(props) {
    super(props);

    this.scrollY = new Animated.Value(0);
  }

  componentDidMount() {
    this.props.addAppStateChangeListener();
    this.mkDirAndFetch();
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
  };

  mkDirAndFetch = async () => {
    try {
      const doExist = await fileApi.exists(IMAGES);
      if (!doExist) await fileApi.mkdir(IMAGES);
    } catch (error) {
      console.log('Can\'t make images dir with error: ', error);
    }

    this.props.fetch();
  };

  render() {
    const { layoutType, safeAreaWidth, lockStatus } = this.props;

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
          <TopBarMain rightPane={topBarRightPane} scrollY={this.scrollY} />
        </React.Fragment>
      );
    } else {
      contentPanel = (
        <React.Fragment>
          {layoutType === LAYOUT_LIST ?
            <ListPanel columnWidth={columnWidth} scrollY={this.scrollY} /> :
            <CardPanel columnWidth={columnWidth} scrollY={this.scrollY} />
          }
          {columnWidth === PC_100 && <BottomBar />}
          <TopBarMain rightPane={topBarRightPane} scrollY={this.scrollY} />
          <FetchedPopup />
          <PinMenuPopup />
          <BulkEditMenuPopup />
          <CustomEditorPopup />
          <TagEditorPopup />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {contentPanel}
        <SettingsPopup />
        <SettingsListsMenuPopup />
        <SettingsTagsMenuPopup />
        <TimePickPopup />
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
    lockStatus: getCurrentLockListStatus(state),
  };
};

const mapDispatchToProps = { addAppStateChangeListener, fetch, endIapConnection };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(Main));
