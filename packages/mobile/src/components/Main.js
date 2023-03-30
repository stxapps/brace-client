import React from 'react';
import { Animated } from 'react-native';
import { connect } from 'react-redux';

import fileApi from '../apis/localFile';
import { fetch, rehydrateStaticFiles, endIapConnection } from '../actions';
import {
  PC_100, PC_50, PC_33, SHOW_BLANK, SHOW_COMMANDS, SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
  IMAGES,
} from '../types/const';
import { getLinks, getLayoutType } from '../selectors';

import { withSafeAreaContext } from '.';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import FetchedPopup from './FetchedPopup';
import PinMenuPopup from './PinMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import TimePickPopup from './TimePickPopup';
import PinErrorPopup from './PinErrorPopup';
import {
  SettingsUpdateErrorPopup, SettingsConflictErrorPopup,
} from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
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
    this.mkDirAndFetch();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.listName !== this.props.listName ||
      prevProps.rehydratedListNames !== this.props.rehydratedListNames ||
      prevProps.fetchedListNames !== this.props.fetchedListNames
    ) this.fetch();
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

  fetch = () => {
    const { listName, rehydratedListNames, fetchedListNames } = this.props;

    if (!rehydratedListNames.includes(listName)) {
      this.props.rehydrateStaticFiles();
      return;
    }

    if (!fetchedListNames.includes(listName)) this.props.fetch();
  }

  mkDirAndFetch = async () => {
    try {
      const doExist = await fileApi.exists(IMAGES);
      if (!doExist) await fileApi.mkdir(IMAGES);
    } catch (error) {
      console.log('Can\'t make images dir with error: ', error);
    }

    this.fetch();
  }

  render() {
    const {
      listName, links, rehydratedListNames, layoutType, safeAreaWidth,
    } = this.props;

    if (links === null) return <Loading />;

    const columnWidth = this.getColumnWidth(safeAreaWidth);
    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ?
      SHOW_COMMANDS : SHOW_BLANK;

    // In Settings, remove a list that makes listName change to MY_LIST
    //   and if not rehydrated yet, loading is shown
    //   so if not rehydrated, show loading under Settings.
    let contentPanel;
    if (!rehydratedListNames.includes(listName)) {
      contentPanel = <Loading />;
    } else {
      contentPanel = (
        <React.Fragment>
          {layoutType === LAYOUT_LIST ?
            <ListPanel columnWidth={columnWidth} scrollY={this.scrollY} /> :
            <CardPanel columnWidth={columnWidth} scrollY={this.scrollY} />
          }
          {columnWidth === PC_100 && <BottomBar />}
          <TopBar rightPane={topBarRightPane} isListNameShown={true} doSupportTheme={true} scrollY={this.scrollY} />
          <FetchedPopup />
          <PinMenuPopup />
          <CustomEditorPopup />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {contentPanel}
        <SettingsPopup />
        <SettingsListsMenuPopup />
        <TimePickPopup />
        <PinErrorPopup />
        <SettingsUpdateErrorPopup />
        <SettingsConflictErrorPopup />
        <ListNamesPopup />
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
    links: getLinks(state),
    rehydratedListNames: state.display.rehydratedListNames,
    fetchedListNames: state.display.fetchedListNames,
    layoutType: getLayoutType(state),
  };
};

const mapDispatchToProps = { fetch, rehydrateStaticFiles, endIapConnection };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(Main));
