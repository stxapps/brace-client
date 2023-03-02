import React from 'react';
import { connect } from 'react-redux';

import { updateHistoryPosition, fetch, rehydrateStaticFiles } from '../actions';
import {
  BACK_DECIDER, BACK_POPUP, PC_100, PC_50, PC_33, SHOW_BLANK, SHOW_COMMANDS,
  SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
} from '../types/const';
import { getLinks, getLayoutType, getThemeMode, getSafeAreaWidth } from '../selectors';

import { withTailwind } from '.';
import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import FetchedPopup from './FetchedPopup';
import CardItemMenuPopup from './CardItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
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

  componentDidMount() {
    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, '', window.location.href);
      window.history.pushState(BACK_POPUP, '', window.location.href);
    }

    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.listName !== this.props.listName ||
      prevProps.rehydratedListNames !== this.props.rehydratedListNames ||
      prevProps.fetchedListNames !== this.props.fetchedListNames
    ) this.fetch();
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

  render() {
    const {
      listName, links, rehydratedListNames, layoutType, safeAreaWidth, tailwind,
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
            <ListPanel columnWidth={columnWidth} /> :
            <CardPanel columnWidth={columnWidth} />
          }
          {/* BottomBar before TopBar so listNamePopup's bg in TopBar's above BottomBar */}
          {columnWidth === PC_100 && <BottomBar />}
          <TopBar rightPane={topBarRightPane} isListNameShown={true} doSupportTheme={true} />
          <FetchedPopup />
          <CardItemMenuPopup />
          <PinMenuPopup />
          <CustomEditorPopup />
        </React.Fragment>
      );
    }

    return (
      <div className={tailwind('min-h-screen bg-white blk:bg-gray-900')}>
        {contentPanel}
        <SettingsPopup />
        <SettingsListsMenuPopup />
        <PinErrorPopup />
        <SettingsConflictErrorPopup />
        <SettingsUpdateErrorPopup />
        <ListNamesPopup />
        <ConfirmDeletePopup />
        <ConfirmDiscardPopup />
        <PaywallPopup />
        <AccessErrorPopup />
      </div>
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
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
  };
};

const mapDispatchToProps = { updateHistoryPosition, fetch, rehydrateStaticFiles };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(Main));
